import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../account/auth.dart';
import '../catalog/catalog_repository.dart';
import '../designs/designs.dart';
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
        appBar: AppBar(
          backgroundColor: XinobiTokens.header,
          foregroundColor: XinobiTokens.onHeader,
          toolbarHeight: XinobiTokens.headerHeight,
          title: const Text('XINOBI U'),
        ),
        body: SafeArea(top: false, child: _body(context)),
      ),
    );
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
        return Column(children: [
          LinearProgressIndicator(value: (step + 1) / current.questions.length, color: XinobiTokens.ink, backgroundColor: XinobiTokens.line),
          Expanded(
            child: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
              Text('Soru ${step + 1} / ${current.questions.length}', style: text.bodySmall),
              const SizedBox(height: 4),
              Text(question.axisLabel.toUpperCase(), style: text.bodySmall?.copyWith(letterSpacing: 1.2)),
              const SizedBox(height: 8),
              Semantics(header: true, child: Text(question.text, style: text.titleLarge)),
              const SizedBox(height: 16),
              RadioGroup<String>(
                groupValue: selected,
                onChanged: (value) => value == null ? null : _choose(question.id, value),
                child: Column(children: [
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
                ]),
              ),
            ]),
          ),
          _BottomBar(children: [
            if (step > 0) OutlinedButton(onPressed: () => setState(() => step--), child: const Text('← Geri')),
            Expanded(
              child: FilledButton(
                onPressed: selected == null ? null : _next,
                child: Text(step == current.questions.length - 1 ? 'Tercihlerimi gör →' : 'Devam et →'),
              ),
            ),
          ]),
        ]);
      case _Phase.review:
        return Column(children: [
          Expanded(
            child: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
              Semantics(header: true, child: Text('Birlikte şekillenen beş tercih.', style: text.headlineSmall)),
              const SizedBox(height: 16),
              for (final question in current!.questions)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(question.axisLabel, style: text.bodySmall),
                    Text(question.options.firstWhere((option) => option.id == answers[question.id]).label, style: text.titleMedium),
                  ]),
                ),
              const SizedBox(height: 8),
              Text('Oluştur dediğinde yanıtlarına göre tek bir AI görseli üretilir; yanıtlar bu tasarım için kilitlenir.', style: text.bodySmall),
              if (message != null) ...[
                const SizedBox(height: 12),
                Semantics(liveRegion: true, child: Text(message!, style: text.bodyMedium?.copyWith(color: XinobiTokens.danger))),
              ],
            ]),
          ),
          _BottomBar(children: [
            OutlinedButton(
              onPressed: busy
                  ? null
                  : () => setState(() {
                        phase = _Phase.questions;
                        step = 0;
                      }),
              child: const Text('Düzenle'),
            ),
            Expanded(child: FilledButton(onPressed: busy ? null : _generate, child: Text(busy ? 'Gönderiliyor…' : 'AI ile tasarımımı oluştur ✦'))),
          ]),
        ]);
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
        return _Result(
          session: current!,
          onRestart: () => _start(fresh: true),
          onOpenPreview: () => context.push(Uri(
            path: '/xinobi-u/mobil-onizleme',
            queryParameters: {'session': current.id},
          ).toString()),
        );
    }
  }
}

class _Result extends ConsumerStatefulWidget {
  const _Result({required this.session, required this.onRestart, required this.onOpenPreview});
  final XinobiUSession session;
  final VoidCallback onRestart;
  final VoidCallback onOpenPreview;
  @override
  ConsumerState<_Result> createState() => _ResultState();
}

class _ResultState extends ConsumerState<_Result> {
  bool saving = false;
  MyDesign? saved;

  /// K-21: copies the design into the account so it outlives the session; saved once, reused by "Sepete ekle".
  Future<MyDesign?> _save({bool announce = true}) async {
    if (saved != null) return saved;
    final messenger = ScaffoldMessenger.of(context);
    setState(() => saving = true);
    try {
      final design = await ref.read(authProvider.notifier).withSession((repository, token) => repository.saveDesign(token, widget.session.id));
      ref.invalidate(myDesignsProvider);
      if (mounted) setState(() => saved = design);
      if (announce && mounted) messenger.showSnackBar(SnackBar(showCloseIcon: true, content: const Text('Tasarım hesabına kaydedildi.'), action: SnackBarAction(label: 'Tasarımlarım', onPressed: () => context.push('/hesap/tasarimlarim'))));
      return design;
    } on AccountException catch (error) {
      messenger.showSnackBar(SnackBar(content: Text(error.message)));
      return null;
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  /// A cart line needs a saved design, so the result is saved to the account first.
  Future<void> _addToCart() async {
    final design = await _save(announce: false);
    if (design == null || !mounted) return;
    await context.push(Uri(path: '/tasarim-editoru', queryParameters: {'tasarim': design.id, 'urun': design.productId, 'renk': widget.session.variant.id}).toString());
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final session = widget.session;
    return ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
      Semantics(header: true, child: Text('İşte sana özel yorum.', style: text.headlineSmall)),
      const SizedBox(height: 12),
      AspectRatio(
        aspectRatio: 1,
        child: ColoredBox(
          color: XinobiTokens.surface,
          child: RemoteImage(session.imageUrl, label: 'AI tarafından üretilen desen', fit: BoxFit.cover),
        ),
      ),
      const SizedBox(height: 8),
      // K-12: the "Temsilidir" notice is permanent, readable text.
      Text('Temsilidir. Dijital önizlemedir; baskı ölçüsü ve renk onayı değildir.', style: text.bodySmall),
      const SizedBox(height: 20),
      OutlinedButton.icon(onPressed: () { ScaffoldMessenger.of(context).hideCurrentSnackBar(); widget.onOpenPreview(); }, icon: const Icon(Icons.open_in_new), label: const Text('Üründe gelişmiş önizlemeyi aç')),
      const SizedBox(height: 8),
      if (ref.watch(authProvider) is SignedIn) ...[
        FilledButton.icon(onPressed: saving ? null : _addToCart, icon: const Icon(Icons.add_shopping_cart), label: Text(saving ? 'Hazırlanıyor…' : 'Üründe yerleştir ve sepete ekle')),
        const SizedBox(height: 8),
        OutlinedButton(onPressed: saving || saved != null ? null : _save, child: Text(saved != null ? 'Tasarımlarım’a kaydedildi' : 'Tasarımımı kaydet')),
      ] else
        OutlinedButton(onPressed: () => context.go('/hesap'), child: const Text('Sepete eklemek ve kaydetmek için giriş yap')),
      const SizedBox(height: 8),
      OutlinedButton(onPressed: () => context.push('/tasarim-editoru?urun=${Uri.encodeQueryComponent(session.product.id)}&renk=${Uri.encodeQueryComponent(session.variant.id)}'), child: const Text('Kendi görselimle dene')),
      const SizedBox(height: 8),
      OutlinedButton(onPressed: widget.onRestart, child: const Text('Yeni anket başlat')),
    ]);
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
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            if (busy) ...[const CircularProgressIndicator(semanticsLabel: 'Tasarım hazırlanıyor'), const SizedBox(height: 20)],
            Semantics(liveRegion: true, child: Text(message, textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium)),
            if (action != null) ...[const SizedBox(height: 16), FilledButton(onPressed: onAction, child: Text(action!))],
          ]),
        ),
      );
}

class _BottomBar extends StatelessWidget {
  const _BottomBar({required this.children});
  final List<Widget> children;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 8, XinobiTokens.gutterMobile, 16),
        child: Row(spacing: 12, children: children),
      );
}
