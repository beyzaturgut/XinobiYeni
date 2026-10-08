//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/availability.dart';
import 'package:xinobi_api_client/src/model/money.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'variant_detail.g.dart';

/// VariantDetail
///
/// Properties:
/// * [id]
/// * [sku]
/// * [color]
/// * [hex]
/// * [imageUrl]
/// * [price]
/// * [availability]
/// * [purchasable]
/// * [maxQuantity]
/// * [surfaceMaskUrl]
@BuiltValue()
abstract class VariantDetail implements Built<VariantDetail, VariantDetailBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'sku')
  String get sku;

  @BuiltValueField(wireName: r'color')
  String get color;

  @BuiltValueField(wireName: r'hex')
  String? get hex;

  @BuiltValueField(wireName: r'imageUrl')
  String? get imageUrl;

  @BuiltValueField(wireName: r'price')
  Money? get price;

  @BuiltValueField(wireName: r'availability')
  Availability get availability;

  @BuiltValueField(wireName: r'purchasable')
  bool get purchasable;

  @BuiltValueField(wireName: r'maxQuantity')
  int get maxQuantity;

  @BuiltValueField(wireName: r'surfaceMaskUrl')
  String? get surfaceMaskUrl;

  VariantDetail._();

  factory VariantDetail([void updates(VariantDetailBuilder b)]) = _$VariantDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(VariantDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<VariantDetail> get serializer => _$VariantDetailSerializer();
}

class _$VariantDetailSerializer implements PrimitiveSerializer<VariantDetail> {
  @override
  final Iterable<Type> types = const [VariantDetail, _$VariantDetail];

  @override
  final String wireName = r'VariantDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    VariantDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'sku';
    yield serializers.serialize(
      object.sku,
      specifiedType: const FullType(String),
    );
    yield r'color';
    yield serializers.serialize(
      object.color,
      specifiedType: const FullType(String),
    );
    yield r'hex';
    yield object.hex == null ? null : serializers.serialize(
      object.hex,
      specifiedType: const FullType.nullable(String),
    );
    yield r'imageUrl';
    yield object.imageUrl == null ? null : serializers.serialize(
      object.imageUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'price';
    yield object.price == null ? null : serializers.serialize(
      object.price,
      specifiedType: const FullType.nullable(Money),
    );
    yield r'availability';
    yield serializers.serialize(
      object.availability,
      specifiedType: const FullType(Availability),
    );
    yield r'purchasable';
    yield serializers.serialize(
      object.purchasable,
      specifiedType: const FullType(bool),
    );
    yield r'maxQuantity';
    yield serializers.serialize(
      object.maxQuantity,
      specifiedType: const FullType(int),
    );
    if (object.surfaceMaskUrl != null) {
      yield r'surfaceMaskUrl';
      yield serializers.serialize(
        object.surfaceMaskUrl,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    VariantDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required VariantDetailBuilder result,
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
        case r'sku':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sku = valueDes;
          break;
        case r'color':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.color = valueDes;
          break;
        case r'hex':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.hex = valueDes;
          break;
        case r'imageUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.imageUrl = valueDes;
          break;
        case r'price':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Money),
          ) as Money?;
          if (valueDes == null) continue;
          result.price.replace(valueDes);
          break;
        case r'availability':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(Availability),
          ) as Availability;
          result.availability.replace(valueDes);
          break;
        case r'purchasable':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.purchasable = valueDes;
          break;
        case r'maxQuantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.maxQuantity = valueDes;
          break;
        case r'surfaceMaskUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.surfaceMaskUrl = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  VariantDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = VariantDetailBuilder();
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
