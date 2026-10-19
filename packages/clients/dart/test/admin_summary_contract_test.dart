import 'package:test/test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

void main() {
  test('SQL summary round-trips counts and UTC range without financial fields', () {
    final value = AdminSummary((b) => b
      ..untilExclusive = DateTime.utc(2026, 10, 20)
      ..generatedAt = DateTime.utc(2026, 10, 19)
      ..timeZone = 'UTC'
      ..orderCount = 2
      ..registeredCustomerCount = 0
      ..orderStatuses.add(OrderStatusCount((s) => s
        ..status = 'received'
        ..count = 2)));
    final json = standardSerializers.serializeWith(AdminSummary.serializer, value);
    final restored = standardSerializers.deserializeWith(AdminSummary.serializer, json);
    expect(restored, value);
    expect(restored?.fromInclusive, isNull);
    expect(restored?.registeredCustomerCount, 0);
    expect(restored?.orderStatuses.single.count, 2);
    expect((json as Map).containsKey('revenue'), isFalse);
  });
}
