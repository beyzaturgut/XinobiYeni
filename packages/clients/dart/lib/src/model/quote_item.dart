//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/money.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'quote_item.g.dart';

/// QuoteItem
///
/// Properties:
/// * [productId]
/// * [productName]
/// * [quantity]
/// * [unitPrice]
/// * [lineTotal]
@BuiltValue()
abstract class QuoteItem implements Built<QuoteItem, QuoteItemBuilder> {
  @BuiltValueField(wireName: r'productId')
  String get productId;

  @BuiltValueField(wireName: r'productName')
  String get productName;

  @BuiltValueField(wireName: r'quantity')
  int get quantity;

  @BuiltValueField(wireName: r'unitPrice')
  Money? get unitPrice;

  @BuiltValueField(wireName: r'lineTotal')
  Money? get lineTotal;

  QuoteItem._();

  factory QuoteItem([void updates(QuoteItemBuilder b)]) = _$QuoteItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(QuoteItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<QuoteItem> get serializer => _$QuoteItemSerializer();
}

class _$QuoteItemSerializer implements PrimitiveSerializer<QuoteItem> {
  @override
  final Iterable<Type> types = const [QuoteItem, _$QuoteItem];

  @override
  final String wireName = r'QuoteItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    QuoteItem object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'productId';
    yield serializers.serialize(
      object.productId,
      specifiedType: const FullType(String),
    );
    yield r'productName';
    yield serializers.serialize(
      object.productName,
      specifiedType: const FullType(String),
    );
    yield r'quantity';
    yield serializers.serialize(
      object.quantity,
      specifiedType: const FullType(int),
    );
    if (object.unitPrice != null) {
      yield r'unitPrice';
      yield serializers.serialize(
        object.unitPrice,
        specifiedType: const FullType.nullable(Money),
      );
    }
    if (object.lineTotal != null) {
      yield r'lineTotal';
      yield serializers.serialize(
        object.lineTotal,
        specifiedType: const FullType.nullable(Money),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    QuoteItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required QuoteItemBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'productId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productId = valueDes;
          break;
        case r'productName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productName = valueDes;
          break;
        case r'quantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.quantity = valueDes;
          break;
        case r'unitPrice':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Money),
          ) as Money?;
          if (valueDes == null) continue;
          result.unitPrice.replace(valueDes);
          break;
        case r'lineTotal':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Money),
          ) as Money?;
          if (valueDes == null) continue;
          result.lineTotal.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  QuoteItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = QuoteItemBuilder();
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
