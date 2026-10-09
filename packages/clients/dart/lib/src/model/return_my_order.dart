//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/order_request_line.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'return_my_order.g.dart';

/// ReturnMyOrder
///
/// Properties:
/// * [reason]
/// * [description]
/// * [lines]
@BuiltValue()
abstract class ReturnMyOrder implements Built<ReturnMyOrder, ReturnMyOrderBuilder> {
  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'description')
  String? get description;

  @BuiltValueField(wireName: r'lines')
  BuiltList<OrderRequestLine> get lines;

  ReturnMyOrder._();

  factory ReturnMyOrder([void updates(ReturnMyOrderBuilder b)]) = _$ReturnMyOrder;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReturnMyOrderBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReturnMyOrder> get serializer => _$ReturnMyOrderSerializer();
}

class _$ReturnMyOrderSerializer implements PrimitiveSerializer<ReturnMyOrder> {
  @override
  final Iterable<Type> types = const [ReturnMyOrder, _$ReturnMyOrder];

  @override
  final String wireName = r'ReturnMyOrder';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReturnMyOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    yield r'description';
    yield object.description == null ? null : serializers.serialize(
      object.description,
      specifiedType: const FullType.nullable(String),
    );
    yield r'lines';
    yield serializers.serialize(
      object.lines,
      specifiedType: const FullType(BuiltList, [FullType(OrderRequestLine)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ReturnMyOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReturnMyOrderBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.description = valueDes;
          break;
        case r'lines':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(OrderRequestLine)]),
          ) as BuiltList<OrderRequestLine>;
          result.lines.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReturnMyOrder deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReturnMyOrderBuilder();
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
