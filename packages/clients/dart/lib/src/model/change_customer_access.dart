//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'change_customer_access.g.dart';

/// ChangeCustomerAccess
///
/// Properties:
/// * [status]
/// * [expectedVersion]
@BuiltValue()
abstract class ChangeCustomerAccess implements Built<ChangeCustomerAccess, ChangeCustomerAccessBuilder> {
  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'expectedVersion')
  String get expectedVersion;

  ChangeCustomerAccess._();

  factory ChangeCustomerAccess([void updates(ChangeCustomerAccessBuilder b)]) = _$ChangeCustomerAccess;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ChangeCustomerAccessBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ChangeCustomerAccess> get serializer => _$ChangeCustomerAccessSerializer();
}

class _$ChangeCustomerAccessSerializer implements PrimitiveSerializer<ChangeCustomerAccess> {
  @override
  final Iterable<Type> types = const [ChangeCustomerAccess, _$ChangeCustomerAccess];

  @override
  final String wireName = r'ChangeCustomerAccess';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ChangeCustomerAccess object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ChangeCustomerAccess object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ChangeCustomerAccessBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
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
  ChangeCustomerAccess deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ChangeCustomerAccessBuilder();
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
