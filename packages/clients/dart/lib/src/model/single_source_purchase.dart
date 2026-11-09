//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/single_source_binding.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'single_source_purchase.g.dart';

/// SingleSourcePurchase
///
/// Properties:
/// * [status]
/// * [profileRevision]
/// * [variantId]
/// * [sku]
/// * [priceMinor]
/// * [stock]
/// * [binding]
@BuiltValue()
abstract class SingleSourcePurchase implements Built<SingleSourcePurchase, SingleSourcePurchaseBuilder> {
  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'profileRevision')
  int get profileRevision;

  @BuiltValueField(wireName: r'variantId')
  String? get variantId;

  @BuiltValueField(wireName: r'sku')
  String? get sku;

  @BuiltValueField(wireName: r'priceMinor')
  int? get priceMinor;

  @BuiltValueField(wireName: r'stock')
  int? get stock;

  @BuiltValueField(wireName: r'binding')
  SingleSourceBinding? get binding;

  SingleSourcePurchase._();

  factory SingleSourcePurchase([void updates(SingleSourcePurchaseBuilder b)]) = _$SingleSourcePurchase;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SingleSourcePurchaseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SingleSourcePurchase> get serializer => _$SingleSourcePurchaseSerializer();
}

class _$SingleSourcePurchaseSerializer implements PrimitiveSerializer<SingleSourcePurchase> {
  @override
  final Iterable<Type> types = const [SingleSourcePurchase, _$SingleSourcePurchase];

  @override
  final String wireName = r'SingleSourcePurchase';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SingleSourcePurchase object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'profileRevision';
    yield serializers.serialize(
      object.profileRevision,
      specifiedType: const FullType(int),
    );
    yield r'variantId';
    yield object.variantId == null ? null : serializers.serialize(
      object.variantId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'sku';
    yield object.sku == null ? null : serializers.serialize(
      object.sku,
      specifiedType: const FullType.nullable(String),
    );
    yield r'priceMinor';
    yield object.priceMinor == null ? null : serializers.serialize(
      object.priceMinor,
      specifiedType: const FullType.nullable(int),
    );
    yield r'stock';
    yield object.stock == null ? null : serializers.serialize(
      object.stock,
      specifiedType: const FullType.nullable(int),
    );
    yield r'binding';
    yield object.binding == null ? null : serializers.serialize(
      object.binding,
      specifiedType: const FullType.nullable(SingleSourceBinding),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SingleSourcePurchase object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SingleSourcePurchaseBuilder result,
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
        case r'profileRevision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.profileRevision = valueDes;
          break;
        case r'variantId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.variantId = valueDes;
          break;
        case r'sku':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.sku = valueDes;
          break;
        case r'priceMinor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.priceMinor = valueDes;
          break;
        case r'stock':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.stock = valueDes;
          break;
        case r'binding':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(SingleSourceBinding),
          ) as SingleSourceBinding?;
          if (valueDes == null) continue;
          result.binding.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SingleSourcePurchase deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SingleSourcePurchaseBuilder();
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
