//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_personalization.g.dart';

/// OrderPersonalization
///
/// Properties:
/// * [designId]
/// * [kind]
/// * [name]
/// * [mime]
/// * [imageUrl]
@BuiltValue()
abstract class OrderPersonalization implements Built<OrderPersonalization, OrderPersonalizationBuilder> {
  @BuiltValueField(wireName: r'designId')
  String get designId;

  @BuiltValueField(wireName: r'kind')
  String get kind;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'mime')
  String get mime;

  @BuiltValueField(wireName: r'imageUrl')
  String? get imageUrl;

  OrderPersonalization._();

  factory OrderPersonalization([void updates(OrderPersonalizationBuilder b)]) = _$OrderPersonalization;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderPersonalizationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderPersonalization> get serializer => _$OrderPersonalizationSerializer();
}

class _$OrderPersonalizationSerializer implements PrimitiveSerializer<OrderPersonalization> {
  @override
  final Iterable<Type> types = const [OrderPersonalization, _$OrderPersonalization];

  @override
  final String wireName = r'OrderPersonalization';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderPersonalization object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'designId';
    yield serializers.serialize(
      object.designId,
      specifiedType: const FullType(String),
    );
    yield r'kind';
    yield serializers.serialize(
      object.kind,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'mime';
    yield serializers.serialize(
      object.mime,
      specifiedType: const FullType(String),
    );
    if (object.imageUrl != null) {
      yield r'imageUrl';
      yield serializers.serialize(
        object.imageUrl,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    OrderPersonalization object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderPersonalizationBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'designId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.designId = valueDes;
          break;
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.kind = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'mime':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.mime = valueDes;
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
  OrderPersonalization deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderPersonalizationBuilder();
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
