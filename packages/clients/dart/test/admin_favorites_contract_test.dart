import 'package:test/test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

void main() {
  test('Favorite request round-trips the product ID', () {
    final json = <String, Object?>{'productId': 'test-product'};
    final model = standardSerializers.deserializeWith(AddFavorite.serializer, json)!;
    expect(model.productId, 'test-product');
    expect(standardSerializers.serializeWith(AddFavorite.serializer, model), json);
  });

  test('MFA challenge accepts a nullable Preview code', () {
    final model = standardSerializers.deserializeWith(AdminMfaChallenge.serializer, {
      'challengeId': 'test-challenge',
      'expiresAt': '2026-10-14T12:00:00Z',
      'previewCode': null,
    })!;
    expect(model.previewCode, isNull);
    expect(model.expiresAt, DateTime.utc(2026, 10, 14, 12));
    final json = standardSerializers.serializeWith(AdminMfaChallenge.serializer, model) as Map;
    expect(json['challengeId'], 'test-challenge');
    expect(json['previewCode'], isNull);
  });

  test('Admin reset response does not require a Preview link', () {
    final model = standardSerializers.deserializeWith(AdminPasswordResetStarted.serializer,
        {'message': 'Generic response', 'previewUrl': null})!;
    expect(model.previewUrl, isNull);
    expect(model.message, 'Generic response');
  });

  test('Main code-based password recovery contract is retained', () {
    final json = <String, Object?>{
      'email': 'test@example.invalid',
      'verificationId': 'test-verification',
      'verificationCode': '000000',
      'newPassword': 'synthetic-test-password',
    };
    final model = standardSerializers.deserializeWith(ConfirmPasswordReset.serializer, json)!;
    expect(standardSerializers.serializeWith(ConfirmPasswordReset.serializer, model), json);
    expect(standardSerializers.deserializeWith(StartPasswordReset.serializer,
        {'email': 'test@example.invalid'})!.email, 'test@example.invalid');
  });
}
