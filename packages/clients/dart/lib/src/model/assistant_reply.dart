//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/assistant_message.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assistant_reply.g.dart';

/// AssistantReply
///
/// Properties:
/// * [conversationId]
/// * [reply]
/// * [remaining]
@BuiltValue()
abstract class AssistantReply implements Built<AssistantReply, AssistantReplyBuilder> {
  @BuiltValueField(wireName: r'conversationId')
  String get conversationId;

  @BuiltValueField(wireName: r'reply')
  AssistantMessage get reply;

  @BuiltValueField(wireName: r'remaining')
  int get remaining;

  AssistantReply._();

  factory AssistantReply([void updates(AssistantReplyBuilder b)]) = _$AssistantReply;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssistantReplyBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssistantReply> get serializer => _$AssistantReplySerializer();
}

class _$AssistantReplySerializer implements PrimitiveSerializer<AssistantReply> {
  @override
  final Iterable<Type> types = const [AssistantReply, _$AssistantReply];

  @override
  final String wireName = r'AssistantReply';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssistantReply object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'conversationId';
    yield serializers.serialize(
      object.conversationId,
      specifiedType: const FullType(String),
    );
    yield r'reply';
    yield serializers.serialize(
      object.reply,
      specifiedType: const FullType(AssistantMessage),
    );
    yield r'remaining';
    yield serializers.serialize(
      object.remaining,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssistantReply object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssistantReplyBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'conversationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.conversationId = valueDes;
          break;
        case r'reply':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AssistantMessage),
          ) as AssistantMessage;
          result.reply.replace(valueDes);
          break;
        case r'remaining':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.remaining = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssistantReply deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssistantReplyBuilder();
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
