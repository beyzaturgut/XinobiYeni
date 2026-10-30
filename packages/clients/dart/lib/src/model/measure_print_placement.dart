//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'measure_print_placement.g.dart';

/// MeasurePrintPlacement
///
/// Properties:
/// * [sourceWidth]
/// * [sourceHeight]
/// * [surfaceVersion]
/// * [x]
/// * [y]
/// * [artworkWidthPx]
/// * [artworkHeightPx]
/// * [rotation]
/// * [artworkPixelWidth]
/// * [artworkPixelHeight]
@BuiltValue()
abstract class MeasurePrintPlacement implements Built<MeasurePrintPlacement, MeasurePrintPlacementBuilder> {
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

  @BuiltValueField(wireName: r'artworkWidthPx')
  double get artworkWidthPx;

  @BuiltValueField(wireName: r'artworkHeightPx')
  double get artworkHeightPx;

  @BuiltValueField(wireName: r'rotation')
  double get rotation;

  @BuiltValueField(wireName: r'artworkPixelWidth')
  int get artworkPixelWidth;

  @BuiltValueField(wireName: r'artworkPixelHeight')
  int get artworkPixelHeight;

  MeasurePrintPlacement._();

  factory MeasurePrintPlacement([void updates(MeasurePrintPlacementBuilder b)]) = _$MeasurePrintPlacement;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MeasurePrintPlacementBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MeasurePrintPlacement> get serializer => _$MeasurePrintPlacementSerializer();
}

class _$MeasurePrintPlacementSerializer implements PrimitiveSerializer<MeasurePrintPlacement> {
  @override
  final Iterable<Type> types = const [MeasurePrintPlacement, _$MeasurePrintPlacement];

  @override
  final String wireName = r'MeasurePrintPlacement';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MeasurePrintPlacement object, {
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
    yield r'artworkWidthPx';
    yield serializers.serialize(
      object.artworkWidthPx,
      specifiedType: const FullType(double),
    );
    yield r'artworkHeightPx';
    yield serializers.serialize(
      object.artworkHeightPx,
      specifiedType: const FullType(double),
    );
    yield r'rotation';
    yield serializers.serialize(
      object.rotation,
      specifiedType: const FullType(double),
    );
    yield r'artworkPixelWidth';
    yield serializers.serialize(
      object.artworkPixelWidth,
      specifiedType: const FullType(int),
    );
    yield r'artworkPixelHeight';
    yield serializers.serialize(
      object.artworkPixelHeight,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MeasurePrintPlacement object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MeasurePrintPlacementBuilder result,
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
        case r'artworkWidthPx':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.artworkWidthPx = valueDes;
          break;
        case r'artworkHeightPx':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.artworkHeightPx = valueDes;
          break;
        case r'rotation':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.rotation = valueDes;
          break;
        case r'artworkPixelWidth':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.artworkPixelWidth = valueDes;
          break;
        case r'artworkPixelHeight':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.artworkPixelHeight = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MeasurePrintPlacement deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MeasurePrintPlacementBuilder();
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
