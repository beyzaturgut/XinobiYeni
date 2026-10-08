//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'change_my_password.g.dart';

/// ChangeMyPassword
///
/// Properties:
/// * [currentPassword]
/// * [newPassword]
@BuiltValue()
abstract class ChangeMyPassword implements Built<ChangeMyPassword, ChangeMyPasswordBuilder> {
  @BuiltValueField(wireName: r'currentPassword')
  String get currentPassword;

  @BuiltValueField(wireName: r'newPassword')
  String get newPassword;

  ChangeMyPassword._();

  factory ChangeMyPassword([void updates(ChangeMyPasswordBuilder b)]) = _$ChangeMyPassword;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ChangeMyPasswordBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ChangeMyPassword> get serializer => _$ChangeMyPasswordSerializer();
}

class _$ChangeMyPasswordSerializer implements PrimitiveSerializer<ChangeMyPassword> {
  @override
  final Iterable<Type> types = const [ChangeMyPassword, _$ChangeMyPassword];

  @override
  final String wireName = r'ChangeMyPassword';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ChangeMyPassword object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'currentPassword';
    yield serializers.serialize(
      object.currentPassword,
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
    ChangeMyPassword object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ChangeMyPasswordBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'currentPassword':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.currentPassword = valueDes;
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
  ChangeMyPassword deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ChangeMyPasswordBuilder();
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
