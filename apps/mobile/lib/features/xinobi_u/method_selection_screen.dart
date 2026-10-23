import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../app/theme.dart';
import '../../widgets/common.dart';
import '../catalog/catalog_repository.dart';
import 'flow_widgets.dart';

enum DesignMethod { ask, image, pattern }

const _methods = [
  (method: DesignMethod.ask, title: 'Sorularla tasarla', description: 'Birkaç soruyu yanıtla, sana özel tasarımı birlikte oluşturalım.', cta: 'Sorulara başla', icon: Icons.quiz_outlined),
  (method: DesignMethod.image, title: 'Kendi görselini ekle', description: 'Dilediğin fotoğrafı ya da görseli yükleyerek ürününü kişiselleştir.', cta: 'Görsel yükle', icon: Icons.image_outlined),
  (method: DesignMethod.pattern, title: 'Kendi desenini yükle', description: 'Desenin, ürünün onaylı kişiselleştirme alanının tamamına uygulanır.', cta: 'Desen yükle', icon: Icons.grid_view_outlined),
];

/// XINOBI U step 2 (design "Yöntem seçimi"): how the design is made. The colour is chosen later, on the placement
/// preview; the flow starts from the requested colour when it has its own accepted surface, otherwise from the first
/// colour that has one. Another colour's mask is never borrowed.
class XinobiUMethodScreen extends ConsumerStatefulWidget {
  const XinobiUMethodScreen({super.key, required this.productId, this.variantId});

  final String productId;

  /// The colour selected on the product page, if any.
  final String? variantId;

  @override
  ConsumerState<XinobiUMethodScreen> createState() => _XinobiUMethodScreenState();
}

class _XinobiUMethodScreenState extends ConsumerState<XinobiUMethodScreen> {
  DesignMethod _method = DesignMethod.image;
  bool _opening = false;

  void _open(ProductDetail detail, VariantDetail start) {
    if (_opening) return;
    setState(() => _opening = true);
    final identity = 'urun=${Uri.encodeQueryComponent(detail.id)}&renk=${Uri.encodeQueryComponent(start.id)}';
    final location = switch (_method) {
      DesignMethod.ask => '/xinobi-u/anket?$identity',
      DesignMethod.image => '/xinobi-u/kendi-gorselin?$identity',
      DesignMethod.pattern => '/xinobi-u/kendi-gorselin?$identity&mod=desen',
    };
    context.push(location).whenComplete(() {
      if (mounted) setState(() => _opening = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productProvider(widget.productId));
    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: const Text('XINOBI U'),
      ),
      body: state.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(productProvider(widget.productId))),
        data: (detail) => _body(context, detail),
      ),
      // The action stays pinned above the system navigation like other app steps; the app bar handles going back.
      bottomNavigationBar: state.asData?.value == null ? null : _action(state.asData!.value),
    );
  }

  ({List<VariantDetail> variants, VariantDetail? start, bool settled, bool failed}) _readiness(ProductDetail detail) {
    final variants = detail.variants.toList();
    // Each colour is ready with a catalogue mask or an accepted development surface.
    final checks = {
      for (final variant in variants)
        variant.id: variant.surfaceMaskUrl?.isNotEmpty == true
            ? const AsyncValue<bool?>.data(true)
            : ref.watch(acceptedSurfaceProvider((productId: detail.id, variantId: variant.id))),
    };
    bool ready(VariantDetail variant) => checks[variant.id]?.asData?.value == true;
    final requested = variants.where((variant) => variant.id == widget.variantId).firstOrNull;
    final settled = checks.values.every((check) => check.hasValue || check.hasError);
    final failed = checks.values.any((check) => check.hasError || (check.hasValue && check.asData?.value == null));
    final start = requested != null && ready(requested) ? requested : settled ? variants.where(ready).firstOrNull : null;
    return (variants: variants, start: start, settled: settled, failed: failed);
  }

  Widget _action(ProductDetail detail) {
    final (:variants, :start, :settled, :failed) = _readiness(detail);
    final chosen = _methods.firstWhere((item) => item.method == _method);
    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 10, XinobiTokens.gutterMobile, 10),
        decoration: const BoxDecoration(color: XinobiTokens.surface, border: Border(top: BorderSide(color: flowLine))),
        child: FilledButton(
          style: flowPrimaryButton,
          onPressed: start != null && !_opening
              ? () => _open(detail, start)
              : settled && failed
                  ? () {
                      for (final variant in variants) {
                        ref.invalidate(acceptedSurfaceProvider((productId: detail.id, variantId: variant.id)));
                      }
                    }
                  : null,
          child: Text(start != null ? '${chosen.cta} →' : settled && failed ? 'Tekrar dene' : !settled ? 'Kontrol ediliyor…' : 'Kişiselleştirme kullanılamıyor'),
        ),
      ),
    );
  }

  Widget _body(BuildContext context, ProductDetail detail) {
    final (:variants, :start, :settled, :failed) = _readiness(detail);
    final shown = variants.where((variant) => variant.id == widget.variantId).firstOrNull ?? (variants.isEmpty ? null : variants.first);
    final image = shown?.imageUrl ?? detail.imageUrl;

    return ListView(
      padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 14, XinobiTokens.gutterMobile, 16),
      children: [
        const XinobiUSteps(current: 1),
        const SizedBox(height: 16),
        FlowProductCard(name: detail.name, imageUrl: image, onOtherProduct: () => context.go('/xinobi-u')),
        const SizedBox(height: 20),
        const FlowKicker('XINOBI U · ADIM 2 / 4'),
        Semantics(header: true, child: Text('Tasarımını nasıl oluşturmak istersin?', style: flowTitle)),
        const SizedBox(height: 6),
        Text('Bir yöntem seç. Ürün rengini ve yerleşimi bir sonraki adımda, önizleme üzerinde ayarlayabilirsin.', style: inter(14, height: 1.45, color: flowBody)),
        const SizedBox(height: 16),
        Text('Tasarım yöntemi', style: inter(13, weight: 500)),
        const SizedBox(height: 8),
        for (final item in _methods) ...[
          _MethodCard(
            title: item.title,
            description: item.description,
            icon: item.icon,
            recommended: item.method == DesignMethod.ask,
            selected: item.method == _method,
            onTap: () => setState(() => _method = item.method),
          ),
          const SizedBox(height: 8),
        ],
        if (start == null) ...[
          const SizedBox(height: 4),
          Semantics(
            liveRegion: true,
            child: Text(
              !settled ? 'Kontrol ediliyor…' : failed ? 'Kişiselleştirme şu anda doğrulanamıyor. Tekrar dene.' : 'Bu ürün için kişiselleştirme henüz kullanılamıyor.',
              style: inter(13, color: flowBody),
            ),
          ),
        ],
      ],
    );
  }
}

class _MethodCard extends StatelessWidget {
  const _MethodCard({required this.title, required this.description, required this.icon, required this.recommended, required this.selected, required this.onTap});

  final String title;
  final String description;
  final IconData icon;
  final bool recommended;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      inMutuallyExclusiveGroup: true,
      checked: selected,
      button: true,
      label: '$title. $description',
      onTap: onTap,
      excludeSemantics: true,
      child: Material(
        color: XinobiTokens.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: selected ? flowInk : flowLine, width: selected ? 2 : 1),
        ),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: selected ? 13 : 14, vertical: selected ? 11 : 12),
            child: Row(children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(color: flowStage, borderRadius: BorderRadius.circular(10)),
                child: Icon(icon, size: 18, color: flowInk),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Wrap(spacing: 8, crossAxisAlignment: WrapCrossAlignment.center, children: [
                    Text(title, style: inter(15, weight: 600, color: flowInk)),
                    if (recommended)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(color: flowInk, borderRadius: BorderRadius.circular(999)),
                        child: Text('Önerilen', style: inter(11, weight: 600, color: XinobiTokens.surface)),
                      ),
                  ]),
                  const SizedBox(height: 2),
                  Text(description, style: inter(13, height: 1.35, color: const Color(0xFF4A4A4A))),
                ]),
              ),
              const SizedBox(width: 10),
              Container(
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: selected ? flowInk : const Color(0xFF9E9E9E), width: selected ? 6 : 1.5),
                ),
              ),
            ]),
          ),
        ),
      ),
    );
  }
}
