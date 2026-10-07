//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/xinobi_u_answer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'xinobi_u_generation_request.g.dart';

/// XinobiUGenerationRequest
///
/// Properties:
/// * [answers]
@BuiltValue()
abstract class XinobiUGenerationRequest implements Built<XinobiUGenerationRequest, XinobiUGenerationRequestBuilder> {
  @BuiltValueField(wireName: r'answers')
  BuiltList<XinobiUAnswer> get answers;

  XinobiUGenerationRequest._();

  factory XinobiUGenerationRequest([void updates(XinobiUGenerationRequestBuilder b)]) = _$XinobiUGenerationRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(XinobiUGenerationRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<XinobiUGenerationRequest> get serializer => _$XinobiUGenerationRequestSerializer();
}

class _$XinobiUGenerationRequestSerializer implements PrimitiveSerializer<XinobiUGenerationRequest> {
  @override
  final Iterable<Type> types = const [XinobiUGenerationRequest, _$XinobiUGenerationRequest];

  @override
  final String wireName = r'XinobiUGenerationRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    XinobiUGenerationRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'answers';
    yield serializers.serialize(
      object.answers,
      specifiedType: const FullType(BuiltList, [FullType(XinobiUAnswer)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    XinobiUGenerationRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required XinobiUGenerationRequestBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'answers':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(XinobiUAnswer)]),
          ) as BuiltList<XinobiUAnswer>;
          result.answers.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  XinobiUGenerationRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = XinobiUGenerationRequestBuilder();
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
