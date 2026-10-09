import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../app/design_tokens.g.dart';
import 'compare.dart';

/// Compare switch for cards and the product page; [onImage] draws a light disc so it reads over photos.
class CompareButton extends ConsumerWidget {
  const CompareButton({super.key, required this.productId, required this.productName, this.onImage = false, this.color});
  final String productId;
  final String productName;
  final bool onImage;
  final Color? color;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ids = ref.watch(compareProvider);
    final active = ids.contains(productId);
    final button = IconButton(
      tooltip: active ? '$productName ürününü karşılaştırmadan çıkar' : '$productName ürününü karşılaştırmaya ekle',
      isSelected: active,
      color: onImage ? (active ? XinobiTokens.onHeader : XinobiTokens.ink) : color ?? XinobiTokens.ink,
      icon: const Icon(Icons.compare_arrows),
      selectedIcon: const Icon(Icons.library_add_check),
      onPressed: () async {
        final messenger = ScaffoldMessenger.of(context);
        final ok = await ref.read(compareProvider.notifier).toggle(productId);
        messenger.hideCurrentSnackBar();
        if (!ok) {
          messenger.showSnackBar(const SnackBar(content: Text('En fazla $maxCompare ürün karşılaştırabilirsin.')));
        } else if (!active && context.mounted) {
          messenger.showSnackBar(SnackBar(
            content: Text('$productName karşılaştırmaya eklendi (${ref.read(compareProvider).length}/$maxCompare).'),
            action: SnackBarAction(label: 'Karşılaştır', onPressed: () => context.push('/karsilastir')),
          ));
        }
      },
    );
    if (!onImage) return button;
    return DecoratedBox(
      decoration: BoxDecoration(
        color: active ? XinobiTokens.teal : XinobiTokens.surface.withValues(alpha: 0.9),
        shape: BoxShape.circle,
        border: Border.all(color: active ? XinobiTokens.teal : const Color(0xFFCCCCCC)),
      ),
      child: button,
    );
  }
}

/// Header shortcut with the number of compared products; hidden while the list is empty.
class CompareHeaderButton extends ConsumerWidget {
  const CompareHeaderButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(compareProvider).length;
    if (count == 0) return const SizedBox.shrink();
    return IconButton(
      tooltip: 'Karşılaştır, $count ürün',
      color: XinobiTokens.onHeader,
      icon: ExcludeSemantics(child: Badge(label: Text('$count'), backgroundColor: XinobiTokens.danger, child: const Icon(Icons.compare_arrows))),
      onPressed: () => context.push('/karsilastir'),
    );
  }
}
