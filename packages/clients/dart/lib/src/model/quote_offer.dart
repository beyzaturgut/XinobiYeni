//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/date.dart';
import 'package:xinobi_api_client/src/model/money.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'quote_offer.g.dart';

/// QuoteOffer
///
/// Properties:
/// * [total]
/// * [validUntil]
/// * [note]
/// * [at]
@BuiltValue()
abstract class QuoteOffer implements Built<QuoteOffer, QuoteOfferBuilder> {
  @BuiltValueField(wireName: r'total')
  Money get total;

  @BuiltValueField(wireName: r'validUntil')
  Date get validUntil;

  @BuiltValueField(wireName: r'note')
  String? get note;

  @BuiltValueField(wireName: r'at')
  DateTime get at;

  QuoteOffer._();

  factory QuoteOffer([void updates(QuoteOfferBuilder b)]) = _$QuoteOffer;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(QuoteOfferBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<QuoteOffer> get serializer => _$QuoteOfferSerializer();
}

class _$QuoteOfferSerializer implements PrimitiveSerializer<QuoteOffer> {
  @override
  final Iterable<Type> types = const [QuoteOffer, _$QuoteOffer];

  @override
  final String wireName = r'QuoteOffer';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    QuoteOffer object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(Money),
    );
    yield r'validUntil';
    yield serializers.serialize(
      object.validUntil,
      specifiedType: const FullType(Date),
    );
    yield r'note';
    yield object.note == null ? null : serializers.serialize(
      object.note,
      specifiedType: const FullType.nullable(String),
    );
    yield r'at';
    yield serializers.serialize(
      object.at,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    QuoteOffer object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required QuoteOfferBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.total.replace(valueDes);
          break;
        case r'validUntil':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Date),
          ) as Date;
          result.validUntil = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.note = valueDes;
          break;
        case r'at':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.at = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  QuoteOffer deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = QuoteOfferBuilder();
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
