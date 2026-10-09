//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_request_line.g.dart';

/// OrderRequestLine
///
/// Properties:
/// * [variantId]
/// * [quantity]
@BuiltValue()
abstract class OrderRequestLine implements Built<OrderRequestLine, OrderRequestLineBuilder> {
  @BuiltValueField(wireName: r'variantId')
  String get variantId;

  @BuiltValueField(wireName: r'quantity')
  int get quantity;

  OrderRequestLine._();

  factory OrderRequestLine([void updates(OrderRequestLineBuilder b)]) = _$OrderRequestLine;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderRequestLineBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderRequestLine> get serializer => _$OrderRequestLineSerializer();
}

class _$OrderRequestLineSerializer implements PrimitiveSerializer<OrderRequestLine> {
  @override
  final Iterable<Type> types = const [OrderRequestLine, _$OrderRequestLine];

  @override
  final String wireName = r'OrderRequestLine';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderRequestLine object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'variantId';
    yield serializers.serialize(
      object.variantId,
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
    OrderRequestLine object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderRequestLineBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'variantId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.variantId = valueDes;
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
  OrderRequestLine deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderRequestLineBuilder();
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
