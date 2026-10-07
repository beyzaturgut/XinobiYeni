//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/category_highlight.dart';
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/product_summary.dart';
import 'package:xinobi_api_client/src/model/home_slide.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'home_content.g.dart';

/// HomeContent
///
/// Properties:
/// * [slides]
/// * [xinobiUBannerUrl]
/// * [featureImageUrl]
/// * [accentColor]
/// * [featuredProducts]
/// * [categories]
@BuiltValue()
abstract class HomeContent implements Built<HomeContent, HomeContentBuilder> {
  @BuiltValueField(wireName: r'slides')
  BuiltList<HomeSlide> get slides;

  @BuiltValueField(wireName: r'xinobiUBannerUrl')
  String? get xinobiUBannerUrl;

  @BuiltValueField(wireName: r'featureImageUrl')
  String? get featureImageUrl;

  @BuiltValueField(wireName: r'accentColor')
  String get accentColor;

  @BuiltValueField(wireName: r'featuredProducts')
  BuiltList<ProductSummary> get featuredProducts;

  @BuiltValueField(wireName: r'categories')
  BuiltList<CategoryHighlight> get categories;

  HomeContent._();

  factory HomeContent([void updates(HomeContentBuilder b)]) = _$HomeContent;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(HomeContentBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<HomeContent> get serializer => _$HomeContentSerializer();
}

class _$HomeContentSerializer implements PrimitiveSerializer<HomeContent> {
  @override
  final Iterable<Type> types = const [HomeContent, _$HomeContent];

  @override
  final String wireName = r'HomeContent';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    HomeContent object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'slides';
    yield serializers.serialize(
      object.slides,
      specifiedType: const FullType(BuiltList, [FullType(HomeSlide)]),
    );
    yield r'xinobiUBannerUrl';
    yield object.xinobiUBannerUrl == null ? null : serializers.serialize(
      object.xinobiUBannerUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'featureImageUrl';
    yield object.featureImageUrl == null ? null : serializers.serialize(
      object.featureImageUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'accentColor';
    yield serializers.serialize(
      object.accentColor,
      specifiedType: const FullType(String),
    );
    yield r'featuredProducts';
    yield serializers.serialize(
      object.featuredProducts,
      specifiedType: const FullType(BuiltList, [FullType(ProductSummary)]),
    );
    yield r'categories';
    yield serializers.serialize(
      object.categories,
      specifiedType: const FullType(BuiltList, [FullType(CategoryHighlight)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    HomeContent object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required HomeContentBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'slides':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(HomeSlide)]),
          ) as BuiltList<HomeSlide>;
          result.slides.replace(valueDes);
          break;
        case r'xinobiUBannerUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.xinobiUBannerUrl = valueDes;
          break;
        case r'featureImageUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.featureImageUrl = valueDes;
          break;
        case r'accentColor':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.accentColor = valueDes;
          break;
        case r'featuredProducts':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ProductSummary)]),
          ) as BuiltList<ProductSummary>;
          result.featuredProducts.replace(valueDes);
          break;
        case r'categories':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CategoryHighlight)]),
          ) as BuiltList<CategoryHighlight>;
          result.categories.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  HomeContent deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = HomeContentBuilder();
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
