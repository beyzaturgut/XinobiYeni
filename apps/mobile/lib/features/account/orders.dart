import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import 'account_widgets.dart';
import 'addresses.dart';
import 'auth.dart';

/// The signed-in customer's demo orders, newest first. Empty when signed out.
final ordersProvider = FutureProvider.autoDispose<List<CustomerOrder>>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return const [];
  return await ref.read(authProvider.notifier).withSession((repository, token) => repository.orders(token)) ?? const [];
});

String orderStatusText(String status) => switch (status) { 'received' => 'Sipariş alındı', _ => status };

String orderDate(DateTime value) {
  final local = value.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(local.day)}.${two(local.month)}.${local.year} ${two(local.hour)}:${two(local.minute)}';
}

/// /hesap/siparisler
class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: accountBar('Siparişlerim'),
      body: orders.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(ordersProvider)),
        data: (items) => items.isEmpty
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(mainAxisSize: MainAxisSize.min, children: [
                    Text('Henüz siparişin yok.', style: text.titleMedium),
                    const SizedBox(height: 12),
                    FilledButton(onPressed: () => context.go('/urunler'), child: const Text('Ürünleri keşfet')),
                  ]),
                ),
              )
            : RefreshIndicator(
                onRefresh: () => ref.refresh(ordersProvider.future),
                child: ListView.separated(
                  padding: const EdgeInsets.all(XinobiTokens.gutterMobile),
                  itemCount: items.length + 1,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    if (index == 0) return Text('Demo siparişler: ödeme alınmaz, kargo ve stok işlemi yapılmaz.', style: text.bodySmall);
                    final order = items[index - 1];
                    final count = order.lines.fold(0, (sum, line) => sum + line.quantity);
                    return Material(
                      color: XinobiTokens.surface,
                      shape: RoundedRectangleBorder(side: const BorderSide(color: XinobiTokens.line), borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall)),
                      child: ListTile(
                        title: Text(order.number),
                        subtitle: Text('${orderDate(order.createdAt)} · $count ürün · ${orderStatusText(order.status)}'),
                        trailing: Text(formatMoney(order.total), style: text.titleMedium),
                        onTap: () => context.push('/hesap/siparisler/${order.id}'),
                      ),
                    );
                  },
                ),
              ),
      ),
    );
  }
}

/// /hesap/siparisler/:id
class OrderDetailScreen extends ConsumerWidget {
  const OrderDetailScreen({super.key, required this.orderId});
  final String orderId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(ordersProvider);
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: accountBar('Sipariş detayı'),
      body: orders.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(ordersProvider)),
        data: (items) {
          final order = items.where((item) => item.id == orderId).firstOrNull;
          if (order == null) return const Center(child: Text('Sipariş bulunamadı.'));
          return ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
            Semantics(header: true, child: Text(order.number, style: text.headlineSmall)),
            const SizedBox(height: 4),
            Text('${orderDate(order.createdAt)} · ${orderStatusText(order.status)}', style: text.bodySmall),
            const SizedBox(height: 4),
            Text('Demo sipariş: ödeme alınmadı, kargo ve stok işlemi yapılmadı.', style: text.bodySmall),
            const SizedBox(height: 20),
            for (final line in order.lines)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  SizedBox(width: 64, height: 64, child: ColoredBox(color: XinobiTokens.surface, child: RemoteImage(line.imageUrl, label: '${line.name}, ${line.color}'))),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(line.name, style: text.titleMedium),
                      Text('${line.color} · ${line.quantity} × ${formatMoney(line.unitPrice)}', style: text.bodySmall),
                    ]),
                  ),
                  Text(formatMoney(line.lineTotal), style: text.bodyMedium),
                ]),
              ),
            const Divider(height: 24),
            Row(children: [
              Expanded(child: Text('Toplam', style: text.titleMedium)),
              Text(formatMoney(order.total), style: text.titleLarge),
            ]),
            const SizedBox(height: 24),
            Text('Teslimat adresi', style: text.titleMedium),
            const SizedBox(height: 8),
            AddressCard(address: order.address, showDefault: false),
          ]);
        },
      ),
    );
  }
}
