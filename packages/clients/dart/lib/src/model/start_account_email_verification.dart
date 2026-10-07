//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'start_account_email_verification.g.dart';

/// StartAccountEmailVerification
///
/// Properties:
/// * [email]
@BuiltValue()
abstract class StartAccountEmailVerification implements Built<StartAccountEmailVerification, StartAccountEmailVerificationBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  StartAccountEmailVerification._();

  factory StartAccountEmailVerification([void updates(StartAccountEmailVerificationBuilder b)]) = _$StartAccountEmailVerification;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StartAccountEmailVerificationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StartAccountEmailVerification> get serializer => _$StartAccountEmailVerificationSerializer();
}

class _$StartAccountEmailVerificationSerializer implements PrimitiveSerializer<StartAccountEmailVerification> {
  @override
  final Iterable<Type> types = const [StartAccountEmailVerification, _$StartAccountEmailVerification];

  @override
  final String wireName = r'StartAccountEmailVerification';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StartAccountEmailVerification object, {
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
    StartAccountEmailVerification object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StartAccountEmailVerificationBuilder result,
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
  StartAccountEmailVerification deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StartAccountEmailVerificationBuilder();
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
