import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_riverpod/misc.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/account/auth.dart';
import 'package:xinobi_mobile/features/cart/cart.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/main.dart';
import 'package:xinobi_mobile/widgets/common.dart';
import 'package:xinobi_mobile/app/theme.dart';

import 'account_test.dart' show FakeAccounts, MemoryTokens;
import 'cart_test.dart' show CartCatalog;

/// Every routed screen at phone/tablet widths with normal and doubled text, signed in with data so lists and cards render.
/// Layout overflow or any thrown error fails the cell. This is a widget-level check, not a device or screen-reader test.
const signedInRoutes = [
  '/', '/urunler', '/urunler/P1', '/xinobi-u', '/sepet', '/hesap', '/favoriler', '/karsilastir', '/duyurular',
  '/hesap/profil', '/hesap/parola', '/hesap/eposta', '/hesap/sil', '/hesap/adresler', '/hesap/adresler/yeni', '/hesap/adresler/a1',
  '/hesap/siparisler', '/hesap/siparisler/o1', '/hesap/siparisler/o1/iade', '/hesap/bildirimler', '/hesap/tasarimlarim',
  '/hesap/teklifler', '/kurumsal/teklif', '/kurumsal/teklif/takip', '/odeme', '/nobi',
];
const signedOutRoutes = ['/hesap', '/giris', '/favoriler', '/hesap/parola-sifirla', '/odeme', '/hesap/bildirimler'];
const sizes = [Size(320, 640), Size(390, 844), Size(700, 1000)];

Future<FakeAccounts> _accounts() async {
  final accounts = FakeAccounts()
    ..favoriteIds.add('P1')
    ..notify('order', 'Siparişin kargoya verildi; takip numarası ve tahmini teslim tarihi sipariş detayında')
    ..savedDesigns.add(MyDesign((b) => b
      ..id = 'd1'
      ..kind = 'upload'
      ..name = 'Bahçede çok uzun adlı kişisel fotoğraf tasarımım'
      ..productId = 'P1'
      ..productName = 'Çay Makinesi 101'
      ..variantId = 'V1'
      ..imageUrl = '/api/v1/me/designs/d1/image'
      ..createdAt = DateTime.utc(2026)));
  final address = await accounts.saveAddress('t', null, SaveCustomerAddress((b) => b
    ..title = 'Ev adresi (uzun başlık)'
    ..fullName = 'Ayşe Yılmaz Uzunsoyadlı'
    ..phone = '+905321234567'
    ..city = 'İstanbul'
    ..district = 'Kadıköy'
    ..line = 'Caferağa Mah. Moda Cad. No: 123 Daire: 45, çok uzun açık adres satırı'
    ..isDefault = true));
  await accounts.placeOrder('t', PlaceOrder((b) => b
    ..addressId = address.id
    ..clientRequestId = 'request-1'
    ..items.add(PlaceOrderItem((i) => i
      ..productId = 'P1'
      ..variantId = 'V1'
      ..quantity = 2))));
  return accounts;
}

Future<void> _pump(WidgetTester tester, String location, Size size, double scale, {required bool signedIn}) async {
  SharedPreferences.setMockInitialValues({cartStorageKey: jsonEncode([{'productId': 'P1', 'variantId': 'V1', 'quantity': 2}])});
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  tester.platformDispatcher.textScaleFactorTestValue = scale;
  addTearDown(tester.view.reset);
  addTearDown(tester.platformDispatcher.clearTextScaleFactorTestValue);
  await tester.pumpWidget(ProviderScope(
    retry: noAutomaticRetry,
    overrides: <Override>[
      catalogRepositoryProvider.overrideWithValue(CartCatalog()),
      accountRepositoryProvider.overrideWithValue(await _accounts()),
      tokenStoreProvider.overrideWithValue(MemoryTokens(signedIn ? 'refresh-old' : null)),
    ],
    child: XinobiApp(initialLocation: location),
  ));
  // Bounded settle: some screens keep a progress animation while their (offline) service answers.
  for (var i = 0; i < 20; i++) {
    await tester.pump(const Duration(milliseconds: 100));
  }
}

/// Android 14+ style: body text doubles, very large sizes grow much less.
class _NonLinearScaler extends TextScaler {
  const _NonLinearScaler();
  @override
  double scale(double fontSize) => fontSize <= 20 ? fontSize * 2 : fontSize + 20;
  @override
  double get textScaleFactor => 2;
  @override
  bool operator ==(Object other) => other is _NonLinearScaler;
  @override
  int get hashCode => 1;
}

void main() {
  testWidgets('product cards grow with non-linear (Android 14+) 200 % text instead of clipping names', (tester) async {
    await (FontLoader('Inter')..addFont(rootBundle.load('assets/fonts/Inter-Variable.ttf'))).load();
    tester.view.physicalSize = const Size(411, 900);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.reset);
    final product = ProductSummary((b) => b
      ..id = 'P1'
      ..name = 'Elektrikli Çay Makinesi 101105'
      ..category = 'Çay makineleri'
      ..description = ''
      ..personalizable = true
      ..colorCount = 4
      ..priceFrom = (MoneyBuilder()
        ..amountMinor = 250000
        ..currency = 'TRY')
      ..inStock = true);
    await tester.pumpWidget(ProviderScope(
      child: MaterialApp(
        theme: buildTheme(),
        builder: (context, child) => MediaQuery(data: MediaQuery.of(context).copyWith(textScaler: const _NonLinearScaler()), child: child!),
        home: Scaffold(body: CustomScrollView(slivers: [SliverPadding(padding: const EdgeInsets.all(16), sliver: productGrid([product, product], showFavorite: false))])),
      ),
    ));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);
    // A squeezed Flexible clips the name silently; its box must hold the name's own (up to two-line) height.
    final name = tester.renderObject<RenderParagraph>(find.text('Elektrikli Çay Makinesi 101105').first);
    expect(name.size.height, greaterThanOrEqualTo(name.getMinIntrinsicHeight(name.size.width) - 0.5));
  });

  setUpAll(() async {
    await (FontLoader('Inter')..addFont(rootBundle.load('assets/fonts/Inter-Variable.ttf'))).load();
    await (FontLoader('MaterialIcons')..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'))).load();
  });
  for (final (routes, signedIn) in [(signedInRoutes, true), (signedOutRoutes, false)]) {
    for (final route in routes) {
      for (final size in sizes) {
        for (final scale in [1.0, 2.0]) {
          testWidgets('${signedIn ? 'signed in' : 'signed out'} $route at ${size.width.toInt()} px, ${scale}x text', (tester) async {
            await _pump(tester, route, size, scale, signedIn: signedIn);
            expect(tester.takeException(), isNull);
            await tester.pumpWidget(const SizedBox());
            await tester.pump(const Duration(seconds: 31));
          });
        }
      }
    }
  }
}
