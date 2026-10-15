//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'complete_admin_password_reset.g.dart';

/// CompleteAdminPasswordReset
///
/// Properties:
/// * [token]
/// * [newPassword]
@BuiltValue()
abstract class CompleteAdminPasswordReset implements Built<CompleteAdminPasswordReset, CompleteAdminPasswordResetBuilder> {
  @BuiltValueField(wireName: r'token')
  String get token;

  @BuiltValueField(wireName: r'newPassword')
  String get newPassword;

  CompleteAdminPasswordReset._();

  factory CompleteAdminPasswordReset([void updates(CompleteAdminPasswordResetBuilder b)]) = _$CompleteAdminPasswordReset;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CompleteAdminPasswordResetBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CompleteAdminPasswordReset> get serializer => _$CompleteAdminPasswordResetSerializer();
}

class _$CompleteAdminPasswordResetSerializer implements PrimitiveSerializer<CompleteAdminPasswordReset> {
  @override
  final Iterable<Type> types = const [CompleteAdminPasswordReset, _$CompleteAdminPasswordReset];

  @override
  final String wireName = r'CompleteAdminPasswordReset';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CompleteAdminPasswordReset object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'token';
    yield serializers.serialize(
      object.token,
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
    CompleteAdminPasswordReset object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CompleteAdminPasswordResetBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'token':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.token = valueDes;
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
  CompleteAdminPasswordReset deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CompleteAdminPasswordResetBuilder();
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
