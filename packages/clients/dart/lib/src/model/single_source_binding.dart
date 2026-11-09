//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'single_source_binding.g.dart';

/// SingleSourceBinding
///
/// Properties:
/// * [productId]
/// * [profileRevision]
/// * [sourceRevision]
/// * [surfaceId]
/// * [productSourceSha256]
/// * [maskSha256]
/// * [width]
/// * [height]
/// * [fulfillmentVariantId]
@BuiltValue()
abstract class SingleSourceBinding implements Built<SingleSourceBinding, SingleSourceBindingBuilder> {
  @BuiltValueField(wireName: r'productId')
  String get productId;

  @BuiltValueField(wireName: r'profileRevision')
  int get profileRevision;

  @BuiltValueField(wireName: r'sourceRevision')
  int get sourceRevision;

  @BuiltValueField(wireName: r'surfaceId')
  String get surfaceId;

  @BuiltValueField(wireName: r'productSourceSha256')
  String get productSourceSha256;

  @BuiltValueField(wireName: r'maskSha256')
  String get maskSha256;

  @BuiltValueField(wireName: r'width')
  int get width;

  @BuiltValueField(wireName: r'height')
  int get height;

  @BuiltValueField(wireName: r'fulfillmentVariantId')
  String get fulfillmentVariantId;

  SingleSourceBinding._();

  factory SingleSourceBinding([void updates(SingleSourceBindingBuilder b)]) = _$SingleSourceBinding;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SingleSourceBindingBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SingleSourceBinding> get serializer => _$SingleSourceBindingSerializer();
}

class _$SingleSourceBindingSerializer implements PrimitiveSerializer<SingleSourceBinding> {
  @override
  final Iterable<Type> types = const [SingleSourceBinding, _$SingleSourceBinding];

  @override
  final String wireName = r'SingleSourceBinding';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SingleSourceBinding object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'productId';
    yield serializers.serialize(
      object.productId,
      specifiedType: const FullType(String),
    );
    yield r'profileRevision';
    yield serializers.serialize(
      object.profileRevision,
      specifiedType: const FullType(int),
    );
    yield r'sourceRevision';
    yield serializers.serialize(
      object.sourceRevision,
      specifiedType: const FullType(int),
    );
    yield r'surfaceId';
    yield serializers.serialize(
      object.surfaceId,
      specifiedType: const FullType(String),
    );
    yield r'productSourceSha256';
    yield serializers.serialize(
      object.productSourceSha256,
      specifiedType: const FullType(String),
    );
    yield r'maskSha256';
    yield serializers.serialize(
      object.maskSha256,
      specifiedType: const FullType(String),
    );
    yield r'width';
    yield serializers.serialize(
      object.width,
      specifiedType: const FullType(int),
    );
    yield r'height';
    yield serializers.serialize(
      object.height,
      specifiedType: const FullType(int),
    );
    yield r'fulfillmentVariantId';
    yield serializers.serialize(
      object.fulfillmentVariantId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SingleSourceBinding object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SingleSourceBindingBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'productId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productId = valueDes;
          break;
        case r'profileRevision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.profileRevision = valueDes;
          break;
        case r'sourceRevision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sourceRevision = valueDes;
          break;
        case r'surfaceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.surfaceId = valueDes;
          break;
        case r'productSourceSha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productSourceSha256 = valueDes;
          break;
        case r'maskSha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.maskSha256 = valueDes;
          break;
        case r'width':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.width = valueDes;
          break;
        case r'height':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.height = valueDes;
          break;
        case r'fulfillmentVariantId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fulfillmentVariantId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SingleSourceBinding deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SingleSourceBindingBuilder();
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
