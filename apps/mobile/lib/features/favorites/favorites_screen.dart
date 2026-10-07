import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import 'favorite_button.dart';
import 'favorites.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ids = ref.watch(favoritesProvider);
    final items = ref.watch(favoriteItemsProvider);
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: const Text('Favorilerim'),
      ),
      body: ids.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Text('Favori listen henüz boş.', style: text.titleLarge),
                  const SizedBox(height: 8),
                  const Text('Beğendiğin ürünleri kalp düğmesiyle buraya ekleyebilirsin.', textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  FilledButton(onPressed: () => context.go('/urunler'), child: const Text('Ürünleri keşfet')),
                ]),
              ),
            )
          : items.when(
              // Keep the previous list while a toggle reloads it, so removing a row does not flash a spinner.
              skipLoadingOnReload: true,
              loading: () => const LoadingView(),
              error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(favoriteItemsProvider)),
              data: (items) => RefreshIndicator(
                onRefresh: () => ref.refresh(favoriteItemsProvider.future),
                child: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
                  Row(children: [
                    Expanded(child: Text('${items.length} favori ürün', style: text.titleMedium)),
                    TextButton(onPressed: () => ref.read(favoritesProvider.notifier).clear(), child: const Text('Tümünü temizle')),
                  ]),
                  Text('Bu liste yalnız bu cihazda tutulur.', style: text.bodySmall),
                  const SizedBox(height: 12),
                  for (final item in items) Padding(padding: const EdgeInsets.only(bottom: 12), child: _FavoriteRow(item: item)),
                ]),
              ),
            ),
    );
  }
}

class _FavoriteRow extends StatelessWidget {
  const _FavoriteRow({required this.item});
  final FavoriteItem item;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final product = item.product;
    final name = product?.name ?? 'Ürün';
    final prices = product?.variants.map((variant) => variant.price).whereType<Money>().toList() ?? [];
    prices.sort((a, b) => a.amountMinor.compareTo(b.amountMinor));
    final inStock = product?.variants.any((variant) => variant.maxQuantity > 0) ?? false;
    final open = product == null ? null : () => context.push('/urunler/${Uri.encodeComponent(item.id)}');
    return Container(
      decoration: BoxDecoration(color: XinobiTokens.surface, border: Border.all(color: XinobiTokens.line)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(
          child: Semantics(
            button: open != null,
            label: product == null
                ? 'Bu ürün artık yayında değil'
                : '$name, ${prices.isEmpty ? 'fiyat tanımlanmadı' : formatMoney(prices.first)}${inStock ? '' : ', stokta yok'}',
            onTap: open,
            excludeSemantics: true,
            child: InkWell(
              onTap: open,
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                SizedBox(width: 96, height: 96, child: RemoteImage(product?.imageUrl ?? product?.variants.firstOrNull?.imageUrl)),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(10),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      if (product == null) ...[
                        Text('Bu ürün artık yayında değil.', style: text.titleMedium),
                        Text('Favorilerden çıkarabilirsin.', style: text.bodySmall),
                      ] else ...[
                        Text(product.category, style: text.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis),
                        Text(name, style: text.titleMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
                        const SizedBox(height: 4),
                        Text(
                          [
                            if (prices.isEmpty) 'Fiyat tanımlanmadı' else '${formatMoney(prices.first)}${prices.first.amountMinor != prices.last.amountMinor ? ' itibarıyla' : ''}',
                            if (!inStock) 'Stokta yok',
                          ].join(' · '),
                          style: text.bodyMedium,
                        ),
                      ],
                    ]),
                  ),
                ),
              ]),
            ),
          ),
        ),
        FavoriteButton(productId: item.id, productName: name, removeLabel: product == null ? 'Yayından kalkan ürünü favorilerden çıkar' : null),
      ]),
    );
  }
}
