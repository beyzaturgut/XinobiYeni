import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../app/design_tokens.g.dart';
import '../core/formatting.dart';

/// Network image with a neutral placeholder; product photos are contained, never cropped (web rule).
class RemoteImage extends StatelessWidget {
  const RemoteImage(this.url, {super.key, this.label, this.fit = BoxFit.contain});

  final String? url;
  final String? label;
  final BoxFit fit;

  @override
  Widget build(BuildContext context) {
    final placeholder = Container(
      color: const Color(0xFFECECE8),
      alignment: Alignment.center,
      child: const Icon(Icons.image_outlined, color: XinobiTokens.muted),
    );
    if (url == null) return Semantics(label: label, image: label != null, child: placeholder);
    return Semantics(
      label: label,
      image: label != null,
      child: Image.network(
        url!,
        fit: fit,
        excludeFromSemantics: true,
        errorBuilder: (_, _, _) => placeholder,
        loadingBuilder: (context, child, progress) => progress == null ? child : placeholder,
      ),
    );
  }
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});
  @override
  Widget build(BuildContext context) =>
      const Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator(semanticsLabel: 'Yükleniyor')));
}

class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.error, required this.onRetry});
  final Object error;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) => Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(error.toString(), textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 16),
            FilledButton(onPressed: onRetry, child: const Text('Tekrar dene')),
          ]),
        ),
      );
}

class EmptyView extends StatelessWidget {
  const EmptyView(this.message, {super.key});
  final String message;
  @override
  Widget build(BuildContext context) =>
      Center(child: Padding(padding: const EdgeInsets.all(24), child: Text(message, textAlign: TextAlign.center)));
}

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, this.onTap});
  final ProductSummary product;
  /// Defaults to the product detail page.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    void open() => onTap != null ? onTap!() : context.push('/urunler/${Uri.encodeComponent(product.id)}');
    // The merged label replaces the children's semantics, so the tap action is restated for screen readers.
    return Semantics(
      button: true,
      label: '${product.name}, ${formatMoney(product.priceFrom)}${product.inStock ? '' : ', stokta yok'}',
      onTap: open,
      excludeSemantics: true,
      child: InkWell(
        onTap: open,
        child: Container(
          decoration: BoxDecoration(color: XinobiTokens.surface, border: Border.all(color: XinobiTokens.line)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            AspectRatio(
              aspectRatio: 1,
              child: Stack(children: [
                Positioned.fill(child: RemoteImage(product.imageUrl)),
                if (product.colorCount > 1)
                  Positioned(
                    left: 8,
                    top: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      color: XinobiTokens.surface,
                      child: Text('◉ ${product.colorCount} renk', style: text.bodySmall),
                    ),
                  ),
              ]),
            ),
            // Text takes the remaining height; the name shrinks with an ellipsis instead of overflowing on small phones.
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(product.category, style: text.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Flexible(child: Text(product.name, style: text.titleMedium, maxLines: 2, overflow: TextOverflow.ellipsis)),
                  const SizedBox(height: 6),
                  Text(formatMoney(product.priceFrom), style: text.bodyMedium, maxLines: 1, overflow: TextOverflow.ellipsis),
                  if (!product.inStock) Text('Stokta yok', style: text.bodySmall?.copyWith(color: XinobiTokens.danger), maxLines: 1),
                ]),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

/// Two-column product grid sized for phones; switches to three columns on wide screens.
SliverGrid productGrid(List<ProductSummary> products, {void Function(ProductSummary product)? onTap}) => SliverGrid(
      gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(maxCrossAxisExtent: 260, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.52),
      delegate: SliverChildBuilderDelegate(
        (context, index) => ProductCard(product: products[index], onTap: onTap == null ? null : () => onTap(products[index])),
        childCount: products.length,
      ),
    );
