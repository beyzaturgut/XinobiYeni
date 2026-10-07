//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/xinobi_u_answer.dart';
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_variant.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_product.dart';
import 'package:xinobi_api_client/src/model/xinobi_u_question.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'xinobi_u_session.g.dart';

/// XinobiUSession
///
/// Properties:
/// * [id]
/// * [status]
/// * [expiresAt]
/// * [product]
/// * [variant]
/// * [questionBankVersion]
/// * [questions]
/// * [answers]
/// * [imageUrl]
/// * [errorCode]
/// * [errorMessage]
@BuiltValue()
abstract class XinobiUSession implements Built<XinobiUSession, XinobiUSessionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'expiresAt')
  DateTime get expiresAt;

  @BuiltValueField(wireName: r'product')
  XinobiUProduct get product;

  @BuiltValueField(wireName: r'variant')
  XinobiUVariant get variant;

  @BuiltValueField(wireName: r'questionBankVersion')
  String get questionBankVersion;

  @BuiltValueField(wireName: r'questions')
  BuiltList<XinobiUQuestion> get questions;

  @BuiltValueField(wireName: r'answers')
  BuiltList<XinobiUAnswer> get answers;

  @BuiltValueField(wireName: r'imageUrl')
  String? get imageUrl;

  @BuiltValueField(wireName: r'errorCode')
  String? get errorCode;

  @BuiltValueField(wireName: r'errorMessage')
  String? get errorMessage;

  XinobiUSession._();

  factory XinobiUSession([void updates(XinobiUSessionBuilder b)]) = _$XinobiUSession;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(XinobiUSessionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<XinobiUSession> get serializer => _$XinobiUSessionSerializer();
}

class _$XinobiUSessionSerializer implements PrimitiveSerializer<XinobiUSession> {
  @override
  final Iterable<Type> types = const [XinobiUSession, _$XinobiUSession];

  @override
  final String wireName = r'XinobiUSession';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    XinobiUSession object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'expiresAt';
    yield serializers.serialize(
      object.expiresAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'product';
    yield serializers.serialize(
      object.product,
      specifiedType: const FullType(XinobiUProduct),
    );
    yield r'variant';
    yield serializers.serialize(
      object.variant,
      specifiedType: const FullType(XinobiUVariant),
    );
    yield r'questionBankVersion';
    yield serializers.serialize(
      object.questionBankVersion,
      specifiedType: const FullType(String),
    );
    yield r'questions';
    yield serializers.serialize(
      object.questions,
      specifiedType: const FullType(BuiltList, [FullType(XinobiUQuestion)]),
    );
    yield r'answers';
    yield serializers.serialize(
      object.answers,
      specifiedType: const FullType(BuiltList, [FullType(XinobiUAnswer)]),
    );
    yield r'imageUrl';
    yield object.imageUrl == null ? null : serializers.serialize(
      object.imageUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'errorCode';
    yield object.errorCode == null ? null : serializers.serialize(
      object.errorCode,
      specifiedType: const FullType.nullable(String),
    );
    yield r'errorMessage';
    yield object.errorMessage == null ? null : serializers.serialize(
      object.errorMessage,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    XinobiUSession object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required XinobiUSessionBuilder result,
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
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'expiresAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.expiresAt = valueDes;
          break;
        case r'product':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(XinobiUProduct),
          ) as XinobiUProduct;
          result.product.replace(valueDes);
          break;
        case r'variant':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(XinobiUVariant),
          ) as XinobiUVariant;
          result.variant.replace(valueDes);
          break;
        case r'questionBankVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.questionBankVersion = valueDes;
          break;
        case r'questions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(XinobiUQuestion)]),
          ) as BuiltList<XinobiUQuestion>;
          result.questions.replace(valueDes);
          break;
        case r'answers':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(XinobiUAnswer)]),
          ) as BuiltList<XinobiUAnswer>;
          result.answers.replace(valueDes);
          break;
        case r'imageUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.imageUrl = valueDes;
          break;
        case r'errorCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.errorCode = valueDes;
          break;
        case r'errorMessage':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.errorMessage = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  XinobiUSession deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = XinobiUSessionBuilder();
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
