//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assistant_handoff_request.g.dart';

/// AssistantHandoffRequest
///
/// Properties:
/// * [clientId]
@BuiltValue()
abstract class AssistantHandoffRequest implements Built<AssistantHandoffRequest, AssistantHandoffRequestBuilder> {
  @BuiltValueField(wireName: r'clientId')
  String get clientId;

  AssistantHandoffRequest._();

  factory AssistantHandoffRequest([void updates(AssistantHandoffRequestBuilder b)]) = _$AssistantHandoffRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssistantHandoffRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssistantHandoffRequest> get serializer => _$AssistantHandoffRequestSerializer();
}

class _$AssistantHandoffRequestSerializer implements PrimitiveSerializer<AssistantHandoffRequest> {
  @override
  final Iterable<Type> types = const [AssistantHandoffRequest, _$AssistantHandoffRequest];

  @override
  final String wireName = r'AssistantHandoffRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssistantHandoffRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'clientId';
    yield serializers.serialize(
      object.clientId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssistantHandoffRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssistantHandoffRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'clientId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.clientId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssistantHandoffRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssistantHandoffRequestBuilder();
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
