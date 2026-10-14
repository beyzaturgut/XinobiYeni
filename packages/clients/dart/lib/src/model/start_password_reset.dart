//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'start_password_reset.g.dart';

/// StartPasswordReset
///
/// Properties:
/// * [email]
@BuiltValue()
abstract class StartPasswordReset implements Built<StartPasswordReset, StartPasswordResetBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  StartPasswordReset._();

  factory StartPasswordReset([void updates(StartPasswordResetBuilder b)]) = _$StartPasswordReset;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StartPasswordResetBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StartPasswordReset> get serializer => _$StartPasswordResetSerializer();
}

class _$StartPasswordResetSerializer implements PrimitiveSerializer<StartPasswordReset> {
  @override
  final Iterable<Type> types = const [StartPasswordReset, _$StartPasswordReset];

  @override
  final String wireName = r'StartPasswordReset';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StartPasswordReset object, {
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
    StartPasswordReset object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StartPasswordResetBuilder result,
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
  StartPasswordReset deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StartPasswordResetBuilder();
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
