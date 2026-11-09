import 'package:test/test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

void main() {
  test('source binding and pattern hash survive configuration round trip independently', () {
    final binding = <String, Object?>{
      'productId': 'P1', 'profileRevision': 8, 'sourceRevision': 3,
      'surfaceId': 'source-3-mask-${'c' * 32}', 'productSourceSha256': 'a' * 64,
      'maskSha256': 'b' * 64, 'width': 7001, 'height': 7,
      'fulfillmentVariantId': 'explicit-sale-sku',
    };
    final config = standardSerializers.deserializeWith(MyDesignConfiguration.serializer, {
      'id': 'd' * 32, 'designId': 'pattern', 'productId': 'P1',
      'variantId': 'explicit-sale-sku', 'revision': 2, 'schemaVersion': 2,
      'placement': {'sourceWidth': 7001, 'sourceHeight': 7, 'surfaceVersion': 'b' * 64,
        'x': 3500, 'y': 3, 'scale': 1, 'rotation': 0, 'curvatureStrength': 0.4},
      'favorite': true, 'sourceSha256': 'e' * 64,
      'createdAt': '2026-11-09T10:00:00Z', 'surfaceBinding': binding,
    })!;
    expect(config.surfaceBinding!.width, 7001);
    expect(config.surfaceBinding!.fulfillmentVariantId, config.variantId);
    expect(config.sourceSha256, isNot(config.surfaceBinding!.productSourceSha256));
    final encoded = standardSerializers.serializeWith(MyDesignConfiguration.serializer, config);
    expect(standardSerializers.deserializeWith(MyDesignConfiguration.serializer, encoded), config);
  });

  test('AI product source session has no inferred colour variant', () {
    final session = standardSerializers.deserializeWith(XinobiUSession.serializer, {
      'id': 's' * 64, 'status': 'questionnaire', 'expiresAt': '2026-11-10T10:00:00Z',
      'product': {'id': 'P1', 'name': 'Product', 'category': 'Test'},
      'variant': null, 'questionBankVersion': 'test', 'questions': [], 'answers': [],
    })!;
    expect(session.variant, isNull);
    expect(session.product.id, 'P1');
  });
}
