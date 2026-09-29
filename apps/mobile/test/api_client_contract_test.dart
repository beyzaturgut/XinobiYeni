import 'package:flutter_test/flutter_test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

void main() {
  test('generated health response preserves the API contract', () {
    final timestamp = DateTime.utc(2026, 9, 29, 12);
    final response = HealthResponse(
      (builder) => builder
        ..service = 'Xinobi.Api'
        ..status = 'healthy'
        ..timestampUtc = timestamp
        ..requestId = 'mobile-contract-001',
    );

    expect(response.service, 'Xinobi.Api');
    expect(response.status, 'healthy');
    expect(response.timestampUtc, timestamp);
    expect(response.requestId, 'mobile-contract-001');
  });
}
