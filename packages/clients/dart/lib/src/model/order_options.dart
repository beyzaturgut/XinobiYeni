//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_options.g.dart';

/// OrderOptions
///
/// Properties:
/// * [cancelReasons]
/// * [returnReasons]
/// * [carriers]
/// * [returnWindowDays]
@BuiltValue()
abstract class OrderOptions implements Built<OrderOptions, OrderOptionsBuilder> {
  @BuiltValueField(wireName: r'cancelReasons')
  BuiltList<String> get cancelReasons;

  @BuiltValueField(wireName: r'returnReasons')
  BuiltList<String> get returnReasons;

  @BuiltValueField(wireName: r'carriers')
  BuiltList<String> get carriers;

  @BuiltValueField(wireName: r'returnWindowDays')
  int get returnWindowDays;

  OrderOptions._();

  factory OrderOptions([void updates(OrderOptionsBuilder b)]) = _$OrderOptions;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderOptionsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderOptions> get serializer => _$OrderOptionsSerializer();
}

class _$OrderOptionsSerializer implements PrimitiveSerializer<OrderOptions> {
  @override
  final Iterable<Type> types = const [OrderOptions, _$OrderOptions];

  @override
  final String wireName = r'OrderOptions';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'cancelReasons';
    yield serializers.serialize(
      object.cancelReasons,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'returnReasons';
    yield serializers.serialize(
      object.returnReasons,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'carriers';
    yield serializers.serialize(
      object.carriers,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'returnWindowDays';
    yield serializers.serialize(
      object.returnWindowDays,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OrderOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderOptionsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'cancelReasons':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.cancelReasons.replace(valueDes);
          break;
        case r'returnReasons':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.returnReasons.replace(valueDes);
          break;
        case r'carriers':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.carriers.replace(valueDes);
          break;
        case r'returnWindowDays':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.returnWindowDays = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OrderOptions deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderOptionsBuilder();
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
