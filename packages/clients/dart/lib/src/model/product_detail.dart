//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/variant_detail.dart';
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/product_spec.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'product_detail.g.dart';

/// ProductDetail
///
/// Properties:
/// * [id]
/// * [name]
/// * [category]
/// * [description]
/// * [seoTitle]
/// * [imageUrl]
/// * [personalizable]
/// * [variants]
/// * [originalImageUrl]
/// * [gallery]
/// * [specs]
@BuiltValue()
abstract class ProductDetail implements Built<ProductDetail, ProductDetailBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'category')
  String get category;

  @BuiltValueField(wireName: r'description')
  String get description;

  @BuiltValueField(wireName: r'seoTitle')
  String get seoTitle;

  @BuiltValueField(wireName: r'imageUrl')
  String? get imageUrl;

  @BuiltValueField(wireName: r'personalizable')
  bool get personalizable;

  @BuiltValueField(wireName: r'variants')
  BuiltList<VariantDetail> get variants;

  @BuiltValueField(wireName: r'originalImageUrl')
  String? get originalImageUrl;

  @BuiltValueField(wireName: r'gallery')
  BuiltList<String> get gallery;

  @BuiltValueField(wireName: r'specs')
  BuiltList<ProductSpec> get specs;

  ProductDetail._();

  factory ProductDetail([void updates(ProductDetailBuilder b)]) = _$ProductDetail;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ProductDetailBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ProductDetail> get serializer => _$ProductDetailSerializer();
}

class _$ProductDetailSerializer implements PrimitiveSerializer<ProductDetail> {
  @override
  final Iterable<Type> types = const [ProductDetail, _$ProductDetail];

  @override
  final String wireName = r'ProductDetail';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ProductDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'category';
    yield serializers.serialize(
      object.category,
      specifiedType: const FullType(String),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
    yield r'seoTitle';
    yield serializers.serialize(
      object.seoTitle,
      specifiedType: const FullType(String),
    );
    yield r'imageUrl';
    yield object.imageUrl == null ? null : serializers.serialize(
      object.imageUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'personalizable';
    yield serializers.serialize(
      object.personalizable,
      specifiedType: const FullType(bool),
    );
    yield r'variants';
    yield serializers.serialize(
      object.variants,
      specifiedType: const FullType(BuiltList, [FullType(VariantDetail)]),
    );
    yield r'originalImageUrl';
    yield object.originalImageUrl == null ? null : serializers.serialize(
      object.originalImageUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'gallery';
    yield serializers.serialize(
      object.gallery,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'specs';
    yield serializers.serialize(
      object.specs,
      specifiedType: const FullType(BuiltList, [FullType(ProductSpec)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ProductDetail object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ProductDetailBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'category':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.category = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        case r'seoTitle':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.seoTitle = valueDes;
          break;
        case r'imageUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.imageUrl = valueDes;
          break;
        case r'personalizable':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.personalizable = valueDes;
          break;
        case r'variants':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(VariantDetail)]),
          ) as BuiltList<VariantDetail>;
          result.variants.replace(valueDes);
          break;
        case r'originalImageUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.originalImageUrl = valueDes;
          break;
        case r'gallery':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.gallery.replace(valueDes);
          break;
        case r'specs':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ProductSpec)]),
          ) as BuiltList<ProductSpec>;
          result.specs.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ProductDetail deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ProductDetailBuilder();
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
