//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'body_placement.g.dart';

/// BodyPlacement
///
/// Properties:
/// * [x]
/// * [y]
/// * [scale]
/// * [rotation]
@BuiltValue()
abstract class BodyPlacement implements Built<BodyPlacement, BodyPlacementBuilder> {
  @BuiltValueField(wireName: r'x')
  double? get x;

  @BuiltValueField(wireName: r'y')
  double? get y;

  @BuiltValueField(wireName: r'scale')
  double? get scale;

  @BuiltValueField(wireName: r'rotation')
  double? get rotation;

  BodyPlacement._();

  factory BodyPlacement([void updates(BodyPlacementBuilder b)]) = _$BodyPlacement;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(BodyPlacementBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<BodyPlacement> get serializer => _$BodyPlacementSerializer();
}

class _$BodyPlacementSerializer implements PrimitiveSerializer<BodyPlacement> {
  @override
  final Iterable<Type> types = const [BodyPlacement, _$BodyPlacement];

  @override
  final String wireName = r'BodyPlacement';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    BodyPlacement object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    if (object.x != null) {
      yield r'x';
      yield serializers.serialize(
        object.x,
        specifiedType: const FullType.nullable(double),
      );
    }
    if (object.y != null) {
      yield r'y';
      yield serializers.serialize(
        object.y,
        specifiedType: const FullType.nullable(double),
      );
    }
    if (object.scale != null) {
      yield r'scale';
      yield serializers.serialize(
        object.scale,
        specifiedType: const FullType.nullable(double),
      );
    }
    if (object.rotation != null) {
      yield r'rotation';
      yield serializers.serialize(
        object.rotation,
        specifiedType: const FullType.nullable(double),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    BodyPlacement object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required BodyPlacementBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'x':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(double),
          ) as double?;
          if (valueDes == null) continue;
          result.x = valueDes;
          break;
        case r'y':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(double),
          ) as double?;
          if (valueDes == null) continue;
          result.y = valueDes;
          break;
        case r'scale':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(double),
          ) as double?;
          if (valueDes == null) continue;
          result.scale = valueDes;
          break;
        case r'rotation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(double),
          ) as double?;
          if (valueDes == null) continue;
          result.rotation = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  BodyPlacement deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = BodyPlacementBuilder();
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
