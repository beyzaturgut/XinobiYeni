import 'package:test/test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

void main() {
  test('ProductDetail reads API JSON with an unpriced, low-stock variant', () {
    // Shape returned by GET /api/v1/catalog/products/{id}.
    final json = <String, Object?>{
      'id': 'DEMO-P102',
      'name': 'Kahve Makinesi 101',
      'category': 'Kahve makineleri',
      'description': 'Örnek ürün açıklaması',
      'seoTitle': 'Kahve Makinesi 101 | Xinobi',
      'imageUrl': 'http://10.0.2.2:3000/assets/products/coffee-101.webp',
      'personalizable': true,
      'variants': [
        {
          'id': 'DEMO-V102-R',
          'sku': 'DEMO-COFFEE-RED',
          'color': 'Kırmızı',
          'hex': null,
          'imageUrl': null,
          'price': {'amountMinor': 280000, 'currency': 'TRY'},
          'availability': {'status': 'low_stock', 'remaining': 4},
          'purchasable': true,
        },
        {
          'id': 'DEMO-V102-G',
          'sku': 'DEMO-COFFEE-GOLD',
          'color': 'Gold',
          'hex': '#C9A227',
          'imageUrl': 'http://10.0.2.2:5003/api/v1/local-commerce/media/a.png',
          'price': null,
          'availability': {'status': 'out_of_stock', 'remaining': 0},
          'purchasable': false,
        },
      ],
    };

    final product = standardSerializers.deserializeWith(ProductDetail.serializer, json)!;

    expect(product.personalizable, isTrue);
    expect(product.variants, hasLength(2));
    final red = product.variants.first;
    expect(red.price?.amountMinor, 280000);
    expect(red.price?.currency, 'TRY');
    expect(red.availability.status, 'low_stock');
    expect(red.availability.remaining, 4);
    final gold = product.variants.last;
    expect(gold.price, isNull);
    expect(gold.purchasable, isFalse);
    expect(standardSerializers.serializeWith(ProductDetail.serializer, product), json);
  });

  test('ProductPage keeps paging fields and nullable minimum price', () {
    final json = <String, Object?>{
      'items': [
        {
          'id': 'DEMO-P105',
          'name': 'Pişirme 101',
          'category': 'Pişirme teknolojileri',
          'description': '',
          'imageUrl': null,
          'personalizable': false,
          'colorCount': 1,
          'priceFrom': null,
          'inStock': false,
        },
      ],
      'page': 2,
      'pageSize': 1,
      'total': 5,
    };

    final page = standardSerializers.deserializeWith(ProductPage.serializer, json)!;

    expect(page.total, 5);
    expect(page.items.single.priceFrom, isNull);
    expect(page.items.single.inStock, isFalse);
  });
}
