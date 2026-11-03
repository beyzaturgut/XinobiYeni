import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import 'favorite_button.dart';
import 'favorites.dart';
import '../account/auth.dart';
import '../designs/design_configurations.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  Future<void> _clear(BuildContext context, WidgetRef ref) async {
    final messenger = ScaffoldMessenger.of(context);
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Tüm favoriler çıkarılsın mı?'),
        content: const Text('Liste hesabından silinir; web ve diğer cihazlarda da boşalır.'),
        actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Vazgeç')), FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Tümünü temizle'))],
      ),
    );
    if (ok != true) return;
    try {
      await ref.read(favoritesProvider.notifier).clear();
      messenger.showSnackBar(const SnackBar(content: Text('Favori listen temizlendi.')));
    } on AccountException catch (error) {
      messenger.showSnackBar(SnackBar(content: Text(error.message)));
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final ids = ref.watch(favoritesProvider);
    final items = ref.watch(favoriteItemsProvider);
    final text = Theme.of(context).textTheme;
    Widget message(String title, String body, String action, VoidCallback onPressed) => Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              Text(title, style: text.titleLarge, textAlign: TextAlign.center),
              const SizedBox(height: 8),
              Text(body, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              FilledButton(onPressed: onPressed, child: Text(action)),
            ]),
          ),
        );
    // Signed out, still restoring the session, a failed account list and an empty one are four different answers.
    final Widget content = switch ((auth, ids)) {
      (AuthLoading(), _) => const LoadingView(),
      (SignedOut(), _) => message('Favorilerini görmek için giriş yap.', 'Listen hesabına bağlı olarak saklanır; giriş yaptığın web ve mobil cihazlarda aynı görünür.', 'Giriş yap', () => signInAbove(context, ref)),
      (_, AsyncError(:final error)) => ErrorView(error: error, onRetry: () => ref.invalidate(favoritesProvider)),
      (_, AsyncData(value: final list)) when list.isEmpty => message('Favori listen henüz boş.', 'Beğendiğin ürünleri kalp düğmesiyle buraya ekleyebilirsin.', 'Ürünleri keşfet', () => context.go('/urunler')),
      (_, AsyncData()) => items.when(
          // Keep the previous list while a toggle reloads it, so removing a row does not flash a spinner.
          skipLoadingOnReload: true,
          loading: () => const LoadingView(),
          error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(favoriteItemsProvider)),
          data: (items) => RefreshIndicator(
            onRefresh: () async {
              ref.invalidate(favoritesProvider);
              await ref.read(favoriteItemsProvider.future);
            },
            child: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
              Row(children: [
                Expanded(child: Text('${items.length} favori ürün', style: text.titleMedium)),
                TextButton(onPressed: () => _clear(context, ref), child: const Text('Tümünü temizle')),
              ]),
              Text('Favorilerin hesabına kaydedilir; web ve mobilde aynı listeyi görürsün.', style: text.bodySmall),
              const SizedBox(height: 12),
              for (final item in items) Padding(padding: const EdgeInsets.only(bottom: 12), child: _FavoriteRow(item: item)),
            ]),
          ),
        ),
      _ => const LoadingView(),
    };
    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: const Text('Favorilerim'),
      ),
      body: CustomScrollView(slivers: [const SliverToBoxAdapter(child: PersonalizedFavorites()), SliverFillRemaining(child: content)]),
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
