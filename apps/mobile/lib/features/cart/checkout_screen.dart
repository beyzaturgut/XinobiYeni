import 'dart:math';

import 'package:built_collection/built_collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import '../account/account_widgets.dart';
import '../account/addresses.dart';
import '../account/auth.dart';
import '../account/orders.dart';
import 'cart.dart';

/// /odeme: demo checkout. The server prices the cart from the catalogue; no payment is taken and stock is not reserved.
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});
  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  /// One id per checkout attempt, so a retried request cannot create a second order.
  final requestId = List.generate(16, (_) => Random.secure().nextInt(256).toRadixString(16).padLeft(2, '0')).join();
  String? addressId;
  String? error;
  bool busy = false;

  Future<void> place(List<CartItem> items, String chosen) async {
    setState(() {
      busy = true;
      error = null;
    });
    final messenger = ScaffoldMessenger.of(context);
    final router = GoRouter.of(context);
    try {
      final order = await ref.read(authProvider.notifier).withSession((repository, token) => repository.placeOrder(
            token,
            PlaceOrder((b) => b
              ..addressId = chosen
              ..clientRequestId = requestId
              ..items = ListBuilder([
                for (final item in items)
                  PlaceOrderItem((i) => i
                    ..productId = item.line.productId
                    ..variantId = item.line.variantId
                    ..quantity = item.line.quantity
                    ..designId = item.line.designId),
              ])),
          ));
      if (order == null) return;
      await ref.read(cartProvider.notifier).clear();
      ref.invalidate(ordersProvider);
      messenger.showSnackBar(SnackBar(content: Text('Siparişin alındı: ${order.number}')));
      // Land on the account tab with the order on top, so back leads somewhere useful.
      router.go('/hesap');
      router.push('/hesap/siparisler/${order.id}');
    } on AccountException catch (problem) {
      if (problem.code == 'cart_changed') ref.invalidate(cartItemsProvider);
      if (mounted) setState(() => error = problem.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    if (ref.watch(authProvider) is! SignedIn) {
      return Scaffold(
        appBar: accountBar('Siparişi tamamla'),
        body: Padding(
          padding: const EdgeInsets.all(XinobiTokens.gutterMobile),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Sipariş vermek için hesabına giriş yap.', style: text.titleMedium),
            const SizedBox(height: 12),
            FilledButton(onPressed: () => context.go('/hesap'), child: const Text('Giriş yap veya üye ol')),
          ]),
        ),
      );
    }
    final items = ref.watch(cartItemsProvider);
    final addresses = ref.watch(addressesProvider);
    return Scaffold(
      appBar: accountBar('Siparişi tamamla'),
      body: switch ((items, addresses)) {
        (AsyncError(:final error), _) || (_, AsyncError(:final error)) => ErrorView(
            error: error,
            onRetry: () {
              ref.invalidate(cartItemsProvider);
              ref.invalidate(addressesProvider);
            },
          ),
        (AsyncData(value: final cart), AsyncData(value: final saved)) => _body(context, cart, saved),
        _ => const LoadingView(),
      },
    );
  }

  Widget _body(BuildContext context, List<CartItem> cart, List<CustomerAddress> saved) {
    final text = Theme.of(context).textTheme;
    final valid = cart.where((item) => item.problem == CartProblem.none).toList();
    final blocked = cart.isEmpty || valid.length != cart.length;
    final chosen = saved.where((address) => address.id == addressId).firstOrNull ?? saved.where((address) => address.isDefault).firstOrNull ?? saved.firstOrNull;
    final total = valid.fold(0, (sum, item) => sum + item.lineTotalMinor);
    return ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
      Container(
        padding: const EdgeInsets.all(12),
        color: XinobiTokens.surface,
        child: Text('Demo sipariş: kart bilgisi istenmez, ödeme alınmaz; kargo ve stok işlemi yapılmaz.', style: text.bodySmall),
      ),
      const SizedBox(height: 20),
      Row(children: [
        Expanded(child: Text('Teslimat adresi', style: text.titleMedium)),
        TextButton.icon(onPressed: () => context.push('/hesap/adresler/yeni'), icon: const Icon(Icons.add), label: const Text('Yeni adres')),
      ]),
      const SizedBox(height: 8),
      if (saved.isEmpty)
        const Text('Sipariş için bir teslimat adresi ekle.')
      else
        for (final address in saved)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: AddressCard(address: address, selected: address.id == chosen?.id, onTap: () => setState(() => addressId = address.id)),
          ),
      const SizedBox(height: 16),
      Text('Sipariş özeti', style: text.titleMedium),
      const SizedBox(height: 8),
      for (final item in cart)
        Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(children: [
            Expanded(child: Text('${item.product?.name ?? 'Ürün'}${item.variant == null ? '' : ' · ${item.variant!.color}'}${item.line.designName == null ? '' : ' · Tasarım: ${item.line.designName}'} × ${item.line.quantity}', style: text.bodyMedium)),
            Text(item.problem == CartProblem.none ? formatMoney(Money((b) => b
              ..amountMinor = item.lineTotalMinor
              ..currency = 'TRY')) : 'Satın alınamaz', style: text.bodyMedium?.copyWith(color: item.problem == CartProblem.none ? null : XinobiTokens.danger)),
          ]),
        ),
      const Divider(height: 24),
      Row(children: [
        Expanded(child: Text('Toplam', style: text.titleMedium)),
        Text(formatMoney(Money((b) => b
          ..amountMinor = total
          ..currency = 'TRY')), style: text.titleLarge),
      ]),
      if (blocked) ...[
        const SizedBox(height: 8),
        Text('Sepetinde satın alınamayan ürünler var. Sepetine dönüp düzelt.', style: text.bodySmall?.copyWith(color: XinobiTokens.danger)),
      ],
      FormErrorText(error),
      const SizedBox(height: 16),
      FilledButton(
        onPressed: busy || blocked || chosen == null ? null : () => place(valid, chosen.id),
        child: Text(busy ? 'Sipariş veriliyor…' : 'Demo siparişi ver'),
      ),
    ]);
  }
}
