import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/catalog/product_gallery.dart';

import 'app_test.dart' show FakeCatalog, pumpApp;

VariantDetail _colour(String id, String color, String image) => VariantDetail((b) => b
  ..id = id
  ..sku = id
  ..color = color
  ..imageUrl = image
  ..availability.status = 'in_stock'
  ..purchasable = false
  ..maxQuantity = 0);

ProductDetail _product({String? original, List<String> extras = const []}) => ProductDetail((b) => b
  ..id = 'P1'
  ..name = 'Çay Makinesi 101'
  ..category = 'Çay makineleri'
  ..description = ''
  ..seoTitle = ''
  ..personalizable = false
  ..originalImageUrl = original
  ..gallery.addAll(extras)
  ..variants.addAll([_colour('V1', 'Lacivert', 'https://cdn.test/blue.webp'), _colour('V2', 'Kırmızı', 'https://cdn.test/red.webp')]));

class GalleryCatalog extends FakeCatalog {
  @override
  Future<ProductDetail> product(String id) async =>
      _product(original: 'https://cdn.test/cover.webp', extras: ['https://cdn.test/side.webp', 'https://cdn.test/top.webp']);
}

void main() {
  test('gallery order is product photo, selected colour, then extras without duplicates', () {
    final product = _product(original: 'https://cdn.test/cover.webp', extras: ['https://cdn.test/side.webp', 'https://cdn.test/red.webp']);
    expect(productGallery(product, product.variants[1]).map((image) => image.label),
        ['Ürün görseli', 'Kırmızı rengi', 'Ek görsel 1']);
    expect(productGallery(_product(), _product().variants.first).map((image) => image.url), ['https://cdn.test/blue.webp']);
  });

  testWidgets('choosing a colour shows its photo on the stage only; the strip keeps the product photos', (tester) async {
    await pumpApp(tester, location: '/urunler/P1', catalog: GalleryCatalog());
    Finder thumb(String label) => find.bySemanticsLabel(label);
    expect(tester.getSemantics(thumb('Ürün görseli göster')), isSemantics(isButton: true, isSelected: true, hasTapAction: true));
    expect(thumb('Ek görsel 1 göster'), findsOneWidget);
    expect(find.bySemanticsLabel(RegExp('rengi göster')), findsNothing, reason: 'Colour photos are not in the strip.');
    expect(find.text('1 / 4'), findsOneWidget);

    await tester.tap(find.bySemanticsLabel('Kırmızı rengini seç'));
    await tester.pumpAndSettle();
    expect(find.text('2 / 4'), findsOneWidget);
    expect(find.bySemanticsLabel(RegExp('rengi göster')), findsNothing);
    expect(tester.getSemantics(thumb('Ürün görseli göster')), isSemantics(isButton: true, isSelected: false, hasTapAction: true));

    await tester.tap(thumb('Ürün görseli göster'));
    await tester.pumpAndSettle();
    expect(find.text('1 / 4'), findsOneWidget);
    expect(find.text('Renk: Kırmızı'), findsOneWidget, reason: 'Looking at another photo keeps the chosen colour.');

    await tester.drag(find.descendant(of: find.byType(ProductGallery), matching: find.byType(PageView)), const Offset(-300, 0));
    await tester.pumpAndSettle();
    expect(find.text('2 / 4'), findsOneWidget);
  });
}
