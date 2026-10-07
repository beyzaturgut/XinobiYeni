//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/category_item.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'category_list.g.dart';

/// CategoryList
///
/// Properties:
/// * [items]
@BuiltValue()
abstract class CategoryList implements Built<CategoryList, CategoryListBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<CategoryItem> get items;

  CategoryList._();

  factory CategoryList([void updates(CategoryListBuilder b)]) = _$CategoryList;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CategoryListBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CategoryList> get serializer => _$CategoryListSerializer();
}

class _$CategoryListSerializer implements PrimitiveSerializer<CategoryList> {
  @override
  final Iterable<Type> types = const [CategoryList, _$CategoryList];

  @override
  final String wireName = r'CategoryList';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CategoryList object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(CategoryItem)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CategoryList object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CategoryListBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(CategoryItem)]),
          ) as BuiltList<CategoryItem>;
          result.items.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CategoryList deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CategoryListBuilder();
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
