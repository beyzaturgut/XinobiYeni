//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'confirm_password_reset.g.dart';

/// ConfirmPasswordReset
///
/// Properties:
/// * [email]
/// * [verificationId]
/// * [verificationCode]
/// * [newPassword]
@BuiltValue()
abstract class ConfirmPasswordReset implements Built<ConfirmPasswordReset, ConfirmPasswordResetBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'verificationId')
  String get verificationId;

  @BuiltValueField(wireName: r'verificationCode')
  String get verificationCode;

  @BuiltValueField(wireName: r'newPassword')
  String get newPassword;

  ConfirmPasswordReset._();

  factory ConfirmPasswordReset([void updates(ConfirmPasswordResetBuilder b)]) = _$ConfirmPasswordReset;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ConfirmPasswordResetBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ConfirmPasswordReset> get serializer => _$ConfirmPasswordResetSerializer();
}

class _$ConfirmPasswordResetSerializer implements PrimitiveSerializer<ConfirmPasswordReset> {
  @override
  final Iterable<Type> types = const [ConfirmPasswordReset, _$ConfirmPasswordReset];

  @override
  final String wireName = r'ConfirmPasswordReset';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ConfirmPasswordReset object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'verificationId';
    yield serializers.serialize(
      object.verificationId,
      specifiedType: const FullType(String),
    );
    yield r'verificationCode';
    yield serializers.serialize(
      object.verificationCode,
      specifiedType: const FullType(String),
    );
    yield r'newPassword';
    yield serializers.serialize(
      object.newPassword,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ConfirmPasswordReset object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ConfirmPasswordResetBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'verificationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.verificationId = valueDes;
          break;
        case r'verificationCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.verificationCode = valueDes;
          break;
        case r'newPassword':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.newPassword = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ConfirmPasswordReset deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ConfirmPasswordResetBuilder();
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
