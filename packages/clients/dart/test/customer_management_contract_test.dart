import 'package:test/test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

void main() {
  test('customer mutations carry independent optimistic versions and deleted status', () {
    final access = ChangeCustomerAccess((b) => b
      ..status = 'disabled'
      ..expectedVersion = 'row-version-1');
    final deletion = DeleteManagedCustomer((b) => b
      ..expectedVersion = 'row-version-2');
    final a = standardSerializers.serializeWith(ChangeCustomerAccess.serializer, access) as Map;
    final d = standardSerializers.serializeWith(DeleteManagedCustomer.serializer, deletion) as Map;
    expect(a['status'], 'disabled');
    expect(a['expectedVersion'], 'row-version-1');
    expect(d['expectedVersion'], 'row-version-2');
    expect(d.containsKey('status'), isFalse);
    final row = standardSerializers.deserializeWith(AdminCustomerRow.serializer, {
      'id': '11111111-1111-1111-1111-111111111111',
      'name': 'S***', 'email': 's***@***', 'status': 'deleted',
      'createdAt': '2026-11-10T10:00:00Z', 'orderCount': 2,
      'version': 'row-version-3',
    });
    expect(row?.status, 'deleted');
    expect(row?.version, 'row-version-3');
    expect(row?.orderCount, 2);
  });
}
