//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/surface_media.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'single_source_rendering_inputs.g.dart';

/// SingleSourceRenderingInputs
///
/// Properties:
/// * [surfaceVersion]
/// * [sourceMediaVersion]
/// * [width]
/// * [height]
/// * [source_]
/// * [mask]
/// * [brandingRequired]
/// * [branding]
@BuiltValue()
abstract class SingleSourceRenderingInputs implements Built<SingleSourceRenderingInputs, SingleSourceRenderingInputsBuilder> {
  @BuiltValueField(wireName: r'surfaceVersion')
  String get surfaceVersion;

  @BuiltValueField(wireName: r'sourceMediaVersion')
  String get sourceMediaVersion;

  @BuiltValueField(wireName: r'width')
  int get width;

  @BuiltValueField(wireName: r'height')
  int get height;

  @BuiltValueField(wireName: r'source')
  SurfaceMedia get source_;

  @BuiltValueField(wireName: r'mask')
  SurfaceMedia get mask;

  @BuiltValueField(wireName: r'brandingRequired')
  bool? get brandingRequired;

  @BuiltValueField(wireName: r'branding')
  SurfaceMedia? get branding;

  SingleSourceRenderingInputs._();

  factory SingleSourceRenderingInputs([void updates(SingleSourceRenderingInputsBuilder b)]) = _$SingleSourceRenderingInputs;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SingleSourceRenderingInputsBuilder b) => b
      ..brandingRequired = false;

  @BuiltValueSerializer(custom: true)
  static Serializer<SingleSourceRenderingInputs> get serializer => _$SingleSourceRenderingInputsSerializer();
}

class _$SingleSourceRenderingInputsSerializer implements PrimitiveSerializer<SingleSourceRenderingInputs> {
  @override
  final Iterable<Type> types = const [SingleSourceRenderingInputs, _$SingleSourceRenderingInputs];

  @override
  final String wireName = r'SingleSourceRenderingInputs';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SingleSourceRenderingInputs object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'surfaceVersion';
    yield serializers.serialize(
      object.surfaceVersion,
      specifiedType: const FullType(String),
    );
    yield r'sourceMediaVersion';
    yield serializers.serialize(
      object.sourceMediaVersion,
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
    yield r'source';
    yield serializers.serialize(
      object.source_,
      specifiedType: const FullType(SurfaceMedia),
    );
    yield r'mask';
    yield serializers.serialize(
      object.mask,
      specifiedType: const FullType(SurfaceMedia),
    );
    if (object.brandingRequired != null) {
      yield r'brandingRequired';
      yield serializers.serialize(
        object.brandingRequired,
        specifiedType: const FullType(bool),
      );
    }
    if (object.branding != null) {
      yield r'branding';
      yield serializers.serialize(
        object.branding,
        specifiedType: const FullType.nullable(SurfaceMedia),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    SingleSourceRenderingInputs object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SingleSourceRenderingInputsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'surfaceVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.surfaceVersion = valueDes;
          break;
        case r'sourceMediaVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceMediaVersion = valueDes;
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
        case r'source':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SurfaceMedia),
          ) as SurfaceMedia;
          result.source_.replace(valueDes);
          break;
        case r'mask':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SurfaceMedia),
          ) as SurfaceMedia;
          result.mask.replace(valueDes);
          break;
        case r'brandingRequired':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(bool),
          ) as bool?;
          if (valueDes == null) continue;
          result.brandingRequired = valueDes;
          break;
        case r'branding':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(SurfaceMedia),
          ) as SurfaceMedia?;
          if (valueDes == null) continue;
          result.branding.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SingleSourceRenderingInputs deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SingleSourceRenderingInputsBuilder();
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
