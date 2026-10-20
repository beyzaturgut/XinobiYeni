//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/customer_order.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'staff_order.g.dart';

/// StaffOrder
///
/// Properties:
/// * [order]
/// * [accountId]
/// * [customerName]
/// * [customerEmail]
/// * [customerPhone]
@BuiltValue()
abstract class StaffOrder implements Built<StaffOrder, StaffOrderBuilder> {
  @BuiltValueField(wireName: r'order')
  CustomerOrder get order;

  @BuiltValueField(wireName: r'accountId')
  String get accountId;

  @BuiltValueField(wireName: r'customerName')
  String get customerName;

  @BuiltValueField(wireName: r'customerEmail')
  String get customerEmail;

  @BuiltValueField(wireName: r'customerPhone')
  String? get customerPhone;

  StaffOrder._();

  factory StaffOrder([void updates(StaffOrderBuilder b)]) = _$StaffOrder;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(StaffOrderBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<StaffOrder> get serializer => _$StaffOrderSerializer();
}

class _$StaffOrderSerializer implements PrimitiveSerializer<StaffOrder> {
  @override
  final Iterable<Type> types = const [StaffOrder, _$StaffOrder];

  @override
  final String wireName = r'StaffOrder';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    StaffOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'order';
    yield serializers.serialize(
      object.order,
      specifiedType: const FullType(CustomerOrder),
    );
    yield r'accountId';
    yield serializers.serialize(
      object.accountId,
      specifiedType: const FullType(String),
    );
    yield r'customerName';
    yield serializers.serialize(
      object.customerName,
      specifiedType: const FullType(String),
    );
    yield r'customerEmail';
    yield serializers.serialize(
      object.customerEmail,
      specifiedType: const FullType(String),
    );
    yield r'customerPhone';
    yield object.customerPhone == null ? null : serializers.serialize(
      object.customerPhone,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    StaffOrder object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required StaffOrderBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'order':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(CustomerOrder),
          ) as CustomerOrder;
          result.order.replace(valueDes);
          break;
        case r'accountId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.accountId = valueDes;
          break;
        case r'customerName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerName = valueDes;
          break;
        case r'customerEmail':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.customerEmail = valueDes;
          break;
        case r'customerPhone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.customerPhone = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  StaffOrder deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = StaffOrderBuilder();
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
