//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'category_item.g.dart';

/// CategoryItem
///
/// Properties:
/// * [name]
/// * [productCount]
/// * [imageUrl]
@BuiltValue()
abstract class CategoryItem implements Built<CategoryItem, CategoryItemBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'productCount')
  int get productCount;

  @BuiltValueField(wireName: r'imageUrl')
  String? get imageUrl;

  CategoryItem._();

  factory CategoryItem([void updates(CategoryItemBuilder b)]) = _$CategoryItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CategoryItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CategoryItem> get serializer => _$CategoryItemSerializer();
}

class _$CategoryItemSerializer implements PrimitiveSerializer<CategoryItem> {
  @override
  final Iterable<Type> types = const [CategoryItem, _$CategoryItem];

  @override
  final String wireName = r'CategoryItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CategoryItem object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'productCount';
    yield serializers.serialize(
      object.productCount,
      specifiedType: const FullType(int),
    );
    yield r'imageUrl';
    yield object.imageUrl == null ? null : serializers.serialize(
      object.imageUrl,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CategoryItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CategoryItemBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'productCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.productCount = valueDes;
          break;
        case r'imageUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.imageUrl = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CategoryItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CategoryItemBuilder();
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
