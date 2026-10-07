//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'category_highlight.g.dart';

/// CategoryHighlight
///
/// Properties:
/// * [category]
/// * [imageUrl]
/// * [imageAlt]
/// * [productCount]
/// * [description]
@BuiltValue()
abstract class CategoryHighlight implements Built<CategoryHighlight, CategoryHighlightBuilder> {
  @BuiltValueField(wireName: r'category')
  String get category;

  @BuiltValueField(wireName: r'imageUrl')
  String? get imageUrl;

  @BuiltValueField(wireName: r'imageAlt')
  String get imageAlt;

  @BuiltValueField(wireName: r'productCount')
  int get productCount;

  @BuiltValueField(wireName: r'description')
  String get description;

  CategoryHighlight._();

  factory CategoryHighlight([void updates(CategoryHighlightBuilder b)]) = _$CategoryHighlight;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CategoryHighlightBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CategoryHighlight> get serializer => _$CategoryHighlightSerializer();
}

class _$CategoryHighlightSerializer implements PrimitiveSerializer<CategoryHighlight> {
  @override
  final Iterable<Type> types = const [CategoryHighlight, _$CategoryHighlight];

  @override
  final String wireName = r'CategoryHighlight';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CategoryHighlight object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'category';
    yield serializers.serialize(
      object.category,
      specifiedType: const FullType(String),
    );
    yield r'imageUrl';
    yield object.imageUrl == null ? null : serializers.serialize(
      object.imageUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'imageAlt';
    yield serializers.serialize(
      object.imageAlt,
      specifiedType: const FullType(String),
    );
    yield r'productCount';
    yield serializers.serialize(
      object.productCount,
      specifiedType: const FullType(int),
    );
    yield r'description';
    yield serializers.serialize(
      object.description,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CategoryHighlight object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CategoryHighlightBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'category':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.category = valueDes;
          break;
        case r'imageUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.imageUrl = valueDes;
          break;
        case r'imageAlt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.imageAlt = valueDes;
          break;
        case r'productCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.productCount = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.description = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CategoryHighlight deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CategoryHighlightBuilder();
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
