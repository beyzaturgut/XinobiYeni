//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'surface_media.g.dart';

/// SurfaceMedia
///
/// Properties:
/// * [url]
/// * [sha256]
@BuiltValue()
abstract class SurfaceMedia implements Built<SurfaceMedia, SurfaceMediaBuilder> {
  @BuiltValueField(wireName: r'url')
  String get url;

  @BuiltValueField(wireName: r'sha256')
  String get sha256;

  SurfaceMedia._();

  factory SurfaceMedia([void updates(SurfaceMediaBuilder b)]) = _$SurfaceMedia;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SurfaceMediaBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SurfaceMedia> get serializer => _$SurfaceMediaSerializer();
}

class _$SurfaceMediaSerializer implements PrimitiveSerializer<SurfaceMedia> {
  @override
  final Iterable<Type> types = const [SurfaceMedia, _$SurfaceMedia];

  @override
  final String wireName = r'SurfaceMedia';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SurfaceMedia object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'url';
    yield serializers.serialize(
      object.url,
      specifiedType: const FullType(String),
    );
    yield r'sha256';
    yield serializers.serialize(
      object.sha256,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SurfaceMedia object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SurfaceMediaBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'url':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.url = valueDes;
          break;
        case r'sha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sha256 = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SurfaceMedia deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SurfaceMediaBuilder();
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
