//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_admin_invitation.g.dart';

/// CreateAdminInvitation
///
/// Properties:
/// * [email]
@BuiltValue()
abstract class CreateAdminInvitation implements Built<CreateAdminInvitation, CreateAdminInvitationBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  CreateAdminInvitation._();

  factory CreateAdminInvitation([void updates(CreateAdminInvitationBuilder b)]) = _$CreateAdminInvitation;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateAdminInvitationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateAdminInvitation> get serializer => _$CreateAdminInvitationSerializer();
}

class _$CreateAdminInvitationSerializer implements PrimitiveSerializer<CreateAdminInvitation> {
  @override
  final Iterable<Type> types = const [CreateAdminInvitation, _$CreateAdminInvitation];

  @override
  final String wireName = r'CreateAdminInvitation';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateAdminInvitation object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CreateAdminInvitation object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateAdminInvitationBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreateAdminInvitation deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateAdminInvitationBuilder();
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
