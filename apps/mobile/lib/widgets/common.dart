import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../app/design_tokens.g.dart';
import '../core/formatting.dart';
import '../core/user_facing_error.dart';
import '../features/compare/compare_button.dart';
import '../features/favorites/favorite_button.dart';

/// Network image with a neutral placeholder; product photos are contained, never cropped (web rule).
class RemoteImage extends StatelessWidget {
  const RemoteImage(this.url, {super.key, this.label, this.fit = BoxFit.contain, this.cacheWidth});

  final String? url;
  final String? label;
  final BoxFit fit;

  /// Decode width in physical pixels; keeps large photos small in the image cache.
  final int? cacheWidth;

  @override
  Widget build(BuildContext context) {
    final placeholder = Container(
      color: XinobiTokens.mediaWarm,
      alignment: Alignment.center,
      child: const Icon(Icons.image_outlined, color: XinobiTokens.muted),
    );
    if (url == null) {
      return Semantics(label: label, image: label != null, child: placeholder);
    }
    return Semantics(
      label: label,
      image: label != null,
      child: Image.network(
        url!,
        fit: fit,
        cacheWidth: cacheWidth,
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
        // Scrolls rather than overflowing when large text makes the message taller than the space.
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Semantics(liveRegion: true, child: Text(userMessage(error), textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium)),
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
      Center(child: SingleChildScrollView(padding: const EdgeInsets.all(24), child: Text(message, textAlign: TextAlign.center)));
}

class ProductCard extends StatelessWidget {
  const ProductCard({super.key, required this.product, this.onTap, this.showFavorite = true, this.footer, this.cardInteractive = true, this.semanticsLabel,
    this.image,
    this.showColors = true,});
  final ProductSummary product;
  final Widget? image;
  final bool showColors;
  final bool showFavorite;
  /// Defaults to the product detail page.
  final VoidCallback? onTap;
  /// Replaces the normal price/stock footer for a contextual card action.
  final Widget? footer;
  /// Keeps the card itself passive when a contextual footer owns the action.
  final bool cardInteractive;
  final String? semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final canOpen = cardInteractive || onTap != null;
    void open() {
      if (!canOpen) return;
      if (onTap != null) {
        onTap!();
      } else {
        context.push('/urunler/${Uri.encodeComponent(product.id)}');
      }
    }
    // The merged label replaces the children's semantics, so the tap action is restated for screen readers.
    // The heart sits outside that merge so it stays its own control.
    final card = Semantics(
      button: canOpen,
      label: semanticsLabel ?? '${product.name}, ${formatMoney(product.priceFrom)}${product.inStock ? '' : ', stokta yok'}',
      onTap: canOpen ? open : null,
      excludeSemantics: canOpen,
      child: InkWell(
        onTap: canOpen ? open : null,
        child: Container(
          decoration: BoxDecoration(color: XinobiTokens.surface, border: Border.all(color: XinobiTokens.line)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            AspectRatio(
              aspectRatio: 1,
              child: Stack(children: [
                Positioned.fill(child: image ?? RemoteImage(product.imageUrl)),
                if (showColors && product.colorCount > 1)
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
                  if (footer != null) footer! else ...[
                    Text(formatMoney(product.priceFrom), style: text.bodyMedium, maxLines: 1, overflow: TextOverflow.ellipsis),
                    if (!product.inStock) Text('Stokta yok', style: text.bodySmall?.copyWith(color: XinobiTokens.danger), maxLines: 1),
                  ],
                ]),
              ),
            ),
          ]),
        ),
      ),
    );
    if (!showFavorite) return card;
    return Stack(children: [
      Positioned.fill(child: card),
      Positioned(top: 4, right: 4, child: FavoriteButton(productId: product.id, productName: product.name, onImage: true)),
      Positioned(top: 56, right: 4, child: CompareButton(productId: product.id, productName: product.name, onImage: true)),
    ]);
  }
}

/// How much the reader's text setting enlarges body-sized text. Android 14+ scales non-linearly (large sizes grow less),
/// so a block height is multiplied by this factor rather than passed to [TextScaler.scale] as if it were one font size.
double bodyTextFactor(BuildContext context) => MediaQuery.textScalerOf(context).scale(16) / 16;

/// Two-column product grid sized for phones; switches to three columns on wide screens.
/// Each tile is the square photo plus a text block that grows with the reader's text size, so names, prices and the
/// contextual action stay readable at 200 % instead of overflowing a fixed-ratio tile.
Widget productGrid(List<ProductSummary> products, {void Function(ProductSummary product)? onTap, bool showFavorite = true, Widget Function(BuildContext context, ProductSummary product)? footerBuilder, bool cardInteractive = true, String Function(ProductSummary product)? semanticsLabelBuilder,
  Widget Function(BuildContext, ProductSummary)? cardBuilder,}) => SliverLayoutBuilder(
      builder: (context, constraints) {
        const maxTile = 260.0, spacing = 12.0;
        final columns = (constraints.crossAxisExtent / (maxTile + spacing)).ceil().clamp(1, 6);
        final width = (constraints.crossAxisExtent - spacing * (columns - 1)) / columns;
        // 0.52 is the designed phone proportion; larger text adds height rather than clipping the copy.
        // A contextual footer (e.g. the XINOBI U call to action) can wrap to more lines than price and stock.
        final textBlock = footerBuilder == null ? 130.0 : 150.0;
        final height = math.max(width / 0.52, width + 20 + textBlock * bodyTextFactor(context));
        return SliverGrid(
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: columns, mainAxisSpacing: spacing, crossAxisSpacing: spacing, mainAxisExtent: height),
          delegate: SliverChildBuilderDelegate(
            (context, index) => cardBuilder?.call(context, products[index]) ?? ProductCard(product: products[index], onTap: onTap == null ? null : () => onTap(products[index]), showFavorite: showFavorite, footer: footerBuilder?.call(context, products[index]), cardInteractive: cardInteractive, semanticsLabel: semanticsLabelBuilder?.call(products[index])),
            childCount: products.length,
          ),
        );
      },
    );
