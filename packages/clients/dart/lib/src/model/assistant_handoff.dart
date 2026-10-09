//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assistant_handoff.g.dart';

/// AssistantHandoff
///
/// Properties:
/// * [channel]
/// * [url]
/// * [message]
@BuiltValue()
abstract class AssistantHandoff implements Built<AssistantHandoff, AssistantHandoffBuilder> {
  @BuiltValueField(wireName: r'channel')
  String get channel;

  @BuiltValueField(wireName: r'url')
  String? get url;

  @BuiltValueField(wireName: r'message')
  String get message;

  AssistantHandoff._();

  factory AssistantHandoff([void updates(AssistantHandoffBuilder b)]) = _$AssistantHandoff;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssistantHandoffBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssistantHandoff> get serializer => _$AssistantHandoffSerializer();
}

class _$AssistantHandoffSerializer implements PrimitiveSerializer<AssistantHandoff> {
  @override
  final Iterable<Type> types = const [AssistantHandoff, _$AssistantHandoff];

  @override
  final String wireName = r'AssistantHandoff';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssistantHandoff object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'channel';
    yield serializers.serialize(
      object.channel,
      specifiedType: const FullType(String),
    );
    yield r'url';
    yield object.url == null ? null : serializers.serialize(
      object.url,
      specifiedType: const FullType.nullable(String),
    );
    yield r'message';
    yield serializers.serialize(
      object.message,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssistantHandoff object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssistantHandoffBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'channel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.channel = valueDes;
          break;
        case r'url':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.url = valueDes;
          break;
        case r'message':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.message = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssistantHandoff deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssistantHandoffBuilder();
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
