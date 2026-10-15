//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'admin_mfa_challenge.g.dart';

/// AdminMfaChallenge
///
/// Properties:
/// * [challengeId]
/// * [expiresAt]
/// * [previewCode]
@BuiltValue()
abstract class AdminMfaChallenge implements Built<AdminMfaChallenge, AdminMfaChallengeBuilder> {
  @BuiltValueField(wireName: r'challengeId')
  String get challengeId;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  @BuiltValueField(wireName: r'previewCode')
  String? get previewCode;

  AdminMfaChallenge._();

  factory AdminMfaChallenge([void updates(AdminMfaChallengeBuilder b)]) = _$AdminMfaChallenge;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdminMfaChallengeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdminMfaChallenge> get serializer => _$AdminMfaChallengeSerializer();
}

class _$AdminMfaChallengeSerializer implements PrimitiveSerializer<AdminMfaChallenge> {
  @override
  final Iterable<Type> types = const [AdminMfaChallenge, _$AdminMfaChallenge];

  @override
  final String wireName = r'AdminMfaChallenge';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdminMfaChallenge object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'challengeId';
    yield serializers.serialize(
      object.challengeId,
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
    AdminMfaChallenge object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdminMfaChallengeBuilder result,
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
  AdminMfaChallenge deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdminMfaChallengeBuilder();
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
