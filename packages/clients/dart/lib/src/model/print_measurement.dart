//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'print_measurement.g.dart';

/// PrintMeasurement
///
/// Properties:
/// * [centerXmm]
/// * [centerYmm]
/// * [widthMm]
/// * [heightMm]
/// * [dpiX]
/// * [dpiY]
/// * [requiredWidthPx]
/// * [requiredHeightPx]
/// * [fitsSafeArea]
/// * [meetsDpi]
/// * [intersectsExclusion]
/// * [productionReady]
@BuiltValue()
abstract class PrintMeasurement implements Built<PrintMeasurement, PrintMeasurementBuilder> {
  @BuiltValueField(wireName: r'centerXmm')
  double get centerXmm;

  @BuiltValueField(wireName: r'centerYmm')
  double get centerYmm;

  @BuiltValueField(wireName: r'widthMm')
  double get widthMm;

  @BuiltValueField(wireName: r'heightMm')
  double get heightMm;

  @BuiltValueField(wireName: r'dpiX')
  double get dpiX;

  @BuiltValueField(wireName: r'dpiY')
  double get dpiY;

  @BuiltValueField(wireName: r'requiredWidthPx')
  int get requiredWidthPx;

  @BuiltValueField(wireName: r'requiredHeightPx')
  int get requiredHeightPx;

  @BuiltValueField(wireName: r'fitsSafeArea')
  bool get fitsSafeArea;

  @BuiltValueField(wireName: r'meetsDpi')
  bool get meetsDpi;

  @BuiltValueField(wireName: r'intersectsExclusion')
  bool get intersectsExclusion;

  @BuiltValueField(wireName: r'productionReady')
  bool? get productionReady;

  PrintMeasurement._();

  factory PrintMeasurement([void updates(PrintMeasurementBuilder b)]) = _$PrintMeasurement;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PrintMeasurementBuilder b) => b
      ..productionReady = false;

  @BuiltValueSerializer(custom: true)
  static Serializer<PrintMeasurement> get serializer => _$PrintMeasurementSerializer();
}

class _$PrintMeasurementSerializer implements PrimitiveSerializer<PrintMeasurement> {
  @override
  final Iterable<Type> types = const [PrintMeasurement, _$PrintMeasurement];

  @override
  final String wireName = r'PrintMeasurement';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PrintMeasurement object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'centerXmm';
    yield serializers.serialize(
      object.centerXmm,
      specifiedType: const FullType(double),
    );
    yield r'centerYmm';
    yield serializers.serialize(
      object.centerYmm,
      specifiedType: const FullType(double),
    );
    yield r'widthMm';
    yield serializers.serialize(
      object.widthMm,
      specifiedType: const FullType(double),
    );
    yield r'heightMm';
    yield serializers.serialize(
      object.heightMm,
      specifiedType: const FullType(double),
    );
    yield r'dpiX';
    yield serializers.serialize(
      object.dpiX,
      specifiedType: const FullType(double),
    );
    yield r'dpiY';
    yield serializers.serialize(
      object.dpiY,
      specifiedType: const FullType(double),
    );
    yield r'requiredWidthPx';
    yield serializers.serialize(
      object.requiredWidthPx,
      specifiedType: const FullType(int),
    );
    yield r'requiredHeightPx';
    yield serializers.serialize(
      object.requiredHeightPx,
      specifiedType: const FullType(int),
    );
    yield r'fitsSafeArea';
    yield serializers.serialize(
      object.fitsSafeArea,
      specifiedType: const FullType(bool),
    );
    yield r'meetsDpi';
    yield serializers.serialize(
      object.meetsDpi,
      specifiedType: const FullType(bool),
    );
    yield r'intersectsExclusion';
    yield serializers.serialize(
      object.intersectsExclusion,
      specifiedType: const FullType(bool),
    );
    if (object.productionReady != null) {
      yield r'productionReady';
      yield serializers.serialize(
        object.productionReady,
        specifiedType: const FullType(bool),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PrintMeasurement object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PrintMeasurementBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'centerXmm':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.centerXmm = valueDes;
          break;
        case r'centerYmm':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.centerYmm = valueDes;
          break;
        case r'widthMm':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.widthMm = valueDes;
          break;
        case r'heightMm':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.heightMm = valueDes;
          break;
        case r'dpiX':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.dpiX = valueDes;
          break;
        case r'dpiY':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.dpiY = valueDes;
          break;
        case r'requiredWidthPx':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.requiredWidthPx = valueDes;
          break;
        case r'requiredHeightPx':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.requiredHeightPx = valueDes;
          break;
        case r'fitsSafeArea':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.fitsSafeArea = valueDes;
          break;
        case r'meetsDpi':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.meetsDpi = valueDes;
          break;
        case r'intersectsExclusion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.intersectsExclusion = valueDes;
          break;
        case r'productionReady':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(bool),
          ) as bool?;
          if (valueDes == null) continue;
          result.productionReady = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PrintMeasurement deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PrintMeasurementBuilder();
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
