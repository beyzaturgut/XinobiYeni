//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'start_admin_password_reset.g.dart';

/// StartAdminPasswordReset
///
/// Properties:
/// * [email]
@BuiltValue()
abstract class StartAdminPasswordReset implements Built<StartAdminPasswordReset, StartAdminPasswordResetBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  StartAdminPasswordReset._();

  factory StartAdminPasswordReset([void updates(StartAdminPasswordResetBuilder b)]) = _$StartAdminPasswordReset;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StartAdminPasswordResetBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StartAdminPasswordReset> get serializer => _$StartAdminPasswordResetSerializer();
}

class _$StartAdminPasswordResetSerializer implements PrimitiveSerializer<StartAdminPasswordReset> {
  @override
  final Iterable<Type> types = const [StartAdminPasswordReset, _$StartAdminPasswordReset];

  @override
  final String wireName = r'StartAdminPasswordReset';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StartAdminPasswordReset object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    StartAdminPasswordReset object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StartAdminPasswordResetBuilder result,
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
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  StartAdminPasswordReset deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StartAdminPasswordResetBuilder();
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
