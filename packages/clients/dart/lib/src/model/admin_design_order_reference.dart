//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'admin_design_order_reference.g.dart';

/// AdminDesignOrderReference
///
/// Properties:
/// * [id]
/// * [number]
/// * [createdAt]
@BuiltValue()
abstract class AdminDesignOrderReference implements Built<AdminDesignOrderReference, AdminDesignOrderReferenceBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'number')
  String get number;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  AdminDesignOrderReference._();

  factory AdminDesignOrderReference([void updates(AdminDesignOrderReferenceBuilder b)]) = _$AdminDesignOrderReference;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdminDesignOrderReferenceBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdminDesignOrderReference> get serializer => _$AdminDesignOrderReferenceSerializer();
}

class _$AdminDesignOrderReferenceSerializer implements PrimitiveSerializer<AdminDesignOrderReference> {
  @override
  final Iterable<Type> types = const [AdminDesignOrderReference, _$AdminDesignOrderReference];

  @override
  final String wireName = r'AdminDesignOrderReference';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdminDesignOrderReference object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'number';
    yield serializers.serialize(
      object.number,
      specifiedType: const FullType(String),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdminDesignOrderReference object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdminDesignOrderReferenceBuilder result,
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
        case r'number':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.number = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdminDesignOrderReference deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdminDesignOrderReferenceBuilder();
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
