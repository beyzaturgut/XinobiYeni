import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../app/theme.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import '../cart/cart.dart';
import '../compare/compare.dart';
import '../compare/compare_button.dart';
import '../favorites/favorite_button.dart';
import '../favorites/favorites.dart';
import '../xinobi_u/flow_widgets.dart';
import 'catalog_repository.dart';
import 'product_gallery.dart';
import 'product_reviews.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({super.key, required this.productId});
  final String productId;

  @override
  ConsumerState<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  String? selectedVariantId;
  String? activeImage;
  int quantity = 1;
  int? openSection;

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
          if (product.asData?.value case final detail?) CompareButton(productId: detail.id, productName: detail.name, color: XinobiTokens.onHeader),
          if (product.asData?.value case final detail?) FavoriteButton(productId: detail.id, productName: detail.name, color: XinobiTokens.onHeader),
        ],
      ),
      body: product.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(productProvider(widget.productId))),
        data: (detail) {
          final variants = detail.variants.toList();
          final selected = variants.firstWhere((variant) => variant.id == selectedVariantId, orElse: () => variants.isEmpty ? _none : variants.first);
          final quantityLimit = selected.maxQuantity.clamp(1, 99);
          final sections = <({String title, Widget body})>[
            if (detail.description.isNotEmpty) (title: 'Ürün açıklaması', body: Text(detail.description, style: inter(14, height: 1.6, color: flowBody))),
            if (detail.specs.isNotEmpty) (title: 'Teknik özellikler', body: ProductSpecs(specs: detail.specs.toList())),
            (title: 'Teslimat ve iade', body: Text('Teslimat süresi ve iade koşulları sipariş adımında, mesafeli satış belgeleriyle birlikte gösterilir.', style: inter(14, height: 1.6, color: flowBody))),
          ];
          return ListView(padding: const EdgeInsets.only(bottom: 32), children: [
            ProductGallery(
              productName: detail.name,
              images: productGallery(detail, variants.isEmpty ? null : selected),
              selected: activeImage,
              onSelected: (url) => setState(() => activeImage = url),
              preload: [for (final variant in variants) ?variant.imageUrl],
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 20, XinobiTokens.gutterMobile, 0),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                FlowKicker(detail.category),
                Semantics(header: true, child: Text(detail.name, style: flowTitle)),
                if (variants.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Wrap(spacing: 18, runSpacing: 4, crossAxisAlignment: WrapCrossAlignment.center, children: [
                    Text('SKU: ${selected.sku}', style: inter(13, color: flowMuted)),
                    Row(mainAxisSize: MainAxisSize.min, children: [
                      Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: selected.availability.status == 'out_of_stock' ? const Color(0xFF9E9E9E) : const Color(0xFF1F7A3A))),
                      const SizedBox(width: 6),
                      Text(availabilityText(selected.availability), style: inter(13, color: selected.availability.status == 'out_of_stock' ? XinobiTokens.danger : flowMuted)),
                    ]),
                  ]),
                  const SizedBox(height: 14),
                  Semantics(liveRegion: true, child: Text(formatMoney(selected.price), style: inter(24, weight: 600, letterSpacing: -.01, color: flowInk))),
                  const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(height: 1, color: Color(0xFFE6E6E6))),
                  Text.rich(TextSpan(text: 'Renk: ', children: [TextSpan(text: selected.color, style: const TextStyle(fontWeight: FontWeight.w600))]), style: inter(14, color: flowInk)),
                  const SizedBox(height: 10),
                  Wrap(spacing: 10, runSpacing: 10, children: [
                    for (final variant in variants)
                      _Swatch(variant: variant, selected: variant.id == selected.id, onTap: () => setState(() {
                        selectedVariantId = variant.id;
                        quantity = 1;
                        // The colour's photo comes to the front; the product and extra photos stay in the strip.
                        activeImage = variant.imageUrl ?? activeImage;
                      })),
                  ]),
                  const SizedBox(height: 18),
                  Row(children: [
                    _QuantityStepper(
                      value: quantity,
                      enabled: selected.purchasable,
                      onChanged: (value) => setState(() => quantity = value.clamp(1, quantityLimit)),
                      max: quantityLimit,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: FilledButton(
                        style: flowPrimaryButton,
                        onPressed: selected.purchasable ? () => _addToCart(detail, selected) : null,
                        child: Text(selected.purchasable ? 'Sepete ekle' : selected.price == null ? 'Şu anda satın alınamaz' : 'Stokta yok'),
                      ),
                    ),
                  ]),
                  if (!selected.purchasable) ...[
                    const SizedBox(height: 8),
                    Text(selected.price == null ? 'Bu renk için henüz fiyat tanımlanmadı.' : 'Bu renk şu anda stokta yok.', style: inter(13, color: flowBody)),
                  ],
                ],
                const SizedBox(height: 6),
                Wrap(spacing: 12, children: [
                  _TextAction(
                    icon: ref.watch(isFavoriteProvider(detail.id)) ? Icons.favorite : Icons.favorite_border,
                    label: ref.watch(isFavoriteProvider(detail.id)) ? 'Favorilerde' : 'Favorilere ekle',
                    onPressed: () => toggleFavorite(context, ref, detail.id),
                  ),
                  _TextAction(
                    icon: Icons.compare_arrows,
                    label: ref.watch(compareProvider).contains(detail.id) ? 'Karşılaştırmada' : 'Karşılaştır',
                    onPressed: () async {
                      final messenger = ScaffoldMessenger.of(context);
                      if (!await ref.read(compareProvider.notifier).toggle(detail.id)) {
                        messenger.showSnackBar(const SnackBar(content: Text('En fazla $maxCompare ürün karşılaştırabilirsin.')));
                      }
                    },
                  ),
                ]),
                if (detail.personalizable && variants.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  _PersonalizeCard(onOpen: () => context.push('/xinobi-u/renk?urun=${Uri.encodeQueryComponent(detail.id)}',)),
                ],
                const SizedBox(height: 16),
                const Divider(height: 1, color: Color(0xFFE6E6E6)),
                for (var index = 0; index < sections.length; index++) ...[
                  Semantics(
                    button: true,
                    expanded: openSection == index,
                    child: InkWell(
                      onTap: () => setState(() => openSection = openSection == index ? null : index),
                      child: SizedBox(
                        height: 50,
                        child: Row(children: [
                          Expanded(child: Text(sections[index].title, style: inter(15, weight: 500, color: flowInk))),
                          ExcludeSemantics(child: Text(openSection == index ? '−' : '+', style: inter(20, color: flowInk))),
                        ]),
                      ),
                    ),
                  ),
                  if (openSection == index) Padding(padding: const EdgeInsets.only(bottom: 16), child: sections[index].body),
                  const Divider(height: 1, color: Color(0xFFE6E6E6)),
                ],
                const SizedBox(height: 28),
                ProductReviews(productId: detail.id, productName: detail.name),
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
      await ref.read(cartProvider.notifier).add(product.id, variant.id, variant.maxQuantity, quantity: quantity);
      messenger.showSnackBar(SnackBar(
        content: Text(quantity > 1 ? '${product.name} · ${variant.color}, $quantity adet sepete eklendi.' : '${product.name} · ${variant.color} sepete eklendi.'),
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
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
                // Design ring: a white gap, then the ink circle; unselected swatches keep a hairline edge.
                border: Border.all(color: selected ? Colors.white : const Color(0x1F000000), width: selected ? 3 : 1),
                boxShadow: selected ? const [BoxShadow(color: Color(0xFF111111), spreadRadius: 2)] : null,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _QuantityStepper extends StatelessWidget {
  const _QuantityStepper({required this.value, required this.max, required this.enabled, required this.onChanged});
  final int value;
  final int max;
  final bool enabled;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Adet',
      child: Container(
        height: 48,
        decoration: BoxDecoration(border: Border.all(color: const Color(0xFFD6D6D6)), borderRadius: BorderRadius.circular(10)),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          IconButton(tooltip: 'Azalt', onPressed: enabled && value > 1 ? () => onChanged(value - 1) : null, icon: const Icon(Icons.remove, size: 18)),
          SizedBox(width: 22, child: Semantics(liveRegion: true, child: Text('$value', textAlign: TextAlign.center, style: inter(15, weight: 600)))),
          IconButton(tooltip: 'Artır', onPressed: enabled && value < max ? () => onChanged(value + 1) : null, icon: const Icon(Icons.add, size: 18)),
        ]),
      ),
    );
  }
}

class _TextAction extends StatelessWidget {
  const _TextAction({required this.icon, required this.label, required this.onPressed});
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) => TextButton.icon(
        onPressed: onPressed,
        style: TextButton.styleFrom(foregroundColor: flowInk, padding: const EdgeInsets.symmetric(horizontal: 4), textStyle: inter(14)),
        icon: Icon(icon, size: 18),
        label: Text(label),
      );
}

/// The XINOBI U card of the design: leads to the method step with the selected colour.
class _PersonalizeCard extends StatelessWidget {
  const _PersonalizeCard({required this.onOpen});
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: flowStage, borderRadius: BorderRadius.circular(16)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const FlowKicker('XINOBI U'),
        Text('Kendine özel tasarla', style: inter(17, weight: 600, color: flowInk)),
        const SizedBox(height: 4),
        Text('Ürünün onaylı fotoğrafı üzerinde kendi görselini, desenini ya da sana özel AI tasarımını dene.', style: inter(13, height: 1.5, color: flowBody)),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: Semantics(
            label: 'XINOBI U ile kişiselleştir',
            excludeSemantics: true,
            button: true,
            child: OutlinedButton(
              onPressed: onOpen,
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, 42),
                backgroundColor: Colors.white,
                foregroundColor: flowInk,
                side: const BorderSide(color: flowInk),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                textStyle: inter(14, weight: 600),
              ),
              child: const Text('Kişiselleştir →'),
            ),
          ),
        ),
      ]),
    );
  }
}
