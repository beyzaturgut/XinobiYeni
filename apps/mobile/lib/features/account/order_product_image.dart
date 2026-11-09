import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart' hide DesignPlacement;

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../catalog/catalog_repository.dart';
import '../designs/designs.dart';
import '../designs/design_configurations.dart';
import '../personalization/surface_preview.dart';

String orderPreviewPath(String orderId, int line) =>
    '/api/v1/me/orders/${Uri.encodeComponent(orderId)}/lines/$line/preview';

/// Uses the order-owned composition first. Never presents raw artwork as a product preview.
class OrderProductImage extends ConsumerWidget {
  const OrderProductImage({
    super.key,
    required this.orderId,
    required this.index,
    required this.line,
  });
  final String orderId;
  final int index;
  final CustomerOrderLine line;

  bool get _snapshotOnly =>
      line.personalization?.schemaVersion == 2 ||
      line.personalization?.files != null;
  Widget _missingSnapshot() => const Center(
    child: Text(
      'Siparişteki tasarım önizlemesi alınamadı. Güncel ürün veya tasarımla değiştirilmez.',
      textAlign: TextAlign.center,
    ),
  );
  Widget _fallback() =>
      _snapshotOnly ? _missingSnapshot() : _LegacyOrderProduct(line: line);
  Widget _composition(WidgetRef ref) {
    final personalization = line.personalization;
    if (personalization == null) {
      return RemoteImage(line.imageUrl, label: '${line.name}, ${line.color}');
    }
    final snapshot = ref.watch(
      designImageProvider(orderPreviewPath(orderId, index)),
    );
    return snapshot.when(
      loading: () => const Center(child: CircularProgressIndicator()),
      data: (image) => image == null
          ? _olderPreview(ref)
          : Image(
              image: image,
              fit: BoxFit.contain,
              semanticLabel: '${line.name}, tasarladığın ürün',
              errorBuilder: (_, _, _) => _fallback(),
            ),
      error: (_, _) => _olderPreview(ref),
    );
  }

  Widget _olderPreview(WidgetRef ref) {
    if (_snapshotOnly) return _missingSnapshot();
    final personalization = line.personalization!;
    if (personalization.configurationId != null &&
        personalization.configurationRevision != null) {
      final saved = ref.watch(
        designImageProvider(
          configurationPreviewPath(
            personalization.configurationId!,
            personalization.configurationRevision!,
          ),
        ),
      );
      return saved.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        data: (image) => image == null
            ? _LegacyOrderProduct(line: line)
            : Image(
                image: image,
                fit: BoxFit.contain,
                semanticLabel: '${line.name}, tasarladığın ürün',
                errorBuilder: (_, _, _) => _fallback(),
              ),
        error: (_, _) => _fallback(),
      );
    }
    return _LegacyOrderProduct(line: line);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) => _composition(ref);
}

/// Old orders without a saved composition can only show a representative rendering.
/// Modern placements with body adjustments cannot be faithfully recreated by the native legacy renderer.
class _LegacyOrderProduct extends ConsumerWidget {
  const _LegacyOrderProduct({required this.line});
  final CustomerOrderLine line;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final personalization = line.personalization!;
    final product = ref.watch(productProvider(line.productId)).value;
    final variant = product?.variants
        .where((item) => item.id == line.variantId)
        .firstOrNull;
    final published = variant == null || variant.surfaceMaskUrl != null
        ? null
        : ref
              .watch(
                publishedSurfaceProvider((
                  productId: line.productId,
                  variantId: line.variantId,
                )),
              )
              .value;
    final source = variant?.surfaceMaskUrl != null
        ? variant?.imageUrl
        : published?.sourceUrl;
    final mask = variant?.surfaceMaskUrl ?? published?.maskUrl;
    final artwork = personalization.imageUrl == null
        ? null
        : ref.watch(designImageProvider(personalization.imageUrl!)).value;
    final fallback = Stack(
      fit: StackFit.expand,
      children: [
        RemoteImage(line.imageUrl, label: '${line.name}, ürün görseli'),
        const Align(
          alignment: Alignment.bottomCenter,
          child: ColoredBox(
            color: XinobiTokens.surface,
            child: Text(
              'Tasarım önizlemesi mevcut değil',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 10),
            ),
          ),
        ),
      ],
    );
    if (personalization.placement != null ||
        source == null ||
        mask == null ||
        artwork == null) {
      return fallback;
    }
    return Stack(
      fit: StackFit.expand,
      children: [
        SurfacePreview(
          product: NetworkImage(source),
          design: artwork,
          mask: NetworkImage(mask),
          placement: personalization.kind == 'ai'
              ? const DesignPlacement.cover()
              : const DesignPlacement.place(),
          fallback: fallback,
        ),
        const Align(
          alignment: Alignment.bottomCenter,
          child: ColoredBox(
            color: XinobiTokens.surface,
            child: Text('Temsili yerleşim', style: TextStyle(fontSize: 10)),
          ),
        ),
      ],
    );
  }
}

/// The same product composition is shown in the thumbnail and the pinch-to-zoom viewer.
class OrderProductThumbnail extends StatelessWidget {
  const OrderProductThumbnail({
    super.key,
    required this.orderId,
    required this.index,
    required this.line,
  });
  final String orderId;
  final int index;
  final CustomerOrderLine line;
  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: '${line.name} ürün önizlemesini büyüt',
    child: InkWell(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => Scaffold(
            appBar: AppBar(title: Text(line.name)),
            body: SafeArea(
              child: Column(
                children: [
                  Expanded(
                    child: LayoutBuilder(
                      builder: (_, constraints) => InteractiveViewer(
                        minScale: 1,
                        maxScale: 5,
                        child: SizedBox(
                          width: constraints.maxWidth,
                          height: constraints.maxHeight,
                          child: OrderProductImage(
                            orderId: orderId,
                            index: index,
                            line: line,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('Yakınlaştırmak için iki parmağınla büyüt.'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      child: SizedBox(
        width: 96,
        height: 96,
        child: OrderProductImage(orderId: orderId, index: index, line: line),
      ),
    ),
  );
}
