import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_mobile/features/favorites/favorites.dart';

import 'account_test.dart' show pumpAccount;
import 'cart_test.dart' show pumpApp;

Future<List<String>> stored() async => parseFavorites((await SharedPreferences.getInstance()).getString(favoritesStorageKey));

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('stored favourites use the web key and drop invalid entries', () {
    expect(parseFavorites(jsonEncode(['P1', 'P1', '', 7, 'P2'])), ['P1', 'P2']);
    expect(parseFavorites('{"orders":[]}'), isEmpty);
    expect(parseFavorites('not json'), isEmpty);
  });

  testWidgets('the heart on a product card saves it and the list removes it again', (tester) async {
    await pumpApp(tester, '/urunler');
    await tester.tap(find.byTooltip('Çay Makinesi 101 ürününü favorilere ekle'));
    await tester.pumpAndSettle();
    expect(find.byTooltip('Çay Makinesi 101 ürününü favorilerden çıkar'), findsOneWidget);
    expect(await stored(), ['P1']);

    // A fresh app over the same device storage.
    await tester.pumpWidget(const SizedBox());
    await pumpApp(tester, '/favoriler');
    expect(find.text('1 favori ürün'), findsOneWidget);
    expect(find.text('Çay Makinesi 101'), findsOneWidget);
    expect(find.text('Bu liste yalnız bu cihazda tutulur.'), findsOneWidget);
    await tester.tap(find.byTooltip('Çay Makinesi 101 ürününü favorilerden çıkar'));
    await tester.pumpAndSettle();
    expect(find.text('Favori listen henüz boş.'), findsOneWidget);
    expect(await stored(), isEmpty);
  });

  testWidgets('the product page heart toggles the same favourite', (tester) async {
    await pumpApp(tester, '/urunler/P1');
    await tester.tap(find.byTooltip('Çay Makinesi 101 ürününü favorilere ekle'));
    await tester.pumpAndSettle();
    expect(await stored(), ['P1']);
    await tester.tap(find.byTooltip('Çay Makinesi 101 ürününü favorilerden çıkar'));
    await tester.pumpAndSettle();
    expect(await stored(), isEmpty);
  });

  testWidgets('an unpublished favourite is explained and can be removed', (tester) async {
    SharedPreferences.setMockInitialValues({favoritesStorageKey: jsonEncode(['P9', 'P1'])});
    await pumpApp(tester, '/favoriler');
    expect(find.text('2 favori ürün'), findsOneWidget);
    expect(find.text('Bu ürün artık yayında değil.'), findsOneWidget);
    await tester.tap(find.byTooltip('Yayından kalkan ürünü favorilerden çıkar'));
    await tester.pumpAndSettle();
    expect(await stored(), ['P1']);
    await tester.tap(find.text('Tümünü temizle'));
    await tester.pumpAndSettle();
    expect(find.text('Favori listen henüz boş.'), findsOneWidget);
  });

  testWidgets('signed out, the account tab shows only sign-in and registration (favourites stay in the header)', (tester) async {
    SharedPreferences.setMockInitialValues({favoritesStorageKey: jsonEncode(['P1'])});
    await pumpAccount(tester, keepPreferences: true);
    expect(find.text('Favorilerim'), findsNothing);
    await tester.tap(find.byTooltip('Favorilerim'));
    await tester.pumpAndSettle();
    expect(find.text('1 favori ürün'), findsOneWidget);
  });
}
