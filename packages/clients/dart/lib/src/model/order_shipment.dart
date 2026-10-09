//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_shipment.g.dart';

/// OrderShipment
///
/// Properties:
/// * [carrier]
/// * [trackingNumber]
/// * [trackingUrl]
/// * [shippedAt]
/// * [deliveredAt]
@BuiltValue()
abstract class OrderShipment implements Built<OrderShipment, OrderShipmentBuilder> {
  @BuiltValueField(wireName: r'carrier')
  String get carrier;

  @BuiltValueField(wireName: r'trackingNumber')
  String get trackingNumber;

  @BuiltValueField(wireName: r'trackingUrl')
  String? get trackingUrl;

  @BuiltValueField(wireName: r'shippedAt')
  DateTime get shippedAt;

  @BuiltValueField(wireName: r'deliveredAt')
  DateTime? get deliveredAt;

  OrderShipment._();

  factory OrderShipment([void updates(OrderShipmentBuilder b)]) = _$OrderShipment;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderShipmentBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderShipment> get serializer => _$OrderShipmentSerializer();
}

class _$OrderShipmentSerializer implements PrimitiveSerializer<OrderShipment> {
  @override
  final Iterable<Type> types = const [OrderShipment, _$OrderShipment];

  @override
  final String wireName = r'OrderShipment';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderShipment object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'carrier';
    yield serializers.serialize(
      object.carrier,
      specifiedType: const FullType(String),
    );
    yield r'trackingNumber';
    yield serializers.serialize(
      object.trackingNumber,
      specifiedType: const FullType(String),
    );
    yield r'trackingUrl';
    yield object.trackingUrl == null ? null : serializers.serialize(
      object.trackingUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'shippedAt';
    yield serializers.serialize(
      object.shippedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'deliveredAt';
    yield object.deliveredAt == null ? null : serializers.serialize(
      object.deliveredAt,
      specifiedType: const FullType.nullable(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OrderShipment object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderShipmentBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'carrier':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.carrier = valueDes;
          break;
        case r'trackingNumber':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.trackingNumber = valueDes;
          break;
        case r'trackingUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.trackingUrl = valueDes;
          break;
        case r'shippedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.shippedAt = valueDes;
          break;
        case r'deliveredAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.deliveredAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OrderShipment deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderShipmentBuilder();
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
