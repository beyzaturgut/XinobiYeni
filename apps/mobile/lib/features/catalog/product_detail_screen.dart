import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import '../cart/cart.dart';
import '../favorites/favorite_button.dart';
import 'catalog_repository.dart';
import 'product_gallery.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({super.key, required this.productId});
  final String productId;

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  String? selectedVariantId;
  String? activeImage;

  @override
  Widget build(BuildContext context) {
    final product = ref.watch(productProvider(widget.productId));
    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: Text(product.asData?.value.name ?? ''),
        actions: [
          if (product.asData?.value case final detail?) FavoriteButton(productId: detail.id, productName: detail.name, color: XinobiTokens.onHeader),
        ],
      ),
      body: product.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(productProvider(widget.productId))),
        data: (detail) {
          final variants = detail.variants.toList();
          final selected = variants.firstWhere((variant) => variant.id == selectedVariantId, orElse: () => variants.isEmpty ? _none : variants.first);
          final text = Theme.of(context).textTheme;
          return ListView(padding: const EdgeInsets.only(bottom: 32), children: [
            ProductGallery(
              productName: detail.name,
              images: productGallery(detail, variants.isEmpty ? null : selected),
              selected: activeImage,
              onSelected: (url) => setState(() => activeImage = url),
            ),
            Padding(
              padding: const EdgeInsets.all(XinobiTokens.gutterMobile),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(detail.category, style: text.bodySmall),
                const SizedBox(height: 4),
                Semantics(header: true, child: Text(detail.name, style: text.headlineSmall)),
                if (variants.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Semantics(liveRegion: true, child: Text(formatMoney(selected.price), style: text.titleLarge)),
                  const SizedBox(height: 4),
                  Text(availabilityText(selected.availability),
                      style: text.bodySmall?.copyWith(color: selected.availability.status == 'out_of_stock' ? XinobiTokens.danger : XinobiTokens.muted)),
                  const SizedBox(height: 20),
                  Text('Renk: ${selected.color}', style: text.bodyMedium),
                  const SizedBox(height: 10),
                  Wrap(spacing: 12, runSpacing: 12, children: [
                    for (final variant in variants)
                      _Swatch(variant: variant, selected: variant.id == selected.id, onTap: () => setState(() {
                        selectedVariantId = variant.id;
                        // The colour's photo comes to the front; the product and extra photos stay in the strip.
                        activeImage = variant.imageUrl ?? activeImage;
                      })),
                  ]),
                ],
                if (variants.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: selected.purchasable ? () => _addToCart(detail, selected) : null,
                      child: Text(selected.purchasable ? 'Sepete ekle' : selected.price == null ? 'Şu anda satın alınamaz' : 'Stokta yok'),
                    ),
                  ),
                ],
                if (detail.personalizable && variants.isNotEmpty && selected.imageUrl != null) ...[
                  const SizedBox(height: 24),
                  SizedBox(
                    width: double.infinity,
                    child: FilledButton(
                      onPressed: () => context.push('/xinobi-u/anket?urun=${Uri.encodeQueryComponent(detail.id)}&renk=${Uri.encodeQueryComponent(selected.id)}'),
                      child: Text('${selected.color} rengini XINOBI U ile kişiselleştir'),
                    ),
                  ),
                ],
                if (detail.description.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  Text(detail.description, style: text.bodyMedium),
                ],
                if (variants.isNotEmpty && !selected.purchasable) ...[
                  const SizedBox(height: 16),
                  Text(selected.price == null ? 'Bu renk için henüz fiyat tanımlanmadı.' : 'Bu renk şu anda stokta yok.', style: text.bodySmall),
                ],
              ]),
            ),
          ]);
        },
      ),
    );
  }

  Future<void> _addToCart(ProductDetail product, VariantDetail variant) async {
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref.read(cartProvider.notifier).add(product.id, variant.id, variant.maxQuantity);
      messenger.showSnackBar(SnackBar(
        content: Text('${product.name} · ${variant.color} sepete eklendi.'),
        action: SnackBarAction(label: 'Sepete git', onPressed: () => context.go('/sepet')),
      ));
    } on CartException catch (error) {
      messenger.showSnackBar(SnackBar(content: Text(error.message)));
    }
  }

  static final _none = VariantDetail((b) => b
    ..id = ''
    ..sku = ''
    ..color = ''
    ..availability.status = 'out_of_stock'
    ..purchasable = false
    ..maxQuantity = 0);
}

class _Swatch extends StatelessWidget {
  const _Swatch({required this.variant, required this.selected, required this.onTap});
  final VariantDetail variant;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final hex = variant.hex;
    final color = hex != null && RegExp(r'^#[0-9a-fA-F]{6}$').hasMatch(hex) ? Color(int.parse('FF${hex.substring(1)}', radix: 16)) : XinobiTokens.line;
    return Semantics(
      button: true,
      selected: selected,
      label: '${variant.color} rengini seç',
      onTap: onTap,
      excludeSemantics: true,
      child: InkResponse(
        onTap: onTap,
        radius: 26,
        child: SizedBox(
          width: 48,
          height: 48,
          child: Center(
            child: Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
                border: Border.all(color: selected ? XinobiTokens.ink : XinobiTokens.line, width: selected ? 3 : 1),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
