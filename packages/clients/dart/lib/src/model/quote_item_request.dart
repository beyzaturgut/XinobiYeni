//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'quote_item_request.g.dart';

/// QuoteItemRequest
///
/// Properties:
/// * [productId]
/// * [quantity]
@BuiltValue()
abstract class QuoteItemRequest implements Built<QuoteItemRequest, QuoteItemRequestBuilder> {
  @BuiltValueField(wireName: r'productId')
  String get productId;

  @BuiltValueField(wireName: r'quantity')
  int get quantity;

  QuoteItemRequest._();

  factory QuoteItemRequest([void updates(QuoteItemRequestBuilder b)]) = _$QuoteItemRequest;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(QuoteItemRequestBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<QuoteItemRequest> get serializer => _$QuoteItemRequestSerializer();
}

class _$QuoteItemRequestSerializer implements PrimitiveSerializer<QuoteItemRequest> {
  @override
  final Iterable<Type> types = const [QuoteItemRequest, _$QuoteItemRequest];

  @override
  final String wireName = r'QuoteItemRequest';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    QuoteItemRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'productId';
    yield serializers.serialize(
      object.productId,
      specifiedType: const FullType(String),
    );
    yield r'quantity';
    yield serializers.serialize(
      object.quantity,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    QuoteItemRequest object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required QuoteItemRequestBuilder result,
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
        case r'quantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.quantity = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  QuoteItemRequest deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = QuoteItemRequestBuilder();
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
