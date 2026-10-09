//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/money.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assistant_product.g.dart';

/// AssistantProduct
///
/// Properties:
/// * [id]
/// * [name]
/// * [category]
/// * [imageUrl]
/// * [priceFrom]
/// * [inStock]
/// * [personalizable]
@BuiltValue()
abstract class AssistantProduct implements Built<AssistantProduct, AssistantProductBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'category')
  String get category;

  @BuiltValueField(wireName: r'imageUrl')
  String? get imageUrl;

  @BuiltValueField(wireName: r'priceFrom')
  Money? get priceFrom;

  @BuiltValueField(wireName: r'inStock')
  bool get inStock;

  @BuiltValueField(wireName: r'personalizable')
  bool get personalizable;

  AssistantProduct._();

  factory AssistantProduct([void updates(AssistantProductBuilder b)]) = _$AssistantProduct;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssistantProductBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssistantProduct> get serializer => _$AssistantProductSerializer();
}

class _$AssistantProductSerializer implements PrimitiveSerializer<AssistantProduct> {
  @override
  final Iterable<Type> types = const [AssistantProduct, _$AssistantProduct];

  @override
  final String wireName = r'AssistantProduct';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssistantProduct object, {
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
    yield r'imageUrl';
    yield object.imageUrl == null ? null : serializers.serialize(
      object.imageUrl,
      specifiedType: const FullType.nullable(String),
    );
    yield r'priceFrom';
    yield object.priceFrom == null ? null : serializers.serialize(
      object.priceFrom,
      specifiedType: const FullType.nullable(Money),
    );
    yield r'inStock';
    yield serializers.serialize(
      object.inStock,
      specifiedType: const FullType(bool),
    );
    yield r'personalizable';
    yield serializers.serialize(
      object.personalizable,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssistantProduct object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssistantProductBuilder result,
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
        case r'imageUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.imageUrl = valueDes;
          break;
        case r'priceFrom':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(Money),
          ) as Money?;
          if (valueDes == null) continue;
          result.priceFrom.replace(valueDes);
          break;
        case r'inStock':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.inStock = valueDes;
          break;
        case r'personalizable':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.personalizable = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssistantProduct deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssistantProductBuilder();
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
