//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/date.dart';
import 'package:xinobi_api_client/src/model/quote_item_request.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_quote.g.dart';

/// CreateQuote
///
/// Properties:
/// * [company]
/// * [contactName]
/// * [email]
/// * [phone]
/// * [taxNumber]
/// * [items]
/// * [personalization]
/// * [personalizationNote]
/// * [desiredDate]
/// * [purpose]
/// * [note]
@BuiltValue()
abstract class CreateQuote implements Built<CreateQuote, CreateQuoteBuilder> {
  @BuiltValueField(wireName: r'company')
  String get company;

  @BuiltValueField(wireName: r'contactName')
  String get contactName;

  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'phone')
  String? get phone;

  @BuiltValueField(wireName: r'taxNumber')
  String? get taxNumber;

  @BuiltValueField(wireName: r'items')
  BuiltList<QuoteItemRequest> get items;

  @BuiltValueField(wireName: r'personalization')
  bool get personalization;

  @BuiltValueField(wireName: r'personalizationNote')
  String? get personalizationNote;

  @BuiltValueField(wireName: r'desiredDate')
  Date? get desiredDate;

  @BuiltValueField(wireName: r'purpose')
  String? get purpose;

  @BuiltValueField(wireName: r'note')
  String? get note;

  CreateQuote._();

  factory CreateQuote([void updates(CreateQuoteBuilder b)]) = _$CreateQuote;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateQuoteBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateQuote> get serializer => _$CreateQuoteSerializer();
}

class _$CreateQuoteSerializer implements PrimitiveSerializer<CreateQuote> {
  @override
  final Iterable<Type> types = const [CreateQuote, _$CreateQuote];

  @override
  final String wireName = r'CreateQuote';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateQuote object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'company';
    yield serializers.serialize(
      object.company,
      specifiedType: const FullType(String),
    );
    yield r'contactName';
    yield serializers.serialize(
      object.contactName,
      specifiedType: const FullType(String),
    );
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'phone';
    yield object.phone == null ? null : serializers.serialize(
      object.phone,
      specifiedType: const FullType.nullable(String),
    );
    yield r'taxNumber';
    yield object.taxNumber == null ? null : serializers.serialize(
      object.taxNumber,
      specifiedType: const FullType.nullable(String),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(QuoteItemRequest)]),
    );
    yield r'personalization';
    yield serializers.serialize(
      object.personalization,
      specifiedType: const FullType(bool),
    );
    yield r'personalizationNote';
    yield object.personalizationNote == null ? null : serializers.serialize(
      object.personalizationNote,
      specifiedType: const FullType.nullable(String),
    );
    yield r'desiredDate';
    yield object.desiredDate == null ? null : serializers.serialize(
      object.desiredDate,
      specifiedType: const FullType.nullable(Date),
    );
    yield r'purpose';
    yield object.purpose == null ? null : serializers.serialize(
      object.purpose,
      specifiedType: const FullType.nullable(String),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CreateQuote object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateQuoteBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'company':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.company = valueDes;
          break;
        case r'contactName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.contactName = valueDes;
          break;
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'phone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.phone = valueDes;
          break;
        case r'taxNumber':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.taxNumber = valueDes;
          break;
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(QuoteItemRequest)]),
          ) as BuiltList<QuoteItemRequest>;
          result.items.replace(valueDes);
          break;
        case r'personalization':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.personalization = valueDes;
          break;
        case r'personalizationNote':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.personalizationNote = valueDes;
          break;
        case r'desiredDate':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Date),
          ) as Date?;
          if (valueDes == null) continue;
          result.desiredDate = valueDes;
          break;
        case r'purpose':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.purpose = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreateQuote deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateQuoteBuilder();
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
