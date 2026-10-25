import 'package:built_collection/built_collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import 'account_widgets.dart';
import 'order_product_image.dart';
import 'addresses.dart';
import 'auth.dart';
import 'notifications.dart';

/// The signed-in customer's orders, newest first. Empty when signed out.
final ordersProvider = FutureProvider.autoDispose<List<CustomerOrder>>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return const [];
  return await ref.read(authProvider.notifier).withSession((repository, token) => repository.orders(token)) ?? const [];
});

/// Cancel/return reasons, carriers and the return window, as the server applies them.
final orderOptionsProvider = FutureProvider.autoDispose<OrderOptions?>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return null;
  return ref.read(authProvider.notifier).withSession((repository, token) => repository.orderOptions(token));
});

const orderSteps = ['received', 'preparing', 'shipped', 'delivered'];

String orderStatusText(String status) => switch (status) {
      'received' => 'Sipariş alındı',
      'preparing' => 'Hazırlanıyor',
      'shipped' => 'Kargoya verildi',
      'delivered' => 'Teslim edildi',
      'cancelled' => 'İptal edildi',
      'returned' => 'İade edildi',
      _ => status,
    };

String requestStatusText(OrderRequest request) => '${request.type == 'cancel' ? 'İptal' : 'İade'} talebi · ${switch (request.status) {
      'requested' => 'Değerlendiriliyor',
      'approved' => 'Onaylandı',
      'rejected' => 'Kabul edilmedi',
      'completed' => 'Tamamlandı',
      _ => request.status,
    }}';

String orderDate(DateTime value) {
  final local = value.toLocal();
  String two(int n) => n.toString().padLeft(2, '0');
  return '${two(local.day)}.${two(local.month)}.${local.year} ${two(local.hour)}:${two(local.minute)}';
}

OrderRequest? pendingRequest(CustomerOrder order, String type) =>
    order.requests?.where((item) => item.type == type && (item.status == 'requested' || item.status == 'approved')).firstOrNull;

bool canCancel(CustomerOrder order) => (order.status == 'received' || order.status == 'preparing') && pendingRequest(order, 'cancel') == null;

/// What can still be returned per variant: delivered, inside the window, minus open or completed returns. Mirrors the server rule.
Map<String, int> returnable(CustomerOrder order, int windowDays, {DateTime? now}) {
  if (order.status != 'delivered') return const {};
  final delivered = order.shipment?.deliveredAt ?? order.history?.where((item) => item.status == 'delivered').lastOrNull?.at;
  if (delivered != null && (now ?? DateTime.now()).isAfter(delivered.add(Duration(days: windowDays)))) return const {};
  final left = <String, int>{};
  for (final line in order.lines) {
    left[line.variantId] = (left[line.variantId] ?? 0) + line.quantity;
  }
  for (final request in order.requests ?? BuiltList<OrderRequest>()) {
    if (request.type != 'return' || request.status == 'rejected') continue;
    for (final line in request.lines) {
      if (left.containsKey(line.variantId)) left[line.variantId] = left[line.variantId]! - line.quantity;
    }
  }
  return {for (final entry in left.entries) if (entry.value > 0) entry.key: entry.value};
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
                    if (index == 0) return Text('Demo siparişler: ödeme alınmaz. Kargo, iptal ve iade adımlarını mağaza yürütür; her değişiklikte bildirim alırsın.', style: text.bodySmall);
                    final order = items[index - 1];
                    final count = order.lines.fold(0, (sum, line) => sum + line.quantity);
                    final open = order.requests?.where((item) => item.status == 'requested' || item.status == 'approved').firstOrNull;
                    return Material(
                      color: XinobiTokens.surface,
                      shape: RoundedRectangleBorder(side: const BorderSide(color: XinobiTokens.line), borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall)),
                      child: ListTile(
                        title: Text(order.number),
                        subtitle: Text('${orderDate(order.createdAt)} · $count ürün · ${orderStatusText(order.status)}${open == null ? '' : '\n${requestStatusText(open)}'}'),
                        isThreeLine: open != null,
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

/// Step indicator for the main path; cancelled and returned orders show where they ended instead.
class OrderSteps extends StatelessWidget {
  const OrderSteps({super.key, required this.order});
  final CustomerOrder order;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    if (order.status == 'cancelled' || order.status == 'returned') {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: const Color(0xFFF6F6F6), borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall)),
        child: Text(orderStatusText(order.status), style: text.titleMedium?.copyWith(color: XinobiTokens.danger)),
      );
    }
    final reached = orderSteps.indexOf(order.status);
    return Semantics(
      label: 'Sipariş durumu: ${orderStatusText(order.status)}, ${reached + 1}. adım / 4',
      child: ExcludeSemantics(
        child: Row(children: [
          for (var i = 0; i < orderSteps.length; i++)
            Expanded(
              child: Column(children: [
                CircleAvatar(
                  radius: 14,
                  backgroundColor: i <= reached ? XinobiTokens.teal : XinobiTokens.line,
                  foregroundColor: i <= reached ? XinobiTokens.onHeader : XinobiTokens.muted,
                  child: Text(i < reached ? '✓' : '${i + 1}', style: const TextStyle(fontSize: 12)),
                ),
                const SizedBox(height: 4),
                Text(orderStatusText(orderSteps[i]), textAlign: TextAlign.center, style: text.labelSmall?.copyWith(color: i <= reached ? XinobiTokens.ink : XinobiTokens.muted)),
              ]),
            ),
        ]),
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
    final options = ref.watch(orderOptionsProvider).value;
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: accountBar('Sipariş detayı'),
      body: orders.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(ordersProvider)),
        data: (items) {
          final order = items.where((item) => item.id == orderId).firstOrNull;
          if (order == null) return const Center(child: Text('Sipariş bulunamadı.'));
          final left = options == null ? const <String, int>{} : returnable(order, options.returnWindowDays);
          final shipment = order.shipment;
          return RefreshIndicator(
            onRefresh: () => ref.refresh(ordersProvider.future),
            child: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
              Semantics(header: true, child: Text(order.number, style: text.headlineSmall)),
              const SizedBox(height: 4),
              Text('${orderDate(order.createdAt)} · ${orderStatusText(order.status)}', style: text.bodySmall),
              const SizedBox(height: 16),
              OrderSteps(order: order),
              if (shipment != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(border: Border.all(color: XinobiTokens.line), borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text('Kargo', style: text.titleMedium),
                    const SizedBox(height: 6),
                    Text('${shipment.carrier} · ${shipment.deliveredAt == null ? 'kargoya verildi ${orderDate(shipment.shippedAt)}' : 'teslim ${orderDate(shipment.deliveredAt!)}'}', style: text.bodyMedium),
                    Row(children: [
                      Expanded(child: SelectableText('Takip no: ${shipment.trackingNumber}', style: text.titleSmall)),
                      IconButton(
                        tooltip: 'Takip numarasını kopyala',
                        icon: const Icon(Icons.copy_outlined),
                        onPressed: () async {
                          await Clipboard.setData(ClipboardData(text: shipment.trackingNumber));
                          if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Takip numarası kopyalandı.')));
                        },
                      ),
                    ]),
                    if (shipment.trackingUrl != null) SelectableText(shipment.trackingUrl!, style: text.bodySmall),
                    if (shipment.trackingUrl == null) Text('Takip numarasıyla kargo firmasının sitesinden sorgulayabilirsin.', style: text.bodySmall),
                  ]),
                ),
              ],
              for (final request in order.requests ?? BuiltList<OrderRequest>()) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFAFAFA),
                    border: Border(left: BorderSide(width: 3, color: request.status == 'rejected' ? XinobiTokens.danger : request.status == 'requested' ? XinobiTokens.line : XinobiTokens.success)),
                  ),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(requestStatusText(request), style: text.titleSmall),
                    Text('${request.reason} · ${orderDate(request.createdAt)}', style: text.bodySmall),
                    if (request.resolution != null) Text('Mağaza notu: ${request.resolution}', style: text.bodySmall),
                  ]),
                ),
              ],
              const SizedBox(height: 20),
              for (final (index, line) in order.lines.indexed)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    OrderProductThumbnail(orderId: order.id, index: index, line: line),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(line.name, style: text.titleMedium),
                        Text('${line.color} · ${line.quantity} × ${formatMoney(line.unitPrice)}', style: text.bodySmall),
                        if (line.personalization != null) Text('Kişiselleştirilmiş · ${line.personalization!.name}', style: text.bodySmall),
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
              const SizedBox(height: 24),
              if (canCancel(order) && options != null)
                OutlinedButton(
                  onPressed: () => showModalBottomSheet<void>(
                    context: context,
                    isScrollControlled: true,
                    builder: (_) => CancelOrderSheet(order: order, reasons: options.cancelReasons.toList()),
                  ),
                  child: Text(order.status == 'preparing' ? 'İptal talebi oluştur' : 'Siparişi iptal et'),
                ),
              if (pendingRequest(order, 'cancel') != null) Text('İptal talebin değerlendiriliyor.', style: text.bodySmall),
              if (order.status == 'shipped') Text('Kargodaki sipariş iptal edilemez; teslimattan sonra ${options?.returnWindowDays ?? 14} gün içinde iade talebi oluşturabilirsin.', style: text.bodySmall),
              if (left.isNotEmpty)
                OutlinedButton(onPressed: () => context.push('/hesap/siparisler/${order.id}/iade'), child: const Text('İade talebi oluştur')),
              const SizedBox(height: 12),
              Text('Demo sipariş: ödeme alınmadı; iptal veya iadede geri ödeme yapılmaz.', style: text.bodySmall),
            ]),
          );
        },
      ),
    );
  }
}

class CancelOrderSheet extends ConsumerStatefulWidget {
  const CancelOrderSheet({super.key, required this.order, required this.reasons});
  final CustomerOrder order;
  final List<String> reasons;
  @override
  ConsumerState<CancelOrderSheet> createState() => _CancelOrderSheetState();
}

class _CancelOrderSheetState extends ConsumerState<CancelOrderSheet> {
  String? reason;
  final description = TextEditingController();
  bool busy = false;
  String? error;

  @override
  void dispose() {
    description.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await ref.read(authProvider.notifier).withSession((repository, token) => repository.cancelOrder(token, widget.order.id, CancelMyOrder((b) => b
        ..reason = reason
        ..description = description.text.trim().isEmpty ? null : description.text.trim())));
      ref.invalidate(ordersProvider);
      ref.invalidate(inboxProvider);
      if (mounted) Navigator.of(context).pop();
    } on AccountException catch (e) {
      setState(() => error = e.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final preparing = widget.order.status == 'preparing';
    final text = Theme.of(context).textTheme;
    return Padding(
      padding: EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 20, XinobiTokens.gutterMobile, 20 + MediaQuery.viewInsetsOf(context).bottom),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text(preparing ? 'İptal talebi oluştur' : 'Siparişi iptal et', style: text.titleLarge),
        const SizedBox(height: 8),
        Text(preparing ? 'Siparişin hazırlanıyor; talebini inceleyip sonucu bildireceğiz.' : 'Sipariş hazırlanmadan hemen iptal edilir.', style: text.bodySmall),
        const SizedBox(height: 16),
        DropdownButtonFormField<String>(
          isExpanded: true,
          initialValue: reason,
          decoration: accountField('İptal nedeni'),
          items: [for (final item in widget.reasons) DropdownMenuItem(value: item, child: Text(item))],
          onChanged: (value) => setState(() => reason = value),
        ),
        const SizedBox(height: 12),
        TextField(controller: description, maxLength: 1000, maxLines: 3, decoration: accountField('Açıklama (isteğe bağlı)')),
        FormErrorText(error),
        const SizedBox(height: 8),
        FilledButton(onPressed: reason == null || busy ? null : submit, child: Text(busy ? 'Gönderiliyor…' : preparing ? 'Talebi gönder' : 'Siparişi iptal et')),
      ]),
    );
  }
}

/// /hesap/siparisler/:id/iade
class ReturnRequestScreen extends ConsumerStatefulWidget {
  const ReturnRequestScreen({super.key, required this.orderId});
  final String orderId;
  @override
  ConsumerState<ReturnRequestScreen> createState() => _ReturnRequestScreenState();
}

class _ReturnRequestScreenState extends ConsumerState<ReturnRequestScreen> {
  final quantities = <String, int>{};
  final description = TextEditingController();
  String? reason;
  bool busy = false;
  String? error;

  @override
  void dispose() {
    description.dispose();
    super.dispose();
  }

  Future<void> submit(CustomerOrder order) async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await ref.read(authProvider.notifier).withSession((repository, token) => repository.returnOrder(token, order.id, ReturnMyOrder((b) => b
        ..reason = reason
        ..description = description.text.trim().isEmpty ? null : description.text.trim()
        ..lines.replace([
          for (final entry in quantities.entries)
            if (entry.value > 0)
              OrderRequestLine((line) => line
                ..variantId = entry.key
                ..quantity = entry.value),
        ]))));
      ref.invalidate(ordersProvider);
      ref.invalidate(inboxProvider);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('İade talebin alındı. Sonucu bildirim ile ileteceğiz.')));
      context.pop();
    } on AccountException catch (e) {
      setState(() => error = e.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final orders = ref.watch(ordersProvider);
    final options = ref.watch(orderOptionsProvider).value;
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: accountBar('İade talebi'),
      body: orders.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(ordersProvider)),
        data: (items) {
          final order = items.where((item) => item.id == widget.orderId).firstOrNull;
          if (order == null || options == null) return const LoadingView();
          final left = returnable(order, options.returnWindowDays);
          if (left.isEmpty) return const Center(child: Padding(padding: EdgeInsets.all(24), child: Text('Bu sipariş için iade talebi oluşturulamaz.')));
          final chosen = quantities.values.any((count) => count > 0);
          return ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
            Text('${order.number} · teslimattan sonra ${options.returnWindowDays} gün içinde iade talebi oluşturabilirsin.', style: text.bodySmall),
            const SizedBox(height: 16),
            Text('Ürünler', style: text.titleMedium),
            // A colour may sit on several lines (plain and with designs); returns count per colour, so it is listed once.
            for (final line in order.lines.where((line) => left.containsKey(line.variantId) && order.lines.indexWhere((other) => other.variantId == line.variantId) == order.lines.indexOf(line)))
              CheckboxListTile(
                contentPadding: EdgeInsets.zero,
                value: (quantities[line.variantId] ?? 0) > 0,
                onChanged: (value) => setState(() => quantities[line.variantId] = value == true ? 1 : 0),
                title: Text(line.name),
                subtitle: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('${line.color} · iade edilebilir: ${left[line.variantId]}'),
                  if ((quantities[line.variantId] ?? 0) > 0 && left[line.variantId]! > 1)
                    DropdownButton<int>(
                      value: quantities[line.variantId],
                      items: [for (var i = 1; i <= left[line.variantId]!; i++) DropdownMenuItem(value: i, child: Text('$i adet'))],
                      onChanged: (value) => setState(() => quantities[line.variantId] = value ?? 1),
                    ),
                ]),
              ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              isExpanded: true,
              initialValue: reason,
              decoration: accountField('İade nedeni'),
              items: [for (final item in options.returnReasons) DropdownMenuItem(value: item, child: Text(item))],
              onChanged: (value) => setState(() => reason = value),
            ),
            const SizedBox(height: 12),
            TextField(controller: description, maxLength: 1000, maxLines: 4, decoration: accountField('Açıklama (isteğe bağlı)')),
            FormErrorText(error),
            const SizedBox(height: 8),
            FilledButton(onPressed: !chosen || reason == null || busy ? null : () => submit(order), child: Text(busy ? 'Gönderiliyor…' : 'İade talebini gönder')),
            const SizedBox(height: 12),
            Text('Onaylanırsa ürünü orijinal kutusuyla kargoya verirsin; ürün depoya ulaşınca iade tamamlanır. Demo siparişte geri ödeme yapılmaz.', style: text.bodySmall),
          ]);
        },
      ),
    );
  }
}
