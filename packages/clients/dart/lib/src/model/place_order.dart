//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/place_order_item.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'place_order.g.dart';

/// PlaceOrder
///
/// Properties:
/// * [addressId]
/// * [items]
/// * [clientRequestId]
@BuiltValue()
abstract class PlaceOrder implements Built<PlaceOrder, PlaceOrderBuilder> {
  @BuiltValueField(wireName: r'addressId')
  String get addressId;

  @BuiltValueField(wireName: r'items')
  BuiltList<PlaceOrderItem> get items;

  @BuiltValueField(wireName: r'clientRequestId')
  String get clientRequestId;

  PlaceOrder._();

  factory PlaceOrder([void updates(PlaceOrderBuilder b)]) = _$PlaceOrder;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PlaceOrderBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PlaceOrder> get serializer => _$PlaceOrderSerializer();
}

class _$PlaceOrderSerializer implements PrimitiveSerializer<PlaceOrder> {
  @override
  final Iterable<Type> types = const [PlaceOrder, _$PlaceOrder];

  @override
  final String wireName = r'PlaceOrder';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PlaceOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'addressId';
    yield serializers.serialize(
      object.addressId,
      specifiedType: const FullType(String),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(PlaceOrderItem)]),
    );
    yield r'clientRequestId';
    yield serializers.serialize(
      object.clientRequestId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PlaceOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PlaceOrderBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'addressId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.addressId = valueDes;
          break;
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PlaceOrderItem)]),
          ) as BuiltList<PlaceOrderItem>;
          result.items.replace(valueDes);
          break;
        case r'clientRequestId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.clientRequestId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PlaceOrder deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PlaceOrderBuilder();
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
