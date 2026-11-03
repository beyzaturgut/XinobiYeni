//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_surat_shipment.g.dart';

/// CreateSuratShipment
///
/// Properties:
/// * [parcelCount]
/// * [parcelDesi]
/// * [parcelKg]
/// * [paymentType]
@BuiltValue()
abstract class CreateSuratShipment implements Built<CreateSuratShipment, CreateSuratShipmentBuilder> {
  @BuiltValueField(wireName: r'parcelCount')
  int get parcelCount;

  @BuiltValueField(wireName: r'parcelDesi')
  double get parcelDesi;

  @BuiltValueField(wireName: r'parcelKg')
  double get parcelKg;

  @BuiltValueField(wireName: r'paymentType')
  int get paymentType;

  CreateSuratShipment._();

  factory CreateSuratShipment([void updates(CreateSuratShipmentBuilder b)]) = _$CreateSuratShipment;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateSuratShipmentBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateSuratShipment> get serializer => _$CreateSuratShipmentSerializer();
}

class _$CreateSuratShipmentSerializer implements PrimitiveSerializer<CreateSuratShipment> {
  @override
  final Iterable<Type> types = const [CreateSuratShipment, _$CreateSuratShipment];

  @override
  final String wireName = r'CreateSuratShipment';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateSuratShipment object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'parcelCount';
    yield serializers.serialize(
      object.parcelCount,
      specifiedType: const FullType(int),
    );
    yield r'parcelDesi';
    yield serializers.serialize(
      object.parcelDesi,
      specifiedType: const FullType(double),
    );
    yield r'parcelKg';
    yield serializers.serialize(
      object.parcelKg,
      specifiedType: const FullType(double),
    );
    yield r'paymentType';
    yield serializers.serialize(
      object.paymentType,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CreateSuratShipment object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateSuratShipmentBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'parcelCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.parcelCount = valueDes;
          break;
        case r'parcelDesi':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.parcelDesi = valueDes;
          break;
        case r'parcelKg':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.parcelKg = valueDes;
          break;
        case r'paymentType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.paymentType = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreateSuratShipment deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateSuratShipmentBuilder();
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
