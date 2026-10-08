//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'save_customer_address.g.dart';

/// SaveCustomerAddress
///
/// Properties:
/// * [title]
/// * [fullName]
/// * [phone]
/// * [city]
/// * [district]
/// * [line]
/// * [postalCode]
/// * [isDefault]
@BuiltValue()
abstract class SaveCustomerAddress implements Built<SaveCustomerAddress, SaveCustomerAddressBuilder> {
  @BuiltValueField(wireName: r'title')
  String get title;

  @BuiltValueField(wireName: r'fullName')
  String get fullName;

  @BuiltValueField(wireName: r'phone')
  String get phone;

  @BuiltValueField(wireName: r'city')
  String get city;

  @BuiltValueField(wireName: r'district')
  String get district;

  @BuiltValueField(wireName: r'line')
  String get line;

  @BuiltValueField(wireName: r'postalCode')
  String? get postalCode;

  @BuiltValueField(wireName: r'isDefault')
  bool get isDefault;

  SaveCustomerAddress._();

  factory SaveCustomerAddress([void updates(SaveCustomerAddressBuilder b)]) = _$SaveCustomerAddress;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SaveCustomerAddressBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SaveCustomerAddress> get serializer => _$SaveCustomerAddressSerializer();
}

class _$SaveCustomerAddressSerializer implements PrimitiveSerializer<SaveCustomerAddress> {
  @override
  final Iterable<Type> types = const [SaveCustomerAddress, _$SaveCustomerAddress];

  @override
  final String wireName = r'SaveCustomerAddress';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SaveCustomerAddress object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'title';
    yield serializers.serialize(
      object.title,
      specifiedType: const FullType(String),
    );
    yield r'fullName';
    yield serializers.serialize(
      object.fullName,
      specifiedType: const FullType(String),
    );
    yield r'phone';
    yield serializers.serialize(
      object.phone,
      specifiedType: const FullType(String),
    );
    yield r'city';
    yield serializers.serialize(
      object.city,
      specifiedType: const FullType(String),
    );
    yield r'district';
    yield serializers.serialize(
      object.district,
      specifiedType: const FullType(String),
    );
    yield r'line';
    yield serializers.serialize(
      object.line,
      specifiedType: const FullType(String),
    );
    yield r'postalCode';
    yield object.postalCode == null ? null : serializers.serialize(
      object.postalCode,
      specifiedType: const FullType.nullable(String),
    );
    yield r'isDefault';
    yield serializers.serialize(
      object.isDefault,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SaveCustomerAddress object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SaveCustomerAddressBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'title':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.title = valueDes;
          break;
        case r'fullName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fullName = valueDes;
          break;
        case r'phone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.phone = valueDes;
          break;
        case r'city':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.city = valueDes;
          break;
        case r'district':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.district = valueDes;
          break;
        case r'line':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.line = valueDes;
          break;
        case r'postalCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.postalCode = valueDes;
          break;
        case r'isDefault':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.isDefault = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SaveCustomerAddress deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SaveCustomerAddressBuilder();
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
