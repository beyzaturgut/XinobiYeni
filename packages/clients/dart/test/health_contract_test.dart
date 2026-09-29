import 'package:test/test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

void main() {
  test('HealthResponse serializes and deserializes all required fields', () {
    final timestamp = DateTime.utc(2026, 9, 29, 12);
    final response = HealthResponse(
      (builder) => builder
        ..service = 'Xinobi.Api'
        ..status = 'healthy'
        ..timestampUtc = timestamp
        ..requestId = 'dart-contract-001',
    );

    final serialized = standardSerializers.serializeWith(
      HealthResponse.serializer,
      response,
    );
    final restored = standardSerializers.deserializeWith(
      HealthResponse.serializer,
      serialized,
    );

    expect(restored, response);
    expect(restored?.timestampUtc, timestamp);
  });
}
