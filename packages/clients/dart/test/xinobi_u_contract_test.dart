import 'package:test/test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

void main() {
  test('XinobiUSession reads a ready session from API JSON', () {
    // Shape returned by GET /api/v1/xinobi-u/sessions/{id}.
    final json = <String, Object?>{
      'id': 'a' * 64,
      'status': 'ready',
      'expiresAt': '2026-10-08T09:00:00.000Z',
      'product': {'id': 'DEMO-P101', 'name': 'Çay Makinesi 101', 'category': 'Çay makineleri'},
      'variant': {'id': 'DEMO-V101-B', 'color': 'Lacivert', 'hex': null, 'imageUrl': 'http://10.0.2.2:3000/assets/products/tea-maker-101-blue.webp'},
      'questionBankVersion': 'xinobi-u-1',
      'questions': [
        {
          'id': 'q-nature-001',
          'axis': 'nature',
          'axisLabel': 'Doğa',
          'text': 'Hangi manzara sana daha yakın?',
          'options': [
            {'id': 'forest', 'label': 'Orman'},
            {'id': 'sea', 'label': 'Deniz'},
          ],
        },
      ],
      'answers': [
        {'questionId': 'q-nature-001', 'optionId': 'sea'},
      ],
      'imageUrl': 'http://10.0.2.2:5003/api/v1/xinobi-u/sessions/${'a' * 64}/image',
      'errorCode': null,
      'errorMessage': null,
    };

    final session = standardSerializers.deserializeWith(XinobiUSession.serializer, json)!;

    expect(session.status, 'ready');
    expect(session.expiresAt, DateTime.utc(2026, 10, 8, 9));
    expect(session.questions.single.options, hasLength(2));
    expect(session.answers.single.optionId, 'sea');
    expect(session.imageUrl, endsWith('/image'));
    expect(session.errorCode, isNull);
  });
}
