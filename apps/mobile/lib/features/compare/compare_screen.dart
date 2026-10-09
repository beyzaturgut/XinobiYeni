import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import '../catalog/catalog_repository.dart';
import 'compare.dart';

typedef _Row = ({String label, List<String> values, List<Widget> cells});

String stars(double rating) => '★★★★★'.substring(0, rating.round()) + '☆☆☆☆☆'.substring(0, 5 - rating.round());

/// /karsilastir — up to four products side by side: price, colours, stock, rating, XINOBI U and every spec.
class CompareScreen extends ConsumerStatefulWidget {
  const CompareScreen({super.key});
  @override
  ConsumerState<CompareScreen> createState() => _CompareScreenState();
}

class _CompareScreenState extends ConsumerState<CompareScreen> {
  bool onlyDifferences = false;
  static const labelWidth = 92.0;
  // Two products fit side by side on a phone; more scroll sideways.
  double columnWidth = 168;

  Money? _lowest(ProductDetail product) {
    final prices = product.variants.map((variant) => variant.price).whereType<Money>().toList()..sort((a, b) => a.amountMinor.compareTo(b.amountMinor));
    return prices.isEmpty ? null : prices.first;
  }

  List<_Row> _rows(List<ProductDetail> products, Map<String, ReviewSummary> ratings, TextTheme text) {
    String stock(ProductDetail p) => p.variants.any((v) => v.availability.status != 'out_of_stock') ? 'Stokta' : 'Stokta yok';
    final specNames = <String>{for (final p in products) for (final spec in p.specs) spec.name}.toList();
    String? spec(ProductDetail p, String name) => p.specs.where((s) => s.name == name).firstOrNull?.value;
    Widget plain(String value) => Text(value, style: text.bodyMedium);
    Widget rating(ReviewSummary? r) => r == null || r.count == 0
        ? plain('Henüz yok')
        : Semantics(label: '5 üzerinden ${r.average}, ${r.count} değerlendirme', child: ExcludeSemantics(child: Text('${stars(r.average)}\n${r.average} (${r.count})', style: text.bodyMedium)));
    return [
      (label: 'Fiyat', values: [for (final p in products) '${_lowest(p)?.amountMinor}'], cells: [for (final p in products) Text(formatMoney(_lowest(p)), style: text.titleSmall)]),
      (label: 'Kategori', values: [for (final p in products) p.category], cells: [for (final p in products) plain(p.category)]),
      (
        label: 'Renkler',
        values: [for (final p in products) p.variants.map((v) => v.color).join(',')],
        cells: [for (final p in products) plain(p.variants.map((v) => v.color).join('\n'))]
      ),
      (label: 'Stok', values: [for (final p in products) stock(p)], cells: [for (final p in products) plain(stock(p))]),
      (
        label: 'Puan',
        values: [for (final p in products) '${ratings[p.id]?.average}'],
        cells: [for (final p in products) rating(ratings[p.id])]
      ),
      (label: 'XINOBI U', values: [for (final p in products) '${p.personalizable}'], cells: [for (final p in products) plain(p.personalizable ? 'Kişiselleştirilebilir' : 'Yok')]),
      for (final name in specNames)
        (label: name, values: [for (final p in products) spec(p, name) ?? ''], cells: [for (final p in products) plain(spec(p, name) ?? '—')]),
    ];
  }

  Future<void> _addProduct(BuildContext context) async {
    final ids = ref.read(compareProvider);
    final page = await ref.read(productsProvider(const ProductQuery()).future);
    if (!context.mounted) return;
    final candidates = page.items.where((item) => !ids.contains(item.id)).toList();
    final chosen = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        builder: (context, controller) => ListView(controller: controller, children: [
          const ListTile(title: Text('Karşılaştırmaya ürün ekle')),
          for (final item in candidates)
            ListTile(
              leading: SizedBox(width: 48, height: 48, child: RemoteImage(item.imageUrl)),
              title: Text(item.name),
              subtitle: Text('${item.category} · ${formatMoney(item.priceFrom)}'),
              onTap: () => Navigator.of(context).pop(item.id),
            ),
        ]),
      ),
    );
    if (chosen != null) await ref.read(compareProvider.notifier).toggle(chosen);
  }

  @override
  Widget build(BuildContext context) {
    final items = ref.watch(compareItemsProvider);
    final ratings = ref.watch(compareRatingsProvider).value ?? const {};
    final ids = ref.watch(compareProvider);
    final text = Theme.of(context).textTheme;
    columnWidth = ((MediaQuery.sizeOf(context).width - 2 * XinobiTokens.gutterMobile - labelWidth) / 2).clamp(128.0, 200.0);
    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: const Text('Karşılaştır'),
        actions: [
          if (ids.isNotEmpty)
            TextButton(onPressed: () => ref.read(compareProvider.notifier).clear(), style: TextButton.styleFrom(foregroundColor: XinobiTokens.onHeader), child: const Text('Temizle')),
        ],
      ),
      body: items.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(compareItemsProvider)),
        data: (products) {
          if (products.isEmpty) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.compare_arrows, size: 48, color: XinobiTokens.muted),
                  const SizedBox(height: 12),
                  Text('Karşılaştırma listen boş.', style: text.titleMedium),
                  const SizedBox(height: 8),
                  Text('Ürün kartlarındaki karşılaştır düğmesiyle en fazla $maxCompare ürün ekleyebilirsin.', textAlign: TextAlign.center, style: text.bodySmall),
                  const SizedBox(height: 16),
                  FilledButton(onPressed: () => _addProduct(context), child: const Text('Ürün ekle')),
                ]),
              ),
            );
          }
          final rows = _rows(products, ratings, text);
          final shown = onlyDifferences && products.length > 1 ? rows.where((row) => row.values.toSet().length > 1).toList() : rows;
          return ListView(children: [
            SwitchListTile(
              title: const Text('Yalnız farkları göster'),
              value: onlyDifferences,
              onChanged: products.length > 1 ? (value) => setState(() => onlyDifferences = value) : null,
            ),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: XinobiTokens.gutterMobile),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const SizedBox(width: labelWidth),
                  for (final p in products)
                    SizedBox(
                      width: columnWidth,
                      child: Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Stack(children: [
                            AspectRatio(aspectRatio: 1, child: RemoteImage(p.imageUrl, label: p.name)),
                            Positioned(
                              top: 0,
                              right: 0,
                              child: IconButton(
                                tooltip: '${p.name} ürününü karşılaştırmadan çıkar',
                                icon: const Icon(Icons.close),
                                onPressed: () => ref.read(compareProvider.notifier).toggle(p.id),
                              ),
                            ),
                          ]),
                          const SizedBox(height: 6),
                          Text(p.name, style: text.titleSmall, maxLines: 3, overflow: TextOverflow.ellipsis),
                          TextButton(onPressed: () => context.push('/urunler/${Uri.encodeComponent(p.id)}'), child: const Text('İncele')),
                        ]),
                      ),
                    ),
                  if (products.length < maxCompare)
                    SizedBox(
                      width: columnWidth,
                      child: AspectRatio(
                        aspectRatio: 1,
                        child: OutlinedButton.icon(onPressed: () => _addProduct(context), icon: const Icon(Icons.add), label: const Text('Ürün ekle')),
                      ),
                    ),
                ]),
                const Divider(),
                for (final row in shown)
                  Container(
                    color: products.length > 1 && row.values.toSet().length > 1 ? const Color(0xFFFFFBEA) : null,
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      SizedBox(width: labelWidth, child: Padding(padding: const EdgeInsets.only(right: 8), child: Text(row.label, style: text.labelLarge))),
                      for (final cell in row.cells) SizedBox(width: columnWidth, child: Padding(padding: const EdgeInsets.only(right: 8), child: cell)),
                    ]),
                  ),
                if (onlyDifferences && shown.isEmpty) const Padding(padding: EdgeInsets.all(12), child: Text('Seçilen ürünler arasında fark bulunamadı.')),
              ]),
            ),
            Padding(
              padding: const EdgeInsets.all(XinobiTokens.gutterMobile),
              child: Text('Fiyat ve stok anlık bilgidir; sipariş adımında yeniden doğrulanır.', style: text.bodySmall),
            ),
          ]);
        },
      ),
    );
  }
}
