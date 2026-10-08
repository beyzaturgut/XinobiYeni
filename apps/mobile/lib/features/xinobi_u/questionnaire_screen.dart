import 'dart:async';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../catalog/catalog_repository.dart';
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
    try {
      final existing = fresh ? null : await store.sessionFor(widget.productId, widget.variantId);
      XinobiUSession? current;
      if (existing != null) {
        try {
          current = await repository.session(existing);
          // A finished design is not reopened from the product card: the user gets new questions (web rule).
          // Unfinished questionnaires resume and running jobs keep polling.
          if (current.status == 'ready' || current.status == 'failed') current = null;
        } on XinobiUException catch (error) {
          if (!error.sessionGone) rethrow;
          await store.forgetSession(widget.productId, widget.variantId);
        }
      }
      current ??= await repository.createSession(productId: widget.productId, variantId: widget.variantId);
      await store.rememberSession(widget.productId, widget.variantId, current.id);
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
        return _Result(session: current!, onRestart: () => _start(fresh: true));
    }
  }
}

class _Result extends StatefulWidget {
  const _Result({required this.session, required this.onRestart});
  final XinobiUSession session;
  final VoidCallback onRestart;
  @override
  State<_Result> createState() => _ResultState();
}

class _ResultState extends State<_Result> {
  bool onProduct = true;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final session = widget.session;
    return ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
      Semantics(header: true, child: Text('İşte sana özel yorum.', style: text.headlineSmall)),
      const SizedBox(height: 12),
      SegmentedButton<bool>(
        segments: const [ButtonSegment(value: true, label: Text('Ürünümde')), ButtonSegment(value: false, label: Text('Desen'))],
        selected: {onProduct},
        onSelectionChanged: (value) => setState(() => onProduct = value.first),
      ),
      const SizedBox(height: 12),
      AspectRatio(
        aspectRatio: 1,
        child: ColoredBox(
          color: XinobiTokens.surface,
          child: onProduct
              ? _ProductPreview(productId: session.product.id, variantId: session.variant.id, productUrl: session.variant.imageUrl, patternUrl: session.imageUrl, label: '${session.product.name} ${session.variant.color} üzerinde AI tasarımının temsili önizlemesi')
              : RemoteImage(session.imageUrl, label: 'AI tarafından üretilen desen', fit: BoxFit.cover),
        ),
      ),
      const SizedBox(height: 8),
      // K-12: the "Temsilidir" notice is permanent, readable text.
      Text('Temsilidir. Dijital önizlemedir; baskı ölçüsü ve renk onayı değildir.', style: text.bodySmall),
      const SizedBox(height: 20),
      OutlinedButton(onPressed: widget.onRestart, child: const Text('Yeni anket başlat')),
    ]);
  }
}

/// The design on the selected colour's photo, limited to the surface the admin approved for that colour (Ürün yüzeyleri).
/// Colours without an approved mask keep the simple representative overlay.
class _ProductPreview extends ConsumerWidget {
  const _ProductPreview({required this.productId, required this.variantId, required this.productUrl, required this.patternUrl, required this.label});
  final String productId;
  final String variantId;
  final String? productUrl;
  final String? patternUrl;
  final String label;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final variants = ref.watch(productProvider(productId)).value?.variants;
    final mask = variants?.where((variant) => variant.id == variantId).firstOrNull?.surfaceMaskUrl;
    return Semantics(
      label: label,
      image: true,
      excludeSemantics: true,
      child: mask != null && productUrl != null && patternUrl != null
          ? _MaskedPreview(productUrl: productUrl!, patternUrl: patternUrl!, maskUrl: mask, fallback: _overlay())
          : _overlay(),
    );
  }

  Widget _overlay() => Stack(fit: StackFit.expand, children: [
        RemoteImage(productUrl),
        Align(
          alignment: const Alignment(-0.08, 0.05),
          child: FractionallySizedBox(
            widthFactor: 0.34,
            heightFactor: 0.42,
            child: ClipRRect(
              borderRadius: BorderRadius.circular(XinobiTokens.radiusMedium),
              child: Opacity(opacity: 0.88, child: RemoteImage(patternUrl, fit: BoxFit.cover)),
            ),
          ),
        ),
      ]);
}

class _MaskedPreview extends StatefulWidget {
  const _MaskedPreview({required this.productUrl, required this.patternUrl, required this.maskUrl, required this.fallback});
  final String productUrl;
  final String patternUrl;
  final String maskUrl;
  final Widget fallback;
  @override
  State<_MaskedPreview> createState() => _MaskedPreviewState();
}

class _MaskedPreviewState extends State<_MaskedPreview> {
  List<ui.Image>? images;
  bool failed = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(_MaskedPreview old) {
    super.didUpdateWidget(old);
    if (old.productUrl != widget.productUrl || old.patternUrl != widget.patternUrl || old.maskUrl != widget.maskUrl) _load();
  }

  Future<void> _load() async {
    try {
      final loaded = await Future.wait([widget.productUrl, widget.patternUrl, widget.maskUrl].map(_image));
      if (mounted) setState(() => images = loaded);
    } catch (_) {
      if (mounted) setState(() => failed = true);
    }
  }

  static Future<ui.Image> _image(String url) {
    final done = Completer<ui.Image>();
    final stream = NetworkImage(url).resolve(ImageConfiguration.empty);
    late final ImageStreamListener listener;
    listener = ImageStreamListener((info, _) {
      done.complete(info.image);
      stream.removeListener(listener);
    }, onError: (error, stack) {
      done.completeError(error, stack);
      stream.removeListener(listener);
    });
    stream.addListener(listener);
    return done.future;
  }

  @override
  Widget build(BuildContext context) {
    final loaded = images;
    if (failed || loaded == null) return widget.fallback;
    return CustomPaint(painter: _MaskedPainter(loaded[0], loaded[1], loaded[2]));
  }
}

/// Photo, then a layer of pattern with the photo multiplied in (the body keeps its shading), clipped to the approved mask.
class _MaskedPainter extends CustomPainter {
  _MaskedPainter(this.product, this.pattern, this.mask);
  final ui.Image product;
  final ui.Image pattern;
  final ui.Image mask;

  static Rect _all(ui.Image image) => Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble());

  @override
  void paint(Canvas canvas, Size size) {
    final fitted = applyBoxFit(BoxFit.contain, Size(product.width.toDouble(), product.height.toDouble()), size);
    final target = Alignment.center.inscribe(fitted.destination, Offset.zero & size);
    final cover = applyBoxFit(BoxFit.cover, Size(pattern.width.toDouble(), pattern.height.toDouble()), target.size);
    final paint = Paint()..filterQuality = FilterQuality.medium;
    canvas.drawImageRect(product, _all(product), target, paint);
    canvas.saveLayer(target, Paint());
    canvas.drawImageRect(pattern, Alignment.center.inscribe(cover.source, _all(pattern)), target, paint);
    canvas.drawImageRect(product, _all(product), target, Paint()..blendMode = BlendMode.multiply..color = const Color(0x73000000));
    canvas.drawImageRect(mask, _all(mask), target, Paint()..blendMode = BlendMode.dstIn);
    canvas.restore();
  }

  @override
  bool shouldRepaint(_MaskedPainter old) => old.product != product || old.pattern != pattern || old.mask != mask;
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
