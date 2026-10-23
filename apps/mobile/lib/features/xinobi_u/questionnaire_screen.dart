import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../app/theme.dart';
import '../../widgets/common.dart';
import '../account/auth.dart';
import '../catalog/catalog_repository.dart';
import '../designs/designs.dart';
import 'flow_widgets.dart';
import 'xinobi_u_repository.dart';

enum _Phase { loading, questions, review, generating, ready, failed, error }

/// Five questions (one per axis, four choices each), a review, then one server-side generation.
/// The session id and answers live on the device so a restart resumes; the server never repeats a provider call for the same answers.
class QuestionnaireScreen extends ConsumerStatefulWidget {
  const QuestionnaireScreen({super.key, required this.productId, this.variantId, this.pollInterval = const Duration(seconds: 2)});
  final String productId;

  /// Optional: set when the user starts from a product page with a colour already shown; otherwise the server picks one.
  final String? variantId;
  final Duration pollInterval;

  @override
  ConsumerState<QuestionnaireScreen> createState() => _QuestionnaireScreenState();
}

class _QuestionnaireScreenState extends ConsumerState<QuestionnaireScreen> {
  // The server stops waiting for the provider after 120 s; the app gives it a little longer before suggesting a refresh.
  static const _maxWait = Duration(seconds: 150);

  _Phase phase = _Phase.loading;
  XinobiUSession? session;
  Map<String, String> answers = {};
  int step = 0;
  String? message;
  bool busy = false;
  bool slow = false;
  Timer? poller;
  DateTime? waitingSince;

  XinobiURepository get repository => ref.read(xinobiURepositoryProvider);
  XinobiULocalStore get store => ref.read(xinobiULocalStoreProvider);

  @override
  void initState() {
    super.initState();
    _start();
  }

  @override
  void dispose() {
    poller?.cancel();
    super.dispose();
  }

  Future<void> _start({bool fresh = false}) async {
    poller?.cancel();
    setState(() {
      phase = _Phase.loading;
      message = null;
      slow = false;
    });
    final variantId = widget.variantId;
    if (variantId == null || variantId.isEmpty) {
      setState(() {
        phase = _Phase.error;
        message = 'Önce ürününü ve rengini seçmelisin.';
      });
      return;
    }
    try {
      final detail = await ref.read(productProvider(widget.productId).future);
      final selectedVariant = detail.variants.where((variant) => variant.id == variantId).firstOrNull;
      final remoteReady = selectedVariant == null || selectedVariant.surfaceMaskUrl?.isNotEmpty == true
          ? true
          : await ref.read(acceptedSurfaceProvider((productId: widget.productId, variantId: variantId)).future);
      if (selectedVariant == null || selectedVariant.imageUrl == null || remoteReady != true) {
        setState(() {
          phase = _Phase.error;
          message = remoteReady == false ? 'Bu renk için onaylı ürün önizlemesi bulunmuyor.' : 'Bu rengin önizleme uygunluğu doğrulanamadı.';
        });
        return;
      }
      final existing = fresh ? null : await store.sessionFor(widget.productId, variantId);
      XinobiUSession? current;
      if (existing != null) {
        try {
          current = await repository.session(existing);
          // A finished design is not reopened from the product card: the user gets new questions (web rule).
          // Unfinished questionnaires resume and running jobs keep polling.
          if (current.status == 'ready' || current.status == 'failed') current = null;
        } on XinobiUException catch (error) {
          if (!error.sessionGone) rethrow;
          await store.forgetSession(widget.productId, variantId);
        }
      }
      current ??= await repository.createSession(productId: widget.productId, variantId: variantId);
      if (current.product.id != widget.productId || current.variant.id != variantId) {
        setState(() {
          phase = _Phase.error;
          message = 'Seçilen ürün ve renk doğrulanamadı.';
        });
        return;
      }
      await store.rememberSession(widget.productId, variantId, current.id);
      final saved = await store.answers(current.id);
      if (!mounted) return;
      _apply(current, restoredAnswers: saved);
    } on XinobiUException catch (error) {
      if (mounted) {
        setState(() {
          phase = _Phase.error;
          message = error.message;
        });
      }
    } on CatalogException catch (error) {
      if (mounted) {
        setState(() {
          phase = _Phase.error;
          message = error.message;
        });
      }
    }
  }

  void _apply(XinobiUSession next, {Map<String, String>? restoredAnswers}) {
    setState(() {
      session = next;
      if (restoredAnswers != null) answers = {...restoredAnswers, for (final answer in next.answers) answer.questionId: answer.optionId};
      switch (next.status) {
        case 'questionnaire':
          phase = answers.length == next.questions.length ? _Phase.review : _Phase.questions;
          step = next.questions.indexWhere((question) => !answers.containsKey(question.id)).clamp(0, next.questions.length - 1);
        case 'queued' || 'running':
          phase = _Phase.generating;
          _poll();
        case 'ready':
          phase = _Phase.ready;
        default:
          phase = _Phase.failed;
          message = next.errorMessage ?? 'Görsel üretimi tamamlanamadı.';
      }
    });
  }

  void _poll() {
    poller?.cancel();
    waitingSince ??= DateTime.now();
    poller = Timer(widget.pollInterval, () async {
      final current = session;
      if (current == null || !mounted) return;
      try {
        final next = await repository.session(current.id);
        if (!mounted) return;
        if (next.status == 'queued' || next.status == 'running') {
          if (DateTime.now().difference(waitingSince!) > _maxWait) {
            setState(() => slow = true);
            return;
          }
          session = next;
          _poll();
        } else {
          waitingSince = null;
          _apply(next);
        }
      } on XinobiUException {
        // A dropped poll is retried on the next tick; the job itself keeps running on the server.
        if (mounted) _poll();
      }
    });
  }

  Future<void> _choose(String questionId, String optionId) async {
    setState(() => answers = {...answers, questionId: optionId});
    await store.saveAnswers(session!.id, answers);
  }

  void _next() {
    final total = session!.questions.length;
    if (step < total - 1) {
      setState(() => step++);
    } else {
      setState(() => phase = _Phase.review);
    }
  }

  Future<void> _generate() async {
    // A second tap in the same frame must not start a second provider call.
    if (busy || phase != _Phase.review) return;
    busy = true;
    setState(() {
      busy = true;
      message = null;
    });
    try {
      final next = await repository.generate(session!.id, answers);
      if (!mounted) return;
      busy = false;
      _apply(next);
    } on XinobiUException catch (error) {
      if (!mounted) return;
      setState(() {
        busy = false;
        message = error.message;
        if (error.sessionGone) phase = _Phase.error;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final inQuestions = phase == _Phase.questions && step > 0;
    return PopScope(
      // System back steps through the questions before leaving the flow.
      canPop: !inQuestions && phase != _Phase.review,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        setState(() => phase == _Phase.review ? phase = _Phase.questions : step--);
      },
      child: Scaffold(
        appBar: AppBar(backgroundColor: XinobiTokens.header, foregroundColor: XinobiTokens.onHeader, toolbarHeight: XinobiTokens.headerHeight, title: const Text('XINOBI U')),
        body: SafeArea(top: false, bottom: false, child: _body(context)),
        // Actions sit in the scaffold's footer: above the system navigation, and snack bars appear above them.
        bottomNavigationBar: _actions(context),
      ),
    );
  }

  Widget? _actions(BuildContext context) {
    final current = session;
    final Widget bar;
    switch (phase) {
      case _Phase.questions:
        final selected = answers[current!.questions[step].id];
        bar = _BottomBar(
          children: [
            if (step > 0) OutlinedButton(style: flowSecondaryButton, onPressed: () => setState(() => step--), child: const Text('← Geri')),
            Expanded(
              child: FilledButton(style: flowPrimaryButton, onPressed: selected == null ? null : _next, child: Text(step == current.questions.length - 1 ? 'Tercihlerimi gör →' : 'Devam et →')),
            ),
          ],
        );
      case _Phase.review:
        bar = _BottomBar(
          children: [
            OutlinedButton(
              style: flowSecondaryButton,
              onPressed: busy
                  ? null
                  : () => setState(() {
                      phase = _Phase.questions;
                      step = 0;
                    }),
              child: const Text('Düzenle'),
            ),
            Expanded(
              child: FilledButton(style: flowPrimaryButton, onPressed: busy ? null : _generate, child: Text(busy ? 'Gönderiliyor…' : 'AI ile tasarımımı oluştur ✦')),
            ),
          ],
        );
      case _Phase.ready:
        // The one way forward from a raw design is to place it on the product.
        bar = _BottomBar(
          children: [
            Expanded(
              child: FilledButton(
                style: flowPrimaryButton,
                onPressed: () {
                  ScaffoldMessenger.of(context).hideCurrentSnackBar();
                  context.push(Uri(path: '/xinobi-u/mobil-onizleme', queryParameters: {'session': current!.id}).toString());
                },
                child: const Text('Üründe önizle ve yerleştir →'),
              ),
            ),
          ],
        );
      default:
        return null;
    }
    return SafeArea(top: false, child: bar);
  }

  Widget _body(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final current = session;
    switch (phase) {
      case _Phase.loading:
        return const LoadingView();
      case _Phase.error:
        return _Message(message: message ?? 'Bir sorun oluştu.', action: 'Yeni anket başlat', onAction: () => _start(fresh: true));
      case _Phase.failed:
        return _Message(message: message!, action: 'Yeni anket başlat', onAction: () => _start(fresh: true));
      case _Phase.questions:
        final question = current!.questions[step];
        final selected = answers[question.id];
        return Column(
          children: [
            LinearProgressIndicator(value: (step + 1) / current.questions.length, color: XinobiTokens.ink, backgroundColor: XinobiTokens.line),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(XinobiTokens.gutterMobile),
                children: [
                  Text('Soru ${step + 1} / ${current.questions.length}', style: text.bodySmall),
                  const SizedBox(height: 4),
                  Text(question.axisLabel.toUpperCase(), style: text.bodySmall?.copyWith(letterSpacing: 1.2)),
                  const SizedBox(height: 8),
                  Semantics(header: true, child: Text(question.text, style: text.titleLarge)),
                  const SizedBox(height: 16),
                  RadioGroup<String>(
                    groupValue: selected,
                    onChanged: (value) => value == null ? null : _choose(question.id, value),
                    child: Column(
                      children: [
                        for (final option in question.options)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            // Material (not a coloured box) so the tile's touch ripple stays visible.
                            child: Material(
                              color: XinobiTokens.surface,
                              shape: Border.all(color: option.id == selected ? XinobiTokens.ink : XinobiTokens.line, width: option.id == selected ? 2 : 1),
                              child: RadioListTile<String>(value: option.id, title: Text(option.label)),
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      case _Phase.review:
        return Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.all(XinobiTokens.gutterMobile),
                children: [
                  Semantics(header: true, child: Text('Birlikte şekillenen beş tercih.', style: flowTitle)),
                  const SizedBox(height: 16),
                  _AnswerSummary(
                    rows: [for (final question in current!.questions) (label: question.axisLabel, answer: question.options.firstWhere((option) => option.id == answers[question.id]).label)],
                  ),
                  const SizedBox(height: 14),
                  Text('Oluştur dediğinde yanıtlarına göre tek bir AI görseli üretilir; yanıtlar bu tasarım için kilitlenir.', style: inter(13, height: 1.45, color: flowMuted)),
                  if (message != null) ...[
                    const SizedBox(height: 12),
                    Semantics(
                      liveRegion: true,
                      child: Text(message!, style: text.bodyMedium?.copyWith(color: XinobiTokens.danger)),
                    ),
                  ],
                ],
              ),
            ),
          ],
        );
      case _Phase.generating:
        return _Message(
          message: slow ? 'Üretim beklenenden uzun sürüyor. Durumu yenileyebilirsin; istek tekrar gönderilmez.' : 'Tasarımın hazırlanıyor. Bu genellikle birkaç saniye sürer.',
          busy: !slow,
          action: slow ? 'Durumu yenile' : null,
          onAction: () {
            setState(() => slow = false);
            waitingSince = DateTime.now();
            _poll();
          },
        );
      case _Phase.ready:
        return _Result(session: current!, onRestart: () => _start(fresh: true));
    }
  }
}

class _Result extends ConsumerStatefulWidget {
  const _Result({required this.session, required this.onRestart});
  final XinobiUSession session;
  final VoidCallback onRestart;
  @override
  ConsumerState<_Result> createState() => _ResultState();
}

class _ResultState extends ConsumerState<_Result> {
  bool saving = false;
  MyDesign? saved;

  /// K-21: copies the raw design into the account so it outlives the session. Cart and favourites belong to the
  /// product preview, where the design is placed on the chosen colour.
  Future<void> _save() async {
    if (saved != null || saving) return;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => saving = true);
    try {
      final design = await ref.read(authProvider.notifier).withSession((repository, token) => repository.saveDesign(token, widget.session.id));
      ref.invalidate(myDesignsProvider);
      if (mounted) {
        setState(() => saved = design);
        messenger.showSnackBar(
          SnackBar(
            showCloseIcon: true,
            content: const Text('Tasarım hesabına kaydedildi.'),
            action: SnackBarAction(label: 'Tasarımlarım', onPressed: () => context.push('/hesap/tasarimlarim')),
          ),
        );
      }
    } on AccountException catch (error) {
      messenger.showSnackBar(SnackBar(content: Text(error.message)));
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  /// Signs in above the result and returns to it, so the generated design is not left behind.
  Future<void> _signIn() async {
    final subscription = ref.listenManual(authProvider, (previous, next) {
      if (next is SignedIn && mounted && context.canPop()) context.pop();
    });
    try {
      await context.push('/giris');
    } finally {
      subscription.close();
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = widget.session;
    final identity = 'urun=${Uri.encodeQueryComponent(session.product.id)}&renk=${Uri.encodeQueryComponent(session.variant.id)}';
    return ListView(
      padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 14, XinobiTokens.gutterMobile, 16),
      children: [
        const FlowKicker('XINOBI U · AI TASARIMI'),
        Semantics(header: true, child: Text('İşte sana özel yorum.', style: flowTitle)),
        const SizedBox(height: 14),
        ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: AspectRatio(
            aspectRatio: 1,
            child: ColoredBox(
              color: flowStage,
              child: RemoteImage(session.imageUrl, label: 'AI tarafından üretilen desen', fit: BoxFit.cover),
            ),
          ),
        ),
        const SizedBox(height: 8),
        // K-12: the "Temsilidir" notice is permanent, readable text.
        Text('Temsilidir. Dijital önizlemedir; baskı ölçüsü ve renk onayı değildir.', style: inter(12, height: 1.4, color: flowMuted)),
        const SizedBox(height: 10),
        Text('Rengi ve yerleşimi üründe ayarla; sepete ve favorilere oradan ekleyebilirsin.', style: inter(14, height: 1.45, color: flowBody)),
        const SizedBox(height: 16),
        if (ref.watch(authProvider) is SignedIn)
          OutlinedButton(
            style: flowSecondaryButton,
            onPressed: saving || saved != null ? null : _save,
            child: Text(
              saved != null
                  ? 'Tasarımlarım’a kaydedildi'
                  : saving
                  ? 'Kaydediliyor…'
                  : 'Tasarımımı kaydet',
            ),
          )
        else
          OutlinedButton(style: flowSecondaryButton, onPressed: _signIn, child: const Text('Kaydetmek için giriş yap')),
        const SizedBox(height: 8),
        OutlinedButton(style: flowSecondaryButton, onPressed: () => context.push('/xinobi-u/kendi-gorselin?$identity'), child: const Text('Kendi görselimle dene')),
        const SizedBox(height: 4),
        TextButton(
          onPressed: widget.onRestart,
          child: Text('Yeni anket başlat', style: inter(14, weight: 500, color: flowInk)),
        ),
      ],
    );
  }
}

/// The five chosen answers on one soft card: a small axis label above each answer, hairlines between rows.
class _AnswerSummary extends StatelessWidget {
  const _AnswerSummary({required this.rows});
  final List<({String label, String answer})> rows;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: flowStage, borderRadius: BorderRadius.circular(16)),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var index = 0; index < rows.length; index++)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: index == rows.length - 1
                  ? null
                  : const BoxDecoration(
                      border: Border(bottom: BorderSide(color: flowLine)),
                    ),
              child: MergeSemantics(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(rows[index].label, style: inter(12, color: flowMuted)),
                    const SizedBox(height: 3),
                    Text(rows[index].answer, style: inter(15, weight: 600, height: 1.3, color: flowInk)),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({required this.message, this.action, this.onAction, this.busy = false});
  final String message;
  final String? action;
  final VoidCallback? onAction;
  final bool busy;

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (busy) ...[const CircularProgressIndicator(semanticsLabel: 'Tasarım hazırlanıyor'), const SizedBox(height: 20)],
          Semantics(
            liveRegion: true,
            child: Text(message, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
          ),
          if (action != null) ...[const SizedBox(height: 16), FilledButton(onPressed: onAction, child: Text(action!))],
        ],
      ),
    ),
  );
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.children});
  final List<Widget> children;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 10, XinobiTokens.gutterMobile, 10),
    decoration: const BoxDecoration(
      color: XinobiTokens.surface,
      border: Border(top: BorderSide(color: flowLine)),
    ),
    child: Row(spacing: 10, children: children),
  );
}
