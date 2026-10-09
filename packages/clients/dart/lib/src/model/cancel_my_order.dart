//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'cancel_my_order.g.dart';

/// CancelMyOrder
///
/// Properties:
/// * [reason]
/// * [description]
@BuiltValue()
abstract class CancelMyOrder implements Built<CancelMyOrder, CancelMyOrderBuilder> {
  @BuiltValueField(wireName: r'reason')
  String get reason;

  @BuiltValueField(wireName: r'description')
  String? get description;

  CancelMyOrder._();

  factory CancelMyOrder([void updates(CancelMyOrderBuilder b)]) = _$CancelMyOrder;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CancelMyOrderBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CancelMyOrder> get serializer => _$CancelMyOrderSerializer();
}

class _$CancelMyOrderSerializer implements PrimitiveSerializer<CancelMyOrder> {
  @override
  final Iterable<Type> types = const [CancelMyOrder, _$CancelMyOrder];

  @override
  final String wireName = r'CancelMyOrder';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CancelMyOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reason';
    yield serializers.serialize(
      object.reason,
      specifiedType: const FullType(String),
    );
    yield r'description';
    yield object.description == null ? null : serializers.serialize(
      object.description,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CancelMyOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CancelMyOrderBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reason':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reason = valueDes;
          break;
        case r'description':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.description = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CancelMyOrder deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CancelMyOrderBuilder();
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
