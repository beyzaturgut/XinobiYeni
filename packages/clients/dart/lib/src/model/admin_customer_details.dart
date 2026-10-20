//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/admin_customer_row.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'admin_customer_details.g.dart';

/// AdminCustomerDetails
///
/// Properties:
/// * [customer]
/// * [addressCount]
/// * [favoriteCount]
@BuiltValue()
abstract class AdminCustomerDetails implements Built<AdminCustomerDetails, AdminCustomerDetailsBuilder> {
  @BuiltValueField(wireName: r'customer')
  AdminCustomerRow get customer;

  @BuiltValueField(wireName: r'addressCount')
  int get addressCount;

  @BuiltValueField(wireName: r'favoriteCount')
  int get favoriteCount;

  AdminCustomerDetails._();

  factory AdminCustomerDetails([void updates(AdminCustomerDetailsBuilder b)]) = _$AdminCustomerDetails;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdminCustomerDetailsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdminCustomerDetails> get serializer => _$AdminCustomerDetailsSerializer();
}

class _$AdminCustomerDetailsSerializer implements PrimitiveSerializer<AdminCustomerDetails> {
  @override
  final Iterable<Type> types = const [AdminCustomerDetails, _$AdminCustomerDetails];

  @override
  final String wireName = r'AdminCustomerDetails';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdminCustomerDetails object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'customer';
    yield serializers.serialize(
      object.customer,
      specifiedType: const FullType(AdminCustomerRow),
    );
    yield r'addressCount';
    yield serializers.serialize(
      object.addressCount,
      specifiedType: const FullType(int),
    );
    yield r'favoriteCount';
    yield serializers.serialize(
      object.favoriteCount,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdminCustomerDetails object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdminCustomerDetailsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'customer':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AdminCustomerRow),
          ) as AdminCustomerRow;
          result.customer.replace(valueDes);
          break;
        case r'addressCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.addressCount = valueDes;
          break;
        case r'favoriteCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.favoriteCount = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdminCustomerDetails deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdminCustomerDetailsBuilder();
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
