//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'xinobi_u_variant.g.dart';

/// XinobiUVariant
///
/// Properties:
/// * [id]
/// * [color]
/// * [hex]
/// * [imageUrl]
@BuiltValue()
abstract class XinobiUVariant implements Built<XinobiUVariant, XinobiUVariantBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'color')
  String get color;

  @BuiltValueField(wireName: r'hex')
  String? get hex;

  @BuiltValueField(wireName: r'imageUrl')
  String? get imageUrl;

  XinobiUVariant._();

  factory XinobiUVariant([void updates(XinobiUVariantBuilder b)]) = _$XinobiUVariant;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(XinobiUVariantBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<XinobiUVariant> get serializer => _$XinobiUVariantSerializer();
}

class _$XinobiUVariantSerializer implements PrimitiveSerializer<XinobiUVariant> {
  @override
  final Iterable<Type> types = const [XinobiUVariant, _$XinobiUVariant];

  @override
  final String wireName = r'XinobiUVariant';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    XinobiUVariant object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'color';
    yield serializers.serialize(
      object.color,
      specifiedType: const FullType(String),
    );
    yield r'hex';
    yield object.hex == null ? null : serializers.serialize(
      object.hex,
      specifiedType: const FullType.nullable(String),
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
    XinobiUVariant object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required XinobiUVariantBuilder result,
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
        case r'color':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.color = valueDes;
          break;
        case r'hex':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.hex = valueDes;
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
  XinobiUVariant deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = XinobiUVariantBuilder();
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
