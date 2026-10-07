//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'account_email_verification.g.dart';

/// AccountEmailVerification
///
/// Properties:
/// * [verificationId]
/// * [email]
/// * [expiresAt]
/// * [previewCode]
@BuiltValue()
abstract class AccountEmailVerification implements Built<AccountEmailVerification, AccountEmailVerificationBuilder> {
  @BuiltValueField(wireName: r'verificationId')
  String get verificationId;

  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  @BuiltValueField(wireName: r'previewCode')
  String? get previewCode;

  AccountEmailVerification._();

  factory AccountEmailVerification([void updates(AccountEmailVerificationBuilder b)]) = _$AccountEmailVerification;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AccountEmailVerificationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AccountEmailVerification> get serializer => _$AccountEmailVerificationSerializer();
}

class _$AccountEmailVerificationSerializer implements PrimitiveSerializer<AccountEmailVerification> {
  @override
  final Iterable<Type> types = const [AccountEmailVerification, _$AccountEmailVerification];

  @override
  final String wireName = r'AccountEmailVerification';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AccountEmailVerification object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'verificationId';
    yield serializers.serialize(
      object.verificationId,
      specifiedType: const FullType(String),
    );
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'expiresAt';
    yield serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'previewCode';
    yield object.previewCode == null ? null : serializers.serialize(
      object.previewCode,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AccountEmailVerification object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AccountEmailVerificationBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'verificationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.verificationId = valueDes;
          break;
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiresAt = valueDes;
          break;
        case r'previewCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.previewCode = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AccountEmailVerification deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AccountEmailVerificationBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}
