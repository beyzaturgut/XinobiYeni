//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_status_count.g.dart';

/// OrderStatusCount
///
/// Properties:
/// * [status]
/// * [count]
@BuiltValue()
abstract class OrderStatusCount implements Built<OrderStatusCount, OrderStatusCountBuilder> {
  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'count')
  int get count;

  OrderStatusCount._();

  factory OrderStatusCount([void updates(OrderStatusCountBuilder b)]) = _$OrderStatusCount;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderStatusCountBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderStatusCount> get serializer => _$OrderStatusCountSerializer();
}

class _$OrderStatusCountSerializer implements PrimitiveSerializer<OrderStatusCount> {
  @override
  final Iterable<Type> types = const [OrderStatusCount, _$OrderStatusCount];

  @override
  final String wireName = r'OrderStatusCount';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderStatusCount object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'count';
    yield serializers.serialize(
      object.count,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OrderStatusCount object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderStatusCountBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'count':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.count = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OrderStatusCount deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderStatusCountBuilder();
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
