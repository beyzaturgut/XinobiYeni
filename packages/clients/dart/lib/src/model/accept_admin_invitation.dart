//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'accept_admin_invitation.g.dart';

/// AcceptAdminInvitation
///
/// Properties:
/// * [token]
/// * [name]
/// * [password]
@BuiltValue()
abstract class AcceptAdminInvitation implements Built<AcceptAdminInvitation, AcceptAdminInvitationBuilder> {
  @BuiltValueField(wireName: r'token')
  String get token;

  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'password')
  String get password;

  AcceptAdminInvitation._();

  factory AcceptAdminInvitation([void updates(AcceptAdminInvitationBuilder b)]) = _$AcceptAdminInvitation;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AcceptAdminInvitationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AcceptAdminInvitation> get serializer => _$AcceptAdminInvitationSerializer();
}

class _$AcceptAdminInvitationSerializer implements PrimitiveSerializer<AcceptAdminInvitation> {
  @override
  final Iterable<Type> types = const [AcceptAdminInvitation, _$AcceptAdminInvitation];

  @override
  final String wireName = r'AcceptAdminInvitation';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AcceptAdminInvitation object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'token';
    yield serializers.serialize(
      object.token,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'password';
    yield serializers.serialize(
      object.password,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AcceptAdminInvitation object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AcceptAdminInvitationBuilder result,
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
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        case r'password':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.password = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AcceptAdminInvitation deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AcceptAdminInvitationBuilder();
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
