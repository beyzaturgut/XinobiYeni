import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/design_tokens.g.dart';
import 'favorites.dart';

/// Heart toggle used on product cards and the product page. [onImage] draws a light disc so it reads over photos.
class FavoriteButton extends ConsumerWidget {
  const FavoriteButton({super.key, required this.productId, required this.productName, this.onImage = false, this.color, this.removeLabel});
  final String productId;
  final String productName;
  final bool onImage;
  final Color? color;
  /// Replaces the generated tooltip when the product name is unknown.
  final String? removeLabel;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favorite = ref.watch(isFavoriteProvider(productId));
    final button = IconButton(
      tooltip: favorite ? removeLabel ?? '$productName ürününü favorilerden çıkar' : '$productName ürününü favorilere ekle',
      isSelected: favorite,
      // Black and white like the web catalog: a filled heart, never a coloured one.
      color: color ?? XinobiTokens.ink,
      icon: const Icon(Icons.favorite_border),
      selectedIcon: const Icon(Icons.favorite),
      onPressed: () => ref.read(favoritesProvider.notifier).toggle(productId),
    );
    if (!onImage) return button;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: XinobiTokens.surface.withValues(alpha: 0.9),
        shape: BoxShape.circle,
        border: Border.all(color: favorite ? XinobiTokens.teal : const Color(0xFFCCCCCC)),
      ),
      child: button,
    );
  }
}
