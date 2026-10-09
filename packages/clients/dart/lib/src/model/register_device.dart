//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'register_device.g.dart';

/// RegisterDevice
///
/// Properties:
/// * [token]
/// * [platform]
@BuiltValue()
abstract class RegisterDevice implements Built<RegisterDevice, RegisterDeviceBuilder> {
  @BuiltValueField(wireName: r'token')
  String get token;

  @BuiltValueField(wireName: r'platform')
  String get platform;

  RegisterDevice._();

  factory RegisterDevice([void updates(RegisterDeviceBuilder b)]) = _$RegisterDevice;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RegisterDeviceBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RegisterDevice> get serializer => _$RegisterDeviceSerializer();
}

class _$RegisterDeviceSerializer implements PrimitiveSerializer<RegisterDevice> {
  @override
  final Iterable<Type> types = const [RegisterDevice, _$RegisterDevice];

  @override
  final String wireName = r'RegisterDevice';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RegisterDevice object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'token';
    yield serializers.serialize(
      object.token,
      specifiedType: const FullType(String),
    );
    yield r'platform';
    yield serializers.serialize(
      object.platform,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RegisterDevice object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RegisterDeviceBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'token':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.token = valueDes;
          break;
        case r'platform':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.platform = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RegisterDevice deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RegisterDeviceBuilder();
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
