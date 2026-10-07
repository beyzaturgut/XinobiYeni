//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/account_profile.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'admin_session.g.dart';

/// AdminSession
///
/// Properties:
/// * [account]
/// * [roles]
/// * [permissions]
@BuiltValue()
abstract class AdminSession implements Built<AdminSession, AdminSessionBuilder> {
  @BuiltValueField(wireName: r'account')
  AccountProfile get account;

  @BuiltValueField(wireName: r'roles')
  BuiltList<String> get roles;

  @BuiltValueField(wireName: r'permissions')
  BuiltList<String> get permissions;

  AdminSession._();

  factory AdminSession([void updates(AdminSessionBuilder b)]) = _$AdminSession;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdminSessionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdminSession> get serializer => _$AdminSessionSerializer();
}

class _$AdminSessionSerializer implements PrimitiveSerializer<AdminSession> {
  @override
  final Iterable<Type> types = const [AdminSession, _$AdminSession];

  @override
  final String wireName = r'AdminSession';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdminSession object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'account';
    yield serializers.serialize(
      object.account,
      specifiedType: const FullType(AccountProfile),
    );
    yield r'roles';
    yield serializers.serialize(
      object.roles,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'permissions';
    yield serializers.serialize(
      object.permissions,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdminSession object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdminSessionBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'account':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(AccountProfile),
          ) as AccountProfile;
          result.account.replace(valueDes);
          break;
        case r'roles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.roles.replace(valueDes);
          break;
        case r'permissions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.permissions.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdminSession deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdminSessionBuilder();
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
