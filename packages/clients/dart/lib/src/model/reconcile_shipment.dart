//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'reconcile_shipment.g.dart';

/// ReconcileShipment
///
/// Properties:
/// * [evidence]
/// * [resolution]
@BuiltValue()
abstract class ReconcileShipment implements Built<ReconcileShipment, ReconcileShipmentBuilder> {
  @BuiltValueField(wireName: r'evidence')
  String get evidence;

  @BuiltValueField(wireName: r'resolution')
  String? get resolution;

  ReconcileShipment._();

  factory ReconcileShipment([void updates(ReconcileShipmentBuilder b)]) = _$ReconcileShipment;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReconcileShipmentBuilder b) => b
      ..resolution = 'registered';

  @BuiltValueSerializer(custom: true)
  static Serializer<ReconcileShipment> get serializer => _$ReconcileShipmentSerializer();
}

class _$ReconcileShipmentSerializer implements PrimitiveSerializer<ReconcileShipment> {
  @override
  final Iterable<Type> types = const [ReconcileShipment, _$ReconcileShipment];

  @override
  final String wireName = r'ReconcileShipment';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReconcileShipment object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'evidence';
    yield serializers.serialize(
      object.evidence,
      specifiedType: const FullType(String),
    );
    if (object.resolution != null) {
      yield r'resolution';
      yield serializers.serialize(
        object.resolution,
        specifiedType: const FullType(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    ReconcileShipment object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReconcileShipmentBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'evidence':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.evidence = valueDes;
          break;
        case r'resolution':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.resolution = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReconcileShipment deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReconcileShipmentBuilder();
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
