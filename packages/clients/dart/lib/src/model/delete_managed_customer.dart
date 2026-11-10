//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'delete_managed_customer.g.dart';

/// DeleteManagedCustomer
///
/// Properties:
/// * [expectedVersion]
@BuiltValue()
abstract class DeleteManagedCustomer implements Built<DeleteManagedCustomer, DeleteManagedCustomerBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  String get expectedVersion;

  DeleteManagedCustomer._();

  factory DeleteManagedCustomer([void updates(DeleteManagedCustomerBuilder b)]) = _$DeleteManagedCustomer;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DeleteManagedCustomerBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DeleteManagedCustomer> get serializer => _$DeleteManagedCustomerSerializer();
}

class _$DeleteManagedCustomerSerializer implements PrimitiveSerializer<DeleteManagedCustomer> {
  @override
  final Iterable<Type> types = const [DeleteManagedCustomer, _$DeleteManagedCustomer];

  @override
  final String wireName = r'DeleteManagedCustomer';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DeleteManagedCustomer object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DeleteManagedCustomer object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DeleteManagedCustomerBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.expectedVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DeleteManagedCustomer deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DeleteManagedCustomerBuilder();
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
