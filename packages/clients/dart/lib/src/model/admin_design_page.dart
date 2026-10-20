//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/admin_design_row.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'admin_design_page.g.dart';

/// AdminDesignPage
///
/// Properties:
/// * [items]
/// * [page]
/// * [pageSize]
/// * [total]
/// * [totalPages]
@BuiltValue()
abstract class AdminDesignPage implements Built<AdminDesignPage, AdminDesignPageBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<AdminDesignRow> get items;

  @BuiltValueField(wireName: r'page')
  int get page;

  @BuiltValueField(wireName: r'pageSize')
  int get pageSize;

  @BuiltValueField(wireName: r'total')
  int get total;

  @BuiltValueField(wireName: r'totalPages')
  int get totalPages;

  AdminDesignPage._();

  factory AdminDesignPage([void updates(AdminDesignPageBuilder b)]) = _$AdminDesignPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdminDesignPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdminDesignPage> get serializer => _$AdminDesignPageSerializer();
}

class _$AdminDesignPageSerializer implements PrimitiveSerializer<AdminDesignPage> {
  @override
  final Iterable<Type> types = const [AdminDesignPage, _$AdminDesignPage];

  @override
  final String wireName = r'AdminDesignPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdminDesignPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(AdminDesignRow)]),
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
    AdminDesignPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdminDesignPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(AdminDesignRow)]),
          ) as BuiltList<AdminDesignRow>;
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
  AdminDesignPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdminDesignPageBuilder();
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
