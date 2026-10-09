//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assistant_config.g.dart';

/// AssistantConfig
///
/// Properties:
/// * [enabled]
/// * [aiAnswers]
/// * [greeting]
/// * [quickReplies]
/// * [whatsAppAvailable]
/// * [disclaimer]
@BuiltValue()
abstract class AssistantConfig implements Built<AssistantConfig, AssistantConfigBuilder> {
  @BuiltValueField(wireName: r'enabled')
  bool get enabled;

  @BuiltValueField(wireName: r'aiAnswers')
  bool get aiAnswers;

  @BuiltValueField(wireName: r'greeting')
  String get greeting;

  @BuiltValueField(wireName: r'quickReplies')
  BuiltList<String> get quickReplies;

  @BuiltValueField(wireName: r'whatsAppAvailable')
  bool get whatsAppAvailable;

  @BuiltValueField(wireName: r'disclaimer')
  String get disclaimer;

  AssistantConfig._();

  factory AssistantConfig([void updates(AssistantConfigBuilder b)]) = _$AssistantConfig;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssistantConfigBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssistantConfig> get serializer => _$AssistantConfigSerializer();
}

class _$AssistantConfigSerializer implements PrimitiveSerializer<AssistantConfig> {
  @override
  final Iterable<Type> types = const [AssistantConfig, _$AssistantConfig];

  @override
  final String wireName = r'AssistantConfig';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssistantConfig object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'enabled';
    yield serializers.serialize(
      object.enabled,
      specifiedType: const FullType(bool),
    );
    yield r'aiAnswers';
    yield serializers.serialize(
      object.aiAnswers,
      specifiedType: const FullType(bool),
    );
    yield r'greeting';
    yield serializers.serialize(
      object.greeting,
      specifiedType: const FullType(String),
    );
    yield r'quickReplies';
    yield serializers.serialize(
      object.quickReplies,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'whatsAppAvailable';
    yield serializers.serialize(
      object.whatsAppAvailable,
      specifiedType: const FullType(bool),
    );
    yield r'disclaimer';
    yield serializers.serialize(
      object.disclaimer,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssistantConfig object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssistantConfigBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'enabled':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.enabled = valueDes;
          break;
        case r'aiAnswers':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.aiAnswers = valueDes;
          break;
        case r'greeting':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.greeting = valueDes;
          break;
        case r'quickReplies':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.quickReplies.replace(valueDes);
          break;
        case r'whatsAppAvailable':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.whatsAppAvailable = valueDes;
          break;
        case r'disclaimer':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.disclaimer = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssistantConfig deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssistantConfigBuilder();
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
