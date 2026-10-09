//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/assistant_message.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assistant_conversation_view.g.dart';

/// AssistantConversationView
///
/// Properties:
/// * [id]
/// * [messages]
/// * [leadSent]
/// * [handedOff]
@BuiltValue()
abstract class AssistantConversationView implements Built<AssistantConversationView, AssistantConversationViewBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'messages')
  BuiltList<AssistantMessage> get messages;

  @BuiltValueField(wireName: r'leadSent')
  bool get leadSent;

  @BuiltValueField(wireName: r'handedOff')
  bool get handedOff;

  AssistantConversationView._();

  factory AssistantConversationView([void updates(AssistantConversationViewBuilder b)]) = _$AssistantConversationView;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssistantConversationViewBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssistantConversationView> get serializer => _$AssistantConversationViewSerializer();
}

class _$AssistantConversationViewSerializer implements PrimitiveSerializer<AssistantConversationView> {
  @override
  final Iterable<Type> types = const [AssistantConversationView, _$AssistantConversationView];

  @override
  final String wireName = r'AssistantConversationView';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssistantConversationView object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'messages';
    yield serializers.serialize(
      object.messages,
      specifiedType: const FullType(BuiltList, [FullType(AssistantMessage)]),
    );
    yield r'leadSent';
    yield serializers.serialize(
      object.leadSent,
      specifiedType: const FullType(bool),
    );
    yield r'handedOff';
    yield serializers.serialize(
      object.handedOff,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssistantConversationView object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssistantConversationViewBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'messages':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(AssistantMessage)]),
          ) as BuiltList<AssistantMessage>;
          result.messages.replace(valueDes);
          break;
        case r'leadSent':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.leadSent = valueDes;
          break;
        case r'handedOff':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.handedOff = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssistantConversationView deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssistantConversationViewBuilder();
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
