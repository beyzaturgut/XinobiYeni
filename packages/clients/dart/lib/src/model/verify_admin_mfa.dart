//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'verify_admin_mfa.g.dart';

/// VerifyAdminMfa
///
/// Properties:
/// * [challengeId]
/// * [code]
@BuiltValue()
abstract class VerifyAdminMfa implements Built<VerifyAdminMfa, VerifyAdminMfaBuilder> {
  @BuiltValueField(wireName: r'challengeId')
  String get challengeId;

  @BuiltValueField(wireName: r'code')
  String get code;

  VerifyAdminMfa._();

  factory VerifyAdminMfa([void updates(VerifyAdminMfaBuilder b)]) = _$VerifyAdminMfa;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VerifyAdminMfaBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VerifyAdminMfa> get serializer => _$VerifyAdminMfaSerializer();
}

class _$VerifyAdminMfaSerializer implements PrimitiveSerializer<VerifyAdminMfa> {
  @override
  final Iterable<Type> types = const [VerifyAdminMfa, _$VerifyAdminMfa];

  @override
  final String wireName = r'VerifyAdminMfa';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VerifyAdminMfa object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'challengeId';
    yield serializers.serialize(
      object.challengeId,
      specifiedType: const FullType(String),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    VerifyAdminMfa object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VerifyAdminMfaBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'challengeId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.challengeId = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VerifyAdminMfa deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VerifyAdminMfaBuilder();
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
