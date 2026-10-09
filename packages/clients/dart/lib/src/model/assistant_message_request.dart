//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assistant_message_request.g.dart';

/// AssistantMessageRequest
///
/// Properties:
/// * [conversationId]
/// * [clientId]
/// * [message]
/// * [channel]
@BuiltValue()
abstract class AssistantMessageRequest implements Built<AssistantMessageRequest, AssistantMessageRequestBuilder> {
  @BuiltValueField(wireName: r'conversationId')
  String? get conversationId;

  @BuiltValueField(wireName: r'clientId')
  String get clientId;

  @BuiltValueField(wireName: r'message')
  String get message;

  @BuiltValueField(wireName: r'channel')
  String? get channel;

  AssistantMessageRequest._();

  factory AssistantMessageRequest([void updates(AssistantMessageRequestBuilder b)]) = _$AssistantMessageRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssistantMessageRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssistantMessageRequest> get serializer => _$AssistantMessageRequestSerializer();
}

class _$AssistantMessageRequestSerializer implements PrimitiveSerializer<AssistantMessageRequest> {
  @override
  final Iterable<Type> types = const [AssistantMessageRequest, _$AssistantMessageRequest];

  @override
  final String wireName = r'AssistantMessageRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssistantMessageRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'conversationId';
    yield object.conversationId == null ? null : serializers.serialize(
      object.conversationId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'clientId';
    yield serializers.serialize(
      object.clientId,
      specifiedType: const FullType(String),
    );
    yield r'message';
    yield serializers.serialize(
      object.message,
      specifiedType: const FullType(String),
    );
    yield r'channel';
    yield object.channel == null ? null : serializers.serialize(
      object.channel,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssistantMessageRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssistantMessageRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'conversationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.conversationId = valueDes;
          break;
        case r'clientId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.clientId = valueDes;
          break;
        case r'message':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.message = valueDes;
          break;
        case r'channel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.channel = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssistantMessageRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssistantMessageRequestBuilder();
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
