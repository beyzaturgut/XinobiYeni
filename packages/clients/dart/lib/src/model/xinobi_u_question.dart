//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_option.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'xinobi_u_question.g.dart';

/// XinobiUQuestion
///
/// Properties:
/// * [id]
/// * [axis]
/// * [axisLabel]
/// * [text]
/// * [options]
@BuiltValue()
abstract class XinobiUQuestion implements Built<XinobiUQuestion, XinobiUQuestionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'axis')
  String get axis;

  @BuiltValueField(wireName: r'axisLabel')
  String get axisLabel;

  @BuiltValueField(wireName: r'text')
  String get text;

  @BuiltValueField(wireName: r'options')
  BuiltList<XinobiUOption> get options;

  XinobiUQuestion._();

  factory XinobiUQuestion([void updates(XinobiUQuestionBuilder b)]) = _$XinobiUQuestion;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(XinobiUQuestionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<XinobiUQuestion> get serializer => _$XinobiUQuestionSerializer();
}

class _$XinobiUQuestionSerializer implements PrimitiveSerializer<XinobiUQuestion> {
  @override
  final Iterable<Type> types = const [XinobiUQuestion, _$XinobiUQuestion];

  @override
  final String wireName = r'XinobiUQuestion';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    XinobiUQuestion object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'axis';
    yield serializers.serialize(
      object.axis,
      specifiedType: const FullType(String),
    );
    yield r'axisLabel';
    yield serializers.serialize(
      object.axisLabel,
      specifiedType: const FullType(String),
    );
    yield r'text';
    yield serializers.serialize(
      object.text,
      specifiedType: const FullType(String),
    );
    yield r'options';
    yield serializers.serialize(
      object.options,
      specifiedType: const FullType(BuiltList, [FullType(XinobiUOption)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    XinobiUQuestion object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required XinobiUQuestionBuilder result,
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
        case r'axis':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.axis = valueDes;
          break;
        case r'axisLabel':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.axisLabel = valueDes;
          break;
        case r'text':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.text = valueDes;
          break;
        case r'options':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(XinobiUOption)]),
          ) as BuiltList<XinobiUOption>;
          result.options.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  XinobiUQuestion deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = XinobiUQuestionBuilder();
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
