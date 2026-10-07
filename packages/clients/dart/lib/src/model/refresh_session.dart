//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'refresh_session.g.dart';

/// RefreshSession
///
/// Properties:
/// * [refreshToken]
@BuiltValue()
abstract class RefreshSession implements Built<RefreshSession, RefreshSessionBuilder> {
  @BuiltValueField(wireName: r'refreshToken')
  String get refreshToken;

  RefreshSession._();

  factory RefreshSession([void updates(RefreshSessionBuilder b)]) = _$RefreshSession;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RefreshSessionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RefreshSession> get serializer => _$RefreshSessionSerializer();
}

class _$RefreshSessionSerializer implements PrimitiveSerializer<RefreshSession> {
  @override
  final Iterable<Type> types = const [RefreshSession, _$RefreshSession];

  @override
  final String wireName = r'RefreshSession';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RefreshSession object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'refreshToken';
    yield serializers.serialize(
      object.refreshToken,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RefreshSession object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RefreshSessionBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'refreshToken':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.refreshToken = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RefreshSession deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RefreshSessionBuilder();
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
