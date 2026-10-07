//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'xinobi_u_answer.g.dart';

/// XinobiUAnswer
///
/// Properties:
/// * [questionId]
/// * [optionId]
@BuiltValue()
abstract class XinobiUAnswer implements Built<XinobiUAnswer, XinobiUAnswerBuilder> {
  @BuiltValueField(wireName: r'questionId')
  String get questionId;

  @BuiltValueField(wireName: r'optionId')
  String get optionId;

  XinobiUAnswer._();

  factory XinobiUAnswer([void updates(XinobiUAnswerBuilder b)]) = _$XinobiUAnswer;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(XinobiUAnswerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<XinobiUAnswer> get serializer => _$XinobiUAnswerSerializer();
}

class _$XinobiUAnswerSerializer implements PrimitiveSerializer<XinobiUAnswer> {
  @override
  final Iterable<Type> types = const [XinobiUAnswer, _$XinobiUAnswer];

  @override
  final String wireName = r'XinobiUAnswer';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    XinobiUAnswer object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'questionId';
    yield serializers.serialize(
      object.questionId,
      specifiedType: const FullType(String),
    );
    yield r'optionId';
    yield serializers.serialize(
      object.optionId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    XinobiUAnswer object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required XinobiUAnswerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'questionId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.questionId = valueDes;
          break;
        case r'optionId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.optionId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  XinobiUAnswer deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = XinobiUAnswerBuilder();
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
