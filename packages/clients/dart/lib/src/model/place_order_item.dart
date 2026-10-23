//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'place_order_item.g.dart';

/// PlaceOrderItem
///
/// Properties:
/// * [productId]
/// * [variantId]
/// * [quantity]
/// * [designId]
/// * [configurationId]
/// * [configurationRevision]
@BuiltValue()
abstract class PlaceOrderItem implements Built<PlaceOrderItem, PlaceOrderItemBuilder> {
  @BuiltValueField(wireName: r'productId')
  String get productId;

  @BuiltValueField(wireName: r'variantId')
  String get variantId;

  @BuiltValueField(wireName: r'quantity')
  int get quantity;

  @BuiltValueField(wireName: r'designId')
  String? get designId;

  @BuiltValueField(wireName: r'configurationId')
  String? get configurationId;

  @BuiltValueField(wireName: r'configurationRevision')
  int? get configurationRevision;

  PlaceOrderItem._();

  factory PlaceOrderItem([void updates(PlaceOrderItemBuilder b)]) = _$PlaceOrderItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PlaceOrderItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PlaceOrderItem> get serializer => _$PlaceOrderItemSerializer();
}

class _$PlaceOrderItemSerializer implements PrimitiveSerializer<PlaceOrderItem> {
  @override
  final Iterable<Type> types = const [PlaceOrderItem, _$PlaceOrderItem];

  @override
  final String wireName = r'PlaceOrderItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PlaceOrderItem object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'productId';
    yield serializers.serialize(
      object.productId,
      specifiedType: const FullType(String),
    );
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
    if (object.designId != null) {
      yield r'designId';
      yield serializers.serialize(
        object.designId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.configurationId != null) {
      yield r'configurationId';
      yield serializers.serialize(
        object.configurationId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.configurationRevision != null) {
      yield r'configurationRevision';
      yield serializers.serialize(
        object.configurationRevision,
        specifiedType: const FullType.nullable(int),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PlaceOrderItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PlaceOrderItemBuilder result,
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
        case r'designId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.designId = valueDes;
          break;
        case r'configurationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.configurationId = valueDes;
          break;
        case r'configurationRevision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.configurationRevision = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PlaceOrderItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PlaceOrderItemBuilder();
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
