import 'package:test/test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

void main() {
  test('single source publication preserves arbitrary canvas, revisions and independent hashes', () {
    final sourceHash = List.filled(64, 'a').join();
    final maskHash = List.filled(64, 'b').join();
    final surfaceId = 'source-7-mask-${List.filled(32, 'c').join()}';
    final json = <String, Object?>{
      'schemaVersion': 1, 'scope': 'single-source-preview', 'productReference': 'product',
      'surfaceId': surfaceId, 'sourceRevision': 7,
      'inputs': <String, Object?>{
        'width': 5001, 'height': 4000, 'sourceMediaVersion': sourceHash, 'surfaceVersion': maskHash,
        'source': {'url': '/api/v1/product-surfaces/product/$surfaceId/source?v=$sourceHash', 'sha256': sourceHash},
        'mask': {'url': '/api/v1/product-surfaces/product/$surfaceId/mask?v=$maskHash', 'sha256': maskHash},
        'brandingRequired': false, 'branding': null,
      },
    };
    final value = standardSerializers.deserializeWith(SingleSourcePublication.serializer, json)!;
    expect(value.sourceRevision, 7);
    expect(value.inputs.width, 5001);
    expect(value.inputs.height, 4000);
    expect(value.inputs.source_.sha256, sourceHash);
    expect(value.inputs.mask.sha256, maskHash);
    expect(value.inputs.brandingRequired, false);
    expect(value.inputs.branding, isNull);
    final encoded = standardSerializers.serializeWith(SingleSourcePublication.serializer, value);
    expect(standardSerializers.deserializeWith(SingleSourcePublication.serializer, encoded), value);
  });
}
