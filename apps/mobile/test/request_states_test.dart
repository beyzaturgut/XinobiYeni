import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/core/user_facing_error.dart';
import 'package:xinobi_mobile/features/account/auth.dart';
import 'package:xinobi_mobile/widgets/common.dart';

import 'account_test.dart' show FakeAccounts, pumpAccount;

/// Loading, error, empty and success answers that match the web's request states (WEB consistency audit C01–C07).
const _unavailable = AccountException('account_unavailable', 'Hesap işlemleri şu anda kullanılamıyor.');

Future<FakeAccounts> _withOrder() async {
  final accounts = FakeAccounts();
  final address = await accounts.saveAddress('t', null, SaveCustomerAddress((b) => b
    ..title = 'Ev'
    ..fullName = 'Ayşe Yılmaz'
    ..phone = '+905321234567'
    ..city = 'İstanbul'
    ..district = 'Kadıköy'
    ..line = 'Moda Cad. No: 1'
    ..isDefault = true));
  await accounts.placeOrder('t', PlaceOrder((b) => b
    ..addressId = address.id
    ..clientRequestId = 'request-1'
    ..items.add(PlaceOrderItem((i) => i
      ..productId = 'P1'
      ..variantId = 'V1'
      ..quantity = 1))));
  return accounts;
}

Future<void> _open(WidgetTester tester, String location) async {
  unawaited(GoRouter.of(tester.element(find.byType(Scaffold).first)).push(location));
  await tester.pumpAndSettle();
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('an unexpected error shows a general sentence, never its technical text', (tester) async {
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: ErrorView(error: StateError('Bad state: null check'), onRetry: () {}))));
    expect(find.text(unexpectedErrorMessage), findsOneWidget);
    expect(find.textContaining('Bad state'), findsNothing);
    await tester.pumpWidget(MaterialApp(home: Scaffold(body: ErrorView(error: _unavailable, onRetry: () {}))));
    expect(find.text('Hesap işlemleri şu anda kullanılamıyor.'), findsOneWidget);
  });

  testWidgets('order detail says when cancel and return rules failed and retries them', (tester) async {
    final accounts = await _withOrder();
    accounts.optionsFailure = _unavailable;
    await pumpAccount(tester, storedRefresh: 'refresh-old', accounts: accounts);
    await _open(tester, '/hesap/siparisler/o1');
    await tester.scrollUntilVisible(find.text('İptal ve iade seçenekleri yüklenemedi.'), 200, scrollable: find.byType(Scrollable).first);
    expect(find.widgetWithText(OutlinedButton, 'Siparişi iptal et'), findsNothing);
    accounts.optionsFailure = null;
    await tester.tap(find.text('Tekrar dene'));
    await tester.pumpAndSettle();
    expect(find.text('İptal ve iade seçenekleri yüklenemedi.'), findsNothing);
    expect(find.widgetWithText(OutlinedButton, 'Siparişi iptal et'), findsOneWidget);
  });

  testWidgets('a return form without its rules shows a retry, not "cannot be returned"', (tester) async {
    final accounts = await _withOrder();
    accounts.optionsFailure = _unavailable;
    await pumpAccount(tester, storedRefresh: 'refresh-old', accounts: accounts);
    await _open(tester, '/hesap/siparisler/o1/iade');
    expect(find.text('Hesap işlemleri şu anda kullanılamıyor.'), findsOneWidget);
    expect(find.text('Bu sipariş için iade talebi oluşturulamaz.'), findsNothing);
    accounts.optionsFailure = null;
    await tester.tap(find.text('Tekrar dene'));
    await tester.pumpAndSettle();
    expect(find.text('Bu sipariş için iade talebi oluşturulamaz.'), findsOneWidget, reason: 'A received order is not returnable; now the verdict is real.');
  });

  testWidgets('an unknown order on the return form ends in a message, not an endless spinner', (tester) async {
    await pumpAccount(tester, storedRefresh: 'refresh-old');
    await _open(tester, '/hesap/siparisler/missing/iade');
    expect(find.text('Sipariş bulunamadı. Siparişlerim listesinden tekrar seç.'), findsOneWidget);
  });

  testWidgets('marking notifications read reports a failure and locks while it runs', (tester) async {
    final accounts = FakeAccounts()
      ..notify('order', 'Siparişin kargoda')
      ..markReadFailure = _unavailable;
    await pumpAccount(tester, storedRefresh: 'refresh-old', accounts: accounts);
    await _open(tester, '/hesap/bildirimler');
    await tester.tap(find.text('Tümünü okundu say'));
    await tester.pumpAndSettle();
    expect(find.text('Hesap işlemleri şu anda kullanılamıyor.'), findsOneWidget);
    expect(find.text('Tümünü okundu say'), findsOneWidget, reason: 'Nothing was marked, so the action stays.');
    accounts.markReadFailure = null;
    await tester.tap(find.text('Tümünü okundu say'));
    await tester.pumpAndSettle();
    expect(find.text('Tüm bildirimler okundu olarak işaretlendi.'), findsOneWidget);
    expect(find.text('Tümünü okundu say'), findsNothing);
  });

  testWidgets('a refused design name stays editable with the reason; a saved one is confirmed', (tester) async {
    final accounts = FakeAccounts()
      ..savedDesigns.add(MyDesign((b) => b
        ..id = 'd1'
        ..kind = 'upload'
        ..name = 'Fotoğraf'
        ..productId = 'P1'
        ..productName = 'Çay Makinesi 101'
        ..variantId = 'V1'
        ..imageUrl = '/api/v1/me/designs/d1/image'
        ..createdAt = DateTime.utc(2026)))
      ..renameFailure = _unavailable;
    await pumpAccount(tester, storedRefresh: 'refresh-old', accounts: accounts);
    await _open(tester, '/hesap/tasarimlarim');
    await tester.tap(find.byTooltip('Fotoğraf için diğer işlemler'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Yeniden adlandır'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextField, 'Tasarım adı'), 'Bahçe');
    await tester.tap(find.widgetWithText(FilledButton, 'Kaydet'));
    await tester.pumpAndSettle();
    expect(find.text('Hesap işlemleri şu anda kullanılamıyor.'), findsOneWidget);
    expect(find.widgetWithText(TextField, 'Bahçe'), findsOneWidget, reason: 'The new name is kept for another try.');
    accounts.renameFailure = null;
    await tester.tap(find.widgetWithText(FilledButton, 'Kaydet'));
    await tester.pumpAndSettle();
    expect(find.text('Tasarım adı güncellendi.'), findsOneWidget);
    expect(find.text('Bahçe'), findsOneWidget);
    expect(accounts.savedDesigns.single.name, 'Bahçe');
  });
}
