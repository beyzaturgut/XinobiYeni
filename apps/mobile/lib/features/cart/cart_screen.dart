import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import '../../widgets/xinobi_header.dart';
import '../designs/designs.dart';
import 'cart.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lines = ref.watch(cartProvider);
    final items = ref.watch(cartItemsProvider);
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: const XinobiHeader(),
      body: lines.isEmpty
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Text('Sepetin boş.', style: text.titleLarge),
                  const SizedBox(height: 8),
                  const Text('Beğendiğin ürünü seçip rengini belirleyerek sepete ekleyebilirsin.', textAlign: TextAlign.center),
                  const SizedBox(height: 16),
                  FilledButton(onPressed: () => context.go('/urunler'), child: const Text('Ürünleri keşfet')),
                ]),
              ),
            )
          : items.when(
              loading: () => const LoadingView(),
              error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(cartItemsProvider)),
              data: (items) {
                final valid = items.where((item) => item.problem == CartProblem.none);
                final total = valid.fold(0, (sum, item) => sum + item.lineTotalMinor);
                final issues = items.length - valid.length;
                return RefreshIndicator(
                  onRefresh: () => ref.refresh(cartItemsProvider.future),
                  child: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
                    Semantics(header: true, child: Text('Sepetim', style: text.headlineSmall)),
                    const SizedBox(height: 12),
                    for (final item in items) Padding(padding: const EdgeInsets.only(bottom: 12), child: _CartRow(item: item)),
                    const Divider(height: 32),
                    Row(children: [
                      Expanded(child: Text('Ara toplam', style: text.titleMedium)),
                      Semantics(
                        liveRegion: true,
                        child: Text(formatMoney(Money((b) => b
                          ..amountMinor = total
                          ..currency = 'TRY')), style: text.titleLarge),
                      ),
                    ]),
                    if (issues > 0) ...[
                      const SizedBox(height: 6),
                      Text('$issues satır şu anda satın alınamıyor ve toplama dahil değil.', style: text.bodySmall?.copyWith(color: XinobiTokens.danger)),
                    ],
                    const SizedBox(height: 16),
                    FilledButton(
                      onPressed: issues == 0 && valid.isNotEmpty ? () => context.push('/odeme') : null,
                      child: const Text('Siparişi tamamla'),
                    ),
                    const SizedBox(height: 8),
                    // Demo checkout: payment, reservation and order rules still wait for D03/D05 (Faz05).
                    Text('Demo sipariş: ödeme alınmaz. Sepetin bu cihazda saklanır; web sepetiyle eşitlenmez.', style: text.bodySmall),
                  ]),
                );
              },
            ),
    );
  }
}

class _CartRow extends ConsumerWidget {
  const _CartRow({required this.item});
  final CartItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final text = Theme.of(context).textTheme;
    final cart = ref.read(cartProvider.notifier);
    final line = item.line;
    final variant = item.variant;
    final name = item.product?.name ?? 'Ürün';
    // Distinguishes two colours of the same product for screen readers.
    final label = variant == null ? name : '$name ${variant.color}';
    final canIncrease = variant != null && line.quantity < maxLineQuantity && variantUnits(ref.watch(cartProvider), line.variantId) < variant.maxQuantity.clamp(0, maxLineQuantity);
    Future<void> run(Future<void> Function() action) async {
      try {
        await action();
      } on CartException catch (error) {
        if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.message)));
      }
    }

    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(color: XinobiTokens.surface, border: Border.all(color: item.problem == CartProblem.none ? XinobiTokens.line : XinobiTokens.danger)),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        InkWell(
          onTap: line.designId == null ? null : () => context.push(Uri(path: '/tasarim-editoru', queryParameters: {
            'tasarim': line.designId!, 'urun': line.productId, 'renk': line.variantId, 'line': line.key,
            if (line.configurationId != null) 'configuration': line.configurationId!,
            if (line.configurationRevision != null) 'revision': '${line.configurationRevision}',
          }).toString()),
          child: SizedBox(width: 72, height: 72, child: line.designId != null ? DesignOnProduct(designId: line.designId!, configurationId: line.configurationId, configurationRevision: line.configurationRevision, placement: line.designPlacement, productId: line.productId, variant: variant, label: '$label üzerinde ${line.designName} tasarımı, düzenlemek için aç') : RemoteImage(variant?.imageUrl ?? item.product?.imageUrl)),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(name, style: text.titleMedium, maxLines: 2, overflow: TextOverflow.ellipsis),
            if (variant != null) Text(variant.color, style: text.bodySmall),
            if (line.designId != null)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text('Kişiselleştirilmiş · ${line.designName}', style: text.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
              ),
            const SizedBox(height: 4),
            if (variant != null) Text(formatMoney(variant.price), style: text.bodyMedium),
            if (item.problemText != null)
              Padding(padding: const EdgeInsets.only(top: 4), child: Text(item.problemText!, style: text.bodySmall?.copyWith(color: XinobiTokens.danger))),
            const SizedBox(height: 6),
            Row(children: [
              IconButton(
                tooltip: '$label adedini azalt',
                onPressed: () => run(() => cart.setLineQuantity(line.key, line.quantity - 1)),
                icon: const Icon(Icons.remove),
              ),
              Semantics(label: 'Adet ${line.quantity}', excludeSemantics: true, child: Text('${line.quantity}', style: text.titleMedium)),
              IconButton(
                tooltip: '$label adedini artır',
                onPressed: canIncrease ? () => run(() => cart.setLineQuantity(line.key, line.quantity + 1)) : null,
                icon: const Icon(Icons.add),
              ),
              const Spacer(),
              Semantics(
                label: '$label sepetten kaldır',
                button: true,
                excludeSemantics: true,
                onTap: () => run(() => cart.setLineQuantity(line.key, 0)),
                child: TextButton(onPressed: () => run(() => cart.setLineQuantity(line.key, 0)), child: const Text('Kaldır')),
              ),
            ]),
          ]),
        ),
      ]),
    );
  }
}
