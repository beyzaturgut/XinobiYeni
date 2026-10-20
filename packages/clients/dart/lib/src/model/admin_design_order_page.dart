//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/admin_design_order_reference.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'admin_design_order_page.g.dart';

/// AdminDesignOrderPage
///
/// Properties:
/// * [items]
/// * [page]
/// * [pageSize]
/// * [total]
/// * [totalPages]
@BuiltValue()
abstract class AdminDesignOrderPage implements Built<AdminDesignOrderPage, AdminDesignOrderPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<AdminDesignOrderReference> get items;

  @BuiltValueField(wireName: r'page')
  int get page;

  @BuiltValueField(wireName: r'pageSize')
  int get pageSize;

  @BuiltValueField(wireName: r'total')
  int get total;

  @BuiltValueField(wireName: r'totalPages')
  int get totalPages;

  AdminDesignOrderPage._();

  factory AdminDesignOrderPage([void updates(AdminDesignOrderPageBuilder b)]) = _$AdminDesignOrderPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdminDesignOrderPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdminDesignOrderPage> get serializer => _$AdminDesignOrderPageSerializer();
}

class _$AdminDesignOrderPageSerializer implements PrimitiveSerializer<AdminDesignOrderPage> {
  @override
  final Iterable<Type> types = const [AdminDesignOrderPage, _$AdminDesignOrderPage];

  @override
  final String wireName = r'AdminDesignOrderPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdminDesignOrderPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(AdminDesignOrderReference)]),
    );
    yield r'page';
    yield serializers.serialize(
      object.page,
      specifiedType: const FullType(int),
    );
    yield r'pageSize';
    yield serializers.serialize(
      object.pageSize,
      specifiedType: const FullType(int),
    );
    yield r'total';
    yield serializers.serialize(
      object.total,
      specifiedType: const FullType(int),
    );
    yield r'totalPages';
    yield serializers.serialize(
      object.totalPages,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdminDesignOrderPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdminDesignOrderPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(AdminDesignOrderReference)]),
          ) as BuiltList<AdminDesignOrderReference>;
          result.items.replace(valueDes);
          break;
        case r'page':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.page = valueDes;
          break;
        case r'pageSize':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pageSize = valueDes;
          break;
        case r'total':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.total = valueDes;
          break;
        case r'totalPages':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.totalPages = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdminDesignOrderPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdminDesignOrderPageBuilder();
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
