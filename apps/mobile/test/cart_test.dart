import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart' hide DesignPlacement;
import 'package:xinobi_mobile/features/cart/cart.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/main.dart';
import 'package:xinobi_mobile/features/personalization/surface_preview.dart';

import 'app_test.dart' show FakeCatalog;

/// Catalog where P1/V1 is priced with stock 3, P1/V2 has no price, and P9 is no longer published.
class CartCatalog extends FakeCatalog {
  @override
  Future<ProductDetail> product(String id) async {
    if (id == 'P9') throw const CatalogException(CatalogException.notFoundMessage);
    return ProductDetail((b) => b
      ..id = 'P1'
      ..name = 'Çay Makinesi 101'
      ..category = 'Çay makineleri'
      ..description = ''
      ..seoTitle = ''
      ..personalizable = true
      ..variants.addAll([
        VariantDetail((v) => v
          ..id = 'V1'
          ..sku = 'V1'
          ..color = 'Lacivert'
          ..price.amountMinor = 240000
          ..price.currency = 'TRY'
          ..availability.status = 'low_stock'
          ..availability.remaining = 3
          ..purchasable = true
          ..maxQuantity = 3),
        VariantDetail((v) => v
          ..id = 'V2'
          ..sku = 'V2'
          ..color = 'Kırmızı'
          ..availability.status = 'in_stock'
          ..purchasable = false
          ..maxQuantity = 9),
      ]));
  }
}

Future<void> pumpApp(WidgetTester tester, String location) async {
  tester.view.physicalSize = const Size(1170, 2532);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(ProviderScope(
    retry: noAutomaticRetry,
    overrides: [catalogRepositoryProvider.overrideWithValue(CartCatalog())],
    child: XinobiApp(initialLocation: location),
  ));
  await tester.pumpAndSettle();
}

void main() {
  designLineTests();
  setUp(() => SharedPreferences.setMockInitialValues({}));

  test('photo placement survives cart persistence and quantity changes', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);
    final cart = container.read(cartProvider.notifier);
    await Future<void>.delayed(Duration.zero);
    const placement = DesignPlacement.place(scale: 0.72, rotation: 0.4, offset: Offset(0.12, -0.18));
    await cart.add('P1', 'V1', 5, designId: 'photo', designName: 'Fotoğraf', designPlacement: placement);
    await cart.setQuantity('P1', 'V1', 2, designId: 'photo');
    final stored = (await SharedPreferences.getInstance()).getString(cartStorageKey);
    final restored = parseCart(stored).single;
    expect(restored.quantity, 2);
    expect(restored.designPlacement!.toJson(), placement.toJson());
    const changed = DesignPlacement.place(scale: 0.5, rotation: -0.2);
    await cart.add('P1', 'V1', 5, designId: 'photo', designName: 'Fotoğraf', designPlacement: changed);
    expect(container.read(cartProvider).single.designPlacement!.toJson(), changed.toJson());
  });

  test('stored cart uses the web format and drops invalid rows', () {
    final lines = parseCart(jsonEncode([
      {'productId': 'P1', 'variantId': 'V1', 'quantity': 2},
      {'productId': 'P1', 'variantId': 'V2', 'quantity': 0},
      {'productId': 'P1', 'variantId': 'V3', 'quantity': 100},
      {'productId': 1, 'variantId': 'V4', 'quantity': 1},
    ]));
    expect(lines.map((line) => line.toJson()), [
      {'productId': 'P1', 'variantId': 'V1', 'quantity': 2},
    ]);
    expect(parseCart('not json'), isEmpty);
  });

  test('adding stops at the variant limit and persists', () async {
    final container = ProviderContainer();
    addTearDown(container.dispose);
    final cart = container.read(cartProvider.notifier);
    await Future<void>.delayed(Duration.zero);
    await cart.add('P1', 'V1', 2);
    await cart.add('P1', 'V1', 2);
    expect(() => cart.add('P1', 'V1', 2), throwsA(isA<CartException>()));
    expect(container.read(cartCountProvider), 2);
    final stored = (await SharedPreferences.getInstance()).getString(cartStorageKey);
    expect(parseCart(stored).single.quantity, 2);
  });

  testWidgets('product detail adds the selected colour and the tab badge counts it', (tester) async {
    await pumpApp(tester, '/urunler/P1');
    await tester.tap(find.text('Sepete ekle'));
    await tester.pumpAndSettle();
    expect(find.textContaining('sepete eklendi'), findsOneWidget);
    ScaffoldMessenger.of(tester.element(find.text('Sepete ekle'))).hideCurrentSnackBar();
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.bySemanticsLabel('Kırmızı rengini seç'));
    await tester.pumpAndSettle();
    await tester.tap(find.bySemanticsLabel('Kırmızı rengini seç'));
    await tester.pumpAndSettle();
    expect(tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Şu anda satın alınamaz')).onPressed, isNull);
  });

  testWidgets('cart totals valid lines, caps quantity at stock and flags unavailable lines', (tester) async {
    SharedPreferences.setMockInitialValues({
      cartStorageKey: jsonEncode([
        {'productId': 'P1', 'variantId': 'V1', 'quantity': 2},
        {'productId': 'P1', 'variantId': 'V2', 'quantity': 1},
        {'productId': 'P9', 'variantId': 'X', 'quantity': 1},
      ]),
    });
    await pumpApp(tester, '/sepet');
    final list = find.byType(Scrollable).first;
    expect(find.text('Sepetim'), findsOneWidget);
    expect(find.text('Bu renk için fiyat tanımlanmadı; şu anda satın alınamaz.'), findsOneWidget);
    expect(find.text('Bu ürün artık yayında değil. Sepetten çıkar.'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Ara toplam'), 300, scrollable: list);
    expect(find.text('₺4.800,00'), findsOneWidget, reason: 'Only the priced, in-stock line counts.');
    expect(find.text('2 satır şu anda satın alınamıyor ve toplama dahil değil.'), findsOneWidget);
    final increase = find.byTooltip('Çay Makinesi 101 Lacivert adedini artır');
    await tester.scrollUntilVisible(increase, -300, scrollable: list);
    await tester.tap(increase);
    await tester.pumpAndSettle();
    expect(tester.widget<IconButton>(find.ancestor(of: increase, matching: find.byType(IconButton))).onPressed, isNull, reason: 'Stock is 3.');
    await tester.scrollUntilVisible(find.text('Ara toplam'), 300, scrollable: list);
    expect(find.text('₺7.200,00'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Sepetim'), -300, scrollable: list);
    for (var i = 0; i < 3; i++) {
      await tester.tap(find.text('Kaldır').first);
      await tester.pumpAndSettle();
    }
    expect(find.text('Sepetin boş.'), findsOneWidget);
  });
}

void designLineTests() {
  test('a design makes its own line and the colour shares one stock limit', () async {
    SharedPreferences.setMockInitialValues({});
    final container = ProviderContainer();
    addTearDown(container.dispose);
    final cart = container.read(cartProvider.notifier);
    await cart.add('P1', 'V1', 3);
    await cart.add('P1', 'V1', 3, designId: 'd1', designName: 'Mavi dalgalar');
    await cart.add('P1', 'V1', 3, designId: 'd1', designName: 'Mavi dalgalar');
    expect(container.read(cartProvider).length, 2);
    expect(variantUnits(container.read(cartProvider), 'V1'), 3);
    await expectLater(cart.add('P1', 'V1', 3, designId: 'd2', designName: 'Başka'), throwsA(isA<CartException>()));
    // The device copy keeps the design and is read back the same way as the web cart.
    final stored = parseCart(jsonEncode(container.read(cartProvider).map((line) => line.toJson()).toList()));
    expect(stored.map((line) => (line.designId, line.designName, line.quantity)), [(null, null, 1), ('d1', 'Mavi dalgalar', 2)]);
    await cart.setQuantity('P1', 'V1', 0, designId: 'd1');
    expect(container.read(cartProvider).single.designId, isNull);
    // A tampered row with a design id but no name is dropped.
    expect(parseCart('[{"productId":"P1","variantId":"V1","quantity":1,"designId":"d1"}]'), isEmpty);
  });
}
