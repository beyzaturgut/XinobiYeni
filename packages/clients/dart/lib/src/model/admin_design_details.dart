//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'admin_design_details.g.dart';

/// AdminDesignDetails
///
/// Properties:
/// * [id]
/// * [kind]
/// * [productId]
/// * [productName]
/// * [variantId]
/// * [color]
/// * [createdAt]
/// * [mime]
@BuiltValue()
abstract class AdminDesignDetails implements Built<AdminDesignDetails, AdminDesignDetailsBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'kind')
  String get kind;

  @BuiltValueField(wireName: r'productId')
  String get productId;

  @BuiltValueField(wireName: r'productName')
  String get productName;

  @BuiltValueField(wireName: r'variantId')
  String? get variantId;

  @BuiltValueField(wireName: r'color')
  String? get color;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'mime')
  String get mime;

  AdminDesignDetails._();

  factory AdminDesignDetails([void updates(AdminDesignDetailsBuilder b)]) = _$AdminDesignDetails;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdminDesignDetailsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdminDesignDetails> get serializer => _$AdminDesignDetailsSerializer();
}

class _$AdminDesignDetailsSerializer implements PrimitiveSerializer<AdminDesignDetails> {
  @override
  final Iterable<Type> types = const [AdminDesignDetails, _$AdminDesignDetails];

  @override
  final String wireName = r'AdminDesignDetails';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdminDesignDetails object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'kind';
    yield serializers.serialize(
      object.kind,
      specifiedType: const FullType(String),
    );
    yield r'productId';
    yield serializers.serialize(
      object.productId,
      specifiedType: const FullType(String),
    );
    yield r'productName';
    yield serializers.serialize(
      object.productName,
      specifiedType: const FullType(String),
    );
    yield r'variantId';
    yield object.variantId == null ? null : serializers.serialize(
      object.variantId,
      specifiedType: const FullType.nullable(String),
    );
    yield r'color';
    yield object.color == null ? null : serializers.serialize(
      object.color,
      specifiedType: const FullType.nullable(String),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'mime';
    yield serializers.serialize(
      object.mime,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdminDesignDetails object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdminDesignDetailsBuilder result,
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
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.kind = valueDes;
          break;
        case r'productId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productId = valueDes;
          break;
        case r'productName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productName = valueDes;
          break;
        case r'variantId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.variantId = valueDes;
          break;
        case r'color':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.color = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'mime':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.mime = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdminDesignDetails deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdminDesignDetailsBuilder();
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
