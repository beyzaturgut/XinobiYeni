//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/order_event.dart';
import 'package:xinobi_api_client/src/model/order_shipment.dart';
import 'package:xinobi_api_client/src/model/customer_address.dart';
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/order_request.dart';
import 'package:xinobi_api_client/src/model/customer_order_line.dart';
import 'package:xinobi_api_client/src/model/money.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'customer_order.g.dart';

/// CustomerOrder
///
/// Properties:
/// * [id]
/// * [number]
/// * [createdAt]
/// * [status]
/// * [address]
/// * [lines]
/// * [total]
/// * [shipment]
/// * [history]
/// * [requests]
@BuiltValue()
abstract class CustomerOrder implements Built<CustomerOrder, CustomerOrderBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'number')
  String get number;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'address')
  CustomerAddress get address;

  @BuiltValueField(wireName: r'lines')
  BuiltList<CustomerOrderLine> get lines;

  @BuiltValueField(wireName: r'total')
  Money get total;

  @BuiltValueField(wireName: r'shipment')
  OrderShipment? get shipment;

  @BuiltValueField(wireName: r'history')
  BuiltList<OrderEvent>? get history;

  @BuiltValueField(wireName: r'requests')
  BuiltList<OrderRequest>? get requests;

  CustomerOrder._();

  factory CustomerOrder([void updates(CustomerOrderBuilder b)]) = _$CustomerOrder;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CustomerOrderBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CustomerOrder> get serializer => _$CustomerOrderSerializer();
}

class _$CustomerOrderSerializer implements PrimitiveSerializer<CustomerOrder> {
  @override
  final Iterable<Type> types = const [CustomerOrder, _$CustomerOrder];

  @override
  final String wireName = r'CustomerOrder';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CustomerOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'number';
    yield serializers.serialize(
      object.number,
      specifiedType: const FullType(String),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'address';
    yield serializers.serialize(
      object.address,
      specifiedType: const FullType(CustomerAddress),
    );
    yield r'lines';
    yield serializers.serialize(
      object.lines,
      specifiedType: const FullType(BuiltList, [FullType(CustomerOrderLine)]),
    );
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(Money),
    );
    if (object.shipment != null) {
      yield r'shipment';
      yield serializers.serialize(
        object.shipment,
        specifiedType: const FullType.nullable(OrderShipment),
      );
    }
    if (object.history != null) {
      yield r'history';
      yield serializers.serialize(
        object.history,
        specifiedType: const FullType.nullable(BuiltList, [FullType(OrderEvent)]),
      );
    }
    if (object.requests != null) {
      yield r'requests';
      yield serializers.serialize(
        object.requests,
        specifiedType: const FullType.nullable(BuiltList, [FullType(OrderRequest)]),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    CustomerOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CustomerOrderBuilder result,
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
        case r'number':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.number = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'address':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerAddress),
          ) as CustomerAddress;
          result.address.replace(valueDes);
          break;
        case r'lines':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CustomerOrderLine)]),
          ) as BuiltList<CustomerOrderLine>;
          result.lines.replace(valueDes);
          break;
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Money),
          ) as Money;
          result.total.replace(valueDes);
          break;
        case r'shipment':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(OrderShipment),
          ) as OrderShipment?;
          if (valueDes == null) continue;
          result.shipment.replace(valueDes);
          break;
        case r'history':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BuiltList, [FullType(OrderEvent)]),
          ) as BuiltList<OrderEvent>?;
          if (valueDes == null) continue;
          result.history.replace(valueDes);
          break;
        case r'requests':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BuiltList, [FullType(OrderRequest)]),
          ) as BuiltList<OrderRequest>?;
          if (valueDes == null) continue;
          result.requests.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CustomerOrder deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CustomerOrderBuilder();
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
