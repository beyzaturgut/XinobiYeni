//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/body_placement.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'design_placement.g.dart';

/// DesignPlacement
///
/// Properties:
/// * [sourceWidth]
/// * [sourceHeight]
/// * [surfaceVersion]
/// * [x]
/// * [y]
/// * [scale]
/// * [rotation]
/// * [curvatureStrength]
/// * [bodyAdjustments]
/// * [mode]
/// * [fillMask]
@BuiltValue()
abstract class DesignPlacement implements Built<DesignPlacement, DesignPlacementBuilder> {
  @BuiltValueField(wireName: r'sourceWidth')
  int get sourceWidth;

  @BuiltValueField(wireName: r'sourceHeight')
  int get sourceHeight;

  @BuiltValueField(wireName: r'surfaceVersion')
  String get surfaceVersion;

  @BuiltValueField(wireName: r'x')
  double get x;

  @BuiltValueField(wireName: r'y')
  double get y;

  @BuiltValueField(wireName: r'scale')
  double get scale;

  @BuiltValueField(wireName: r'rotation')
  double get rotation;

  @BuiltValueField(wireName: r'curvatureStrength')
  double get curvatureStrength;

  @BuiltValueField(wireName: r'bodyAdjustments')
  BuiltMap<String, BodyPlacement>? get bodyAdjustments;

  @BuiltValueField(wireName: r'mode')
  String? get mode;

  @BuiltValueField(wireName: r'fillMask')
  bool? get fillMask;

  DesignPlacement._();

  factory DesignPlacement([void updates(DesignPlacementBuilder b)]) = _$DesignPlacement;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DesignPlacementBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DesignPlacement> get serializer => _$DesignPlacementSerializer();
}

class _$DesignPlacementSerializer implements PrimitiveSerializer<DesignPlacement> {
  @override
  final Iterable<Type> types = const [DesignPlacement, _$DesignPlacement];

  @override
  final String wireName = r'DesignPlacement';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DesignPlacement object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'sourceWidth';
    yield serializers.serialize(
      object.sourceWidth,
      specifiedType: const FullType(int),
    );
    yield r'sourceHeight';
    yield serializers.serialize(
      object.sourceHeight,
      specifiedType: const FullType(int),
    );
    yield r'surfaceVersion';
    yield serializers.serialize(
      object.surfaceVersion,
      specifiedType: const FullType(String),
    );
    yield r'x';
    yield serializers.serialize(
      object.x,
      specifiedType: const FullType(double),
    );
    yield r'y';
    yield serializers.serialize(
      object.y,
      specifiedType: const FullType(double),
    );
    yield r'scale';
    yield serializers.serialize(
      object.scale,
      specifiedType: const FullType(double),
    );
    yield r'rotation';
    yield serializers.serialize(
      object.rotation,
      specifiedType: const FullType(double),
    );
    yield r'curvatureStrength';
    yield serializers.serialize(
      object.curvatureStrength,
      specifiedType: const FullType(double),
    );
    if (object.bodyAdjustments != null) {
      yield r'bodyAdjustments';
      yield serializers.serialize(
        object.bodyAdjustments,
        specifiedType: const FullType.nullable(BuiltMap, [FullType(String), FullType(BodyPlacement)]),
      );
    }
    if (object.mode != null) {
      yield r'mode';
      yield serializers.serialize(
        object.mode,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.fillMask != null) {
      yield r'fillMask';
      yield serializers.serialize(
        object.fillMask,
        specifiedType: const FullType.nullable(bool),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    DesignPlacement object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DesignPlacementBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'sourceWidth':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sourceWidth = valueDes;
          break;
        case r'sourceHeight':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sourceHeight = valueDes;
          break;
        case r'surfaceVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.surfaceVersion = valueDes;
          break;
        case r'x':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.x = valueDes;
          break;
        case r'y':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.y = valueDes;
          break;
        case r'scale':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.scale = valueDes;
          break;
        case r'rotation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.rotation = valueDes;
          break;
        case r'curvatureStrength':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.curvatureStrength = valueDes;
          break;
        case r'bodyAdjustments':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BuiltMap, [FullType(String), FullType(BodyPlacement)]),
          ) as BuiltMap<String, BodyPlacement>?;
          if (valueDes == null) continue;
          result.bodyAdjustments.replace(valueDes);
          break;
        case r'mode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.mode = valueDes;
          break;
        case r'fillMask':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(bool),
          ) as bool?;
          if (valueDes == null) continue;
          result.fillMask = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DesignPlacement deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DesignPlacementBuilder();
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
