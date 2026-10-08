//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'start_email_change.g.dart';

/// StartEmailChange
///
/// Properties:
/// * [newEmail]
@BuiltValue()
abstract class StartEmailChange implements Built<StartEmailChange, StartEmailChangeBuilder> {
  @BuiltValueField(wireName: r'newEmail')
  String get newEmail;

  StartEmailChange._();

  factory StartEmailChange([void updates(StartEmailChangeBuilder b)]) = _$StartEmailChange;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StartEmailChangeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StartEmailChange> get serializer => _$StartEmailChangeSerializer();
}

class _$StartEmailChangeSerializer implements PrimitiveSerializer<StartEmailChange> {
  @override
  final Iterable<Type> types = const [StartEmailChange, _$StartEmailChange];

  @override
  final String wireName = r'StartEmailChange';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StartEmailChange object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'newEmail';
    yield serializers.serialize(
      object.newEmail,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    StartEmailChange object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StartEmailChangeBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'newEmail':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.newEmail = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  StartEmailChange deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StartEmailChangeBuilder();
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
