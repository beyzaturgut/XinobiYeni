import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_mobile/features/account/auth.dart';
import 'package:xinobi_mobile/features/favorites/favorites.dart';

import 'account_test.dart' show FakeAccounts, pumpAccount;
import 'cart_test.dart' show CartCatalog;

const _unavailable = AccountException('account_unavailable', 'Hesap işlemleri şu anda kullanılamıyor.');

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('old device favourites are parsed safely before they move to the account', () {
    expect(parseFavorites(jsonEncode(['P1', 'P1', '', 7, 'P2'])), ['P1', 'P2']);
    expect(parseFavorites('{"orders":[]}'), isEmpty);
    expect(parseFavorites('not json'), isEmpty);
  });

  testWidgets('the heart saves to the account the web reads, and the list removes it again', (tester) async {
    final (accounts, _) = await pumpAccount(tester, storedRefresh: 'refresh-old', location: '/urunler', catalog: CartCatalog());
    await tester.tap(find.byTooltip('Çay Makinesi 101 ürününü favorilere ekle'));
    await tester.pumpAndSettle();
    expect(find.byTooltip('Çay Makinesi 101 ürününü favorilerden çıkar'), findsOneWidget);
    expect(find.text('Favorilere eklendi.'), findsOneWidget);
    expect(accounts.favoriteIds, ['P1']);

    // Another device (the web) sees the same account list.
    await tester.pumpWidget(const SizedBox());
    await pumpAccount(tester, storedRefresh: 'refresh-old', location: '/favoriler', catalog: CartCatalog(), accounts: accounts);
    expect(find.text('1 favori ürün'), findsOneWidget);
    expect(find.text('Çay Makinesi 101'), findsOneWidget);
    expect(find.text('Favorilerin hesabına kaydedilir; web ve mobilde aynı listeyi görürsün.'), findsOneWidget);
    await tester.tap(find.byTooltip('Çay Makinesi 101 ürününü favorilerden çıkar'));
    await tester.pumpAndSettle();
    expect(find.text('Favori listen henüz boş.'), findsOneWidget);
    expect(accounts.favoriteIds, isEmpty);
  });

  testWidgets('a failed favourite request is reported and the heart keeps its real state', (tester) async {
    final (accounts, _) = await pumpAccount(tester, storedRefresh: 'refresh-old', location: '/urunler/P1', catalog: CartCatalog());
    accounts.favoritesFailure = _unavailable;
    await tester.ensureVisible(find.text('Favorilere ekle'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Favorilere ekle'));
    await tester.pumpAndSettle();
    expect(find.text('Hesap işlemleri şu anda kullanılamıyor.'), findsOneWidget);
    expect(find.text('Favorilere ekle'), findsOneWidget);
    accounts.favoritesFailure = null;
    await tester.tap(find.text('Favorilere ekle'));
    await tester.pumpAndSettle();
    expect(find.text('Favorilerde'), findsOneWidget);
    expect(accounts.favoriteIds, ['P1']);
  });

  testWidgets('a list that cannot load shows an error with retry, not an empty list', (tester) async {
    final accounts = FakeAccounts()..favoritesFailure = _unavailable;
    await pumpAccount(tester, storedRefresh: 'refresh-old', location: '/favoriler', catalog: CartCatalog(), accounts: accounts);
    expect(find.text('Hesap işlemleri şu anda kullanılamıyor.'), findsOneWidget);
    expect(find.text('Favori listen henüz boş.'), findsNothing);
    accounts
      ..favoritesFailure = null
      ..favoriteIds.add('P1');
    await tester.tap(find.text('Tekrar dene'));
    await tester.pumpAndSettle();
    expect(find.text('1 favori ürün'), findsOneWidget);
  });

  testWidgets('old device favourites move to the account at sign-in; unpublished ones are dropped', (tester) async {
    SharedPreferences.setMockInitialValues({favoritesStorageKey: jsonEncode(['P9', 'P1'])});
    final (accounts, _) = await pumpAccount(tester, storedRefresh: 'refresh-old', keepPreferences: true, location: '/favoriler', catalog: CartCatalog());
    expect(accounts.favoriteIds, ['P1']);
    expect((await SharedPreferences.getInstance()).containsKey(favoritesStorageKey), isFalse);
    expect(find.text('1 favori ürün'), findsOneWidget);
  });

  testWidgets('clearing asks first and empties the account list', (tester) async {
    final accounts = FakeAccounts()..favoriteIds.add('P1');
    await pumpAccount(tester, storedRefresh: 'refresh-old', location: '/favoriler', catalog: CartCatalog(), accounts: accounts);
    await tester.tap(find.text('Tümünü temizle'));
    await tester.pumpAndSettle();
    expect(find.text('Tüm favoriler çıkarılsın mı?'), findsOneWidget);
    await tester.tap(find.widgetWithText(FilledButton, 'Tümünü temizle'));
    await tester.pumpAndSettle();
    expect(accounts.favoriteIds, isEmpty);
    expect(find.text('Favori listen henüz boş.'), findsOneWidget);
    expect(find.text('Favori listen temizlendi.'), findsOneWidget);
  });

  testWidgets('signed out, the list asks for sign-in and the heart opens it, then saves the product', (tester) async {
    final (accounts, _) = await pumpAccount(tester, location: '/favoriler', catalog: CartCatalog());
    expect(find.text('Favorilerini görmek için giriş yap.'), findsOneWidget);
    expect(find.text('Favori listen henüz boş.'), findsNothing);

    await tester.pumpWidget(const SizedBox());
    await pumpAccount(tester, location: '/urunler', catalog: CartCatalog(), accounts: accounts);
    await tester.tap(find.byTooltip('Çay Makinesi 101 ürününü favorilere ekle'));
    await tester.pumpAndSettle();
    expect(find.text(favoritesSignInMessage), findsOneWidget);
    expect(find.text('Giriş yap'), findsWidgets);
    await tester.enterText(find.widgetWithText(TextField, 'E-posta'), 'ayse@example.com');
    await tester.enterText(find.widgetWithText(TextField, 'Parola'), 'guclu-parola-1');
    await tester.tap(find.widgetWithText(FilledButton, 'Giriş yap'));
    await tester.pumpAndSettle();
    expect(accounts.favoriteIds, ['P1'], reason: 'The product chosen before sign-in is saved afterwards.');
    expect(find.byTooltip('Çay Makinesi 101 ürününü favorilerden çıkar'), findsOneWidget);
  });
}
