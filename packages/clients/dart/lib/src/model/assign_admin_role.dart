//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assign_admin_role.g.dart';

/// AssignAdminRole
///
/// Properties:
/// * [email]
/// * [role]
@BuiltValue()
abstract class AssignAdminRole implements Built<AssignAdminRole, AssignAdminRoleBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'role')
  String get role;

  AssignAdminRole._();

  factory AssignAdminRole([void updates(AssignAdminRoleBuilder b)]) = _$AssignAdminRole;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssignAdminRoleBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssignAdminRole> get serializer => _$AssignAdminRoleSerializer();
}

class _$AssignAdminRoleSerializer implements PrimitiveSerializer<AssignAdminRole> {
  @override
  final Iterable<Type> types = const [AssignAdminRole, _$AssignAdminRole];

  @override
  final String wireName = r'AssignAdminRole';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssignAdminRole object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AssignAdminRole object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssignAdminRoleBuilder result,
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
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.role = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssignAdminRole deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssignAdminRoleBuilder();
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
