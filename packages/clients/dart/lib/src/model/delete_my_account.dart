//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'delete_my_account.g.dart';

/// DeleteMyAccount
///
/// Properties:
/// * [currentPassword]
@BuiltValue()
abstract class DeleteMyAccount implements Built<DeleteMyAccount, DeleteMyAccountBuilder> {
  @BuiltValueField(wireName: r'currentPassword')
  String get currentPassword;

  DeleteMyAccount._();

  factory DeleteMyAccount([void updates(DeleteMyAccountBuilder b)]) = _$DeleteMyAccount;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DeleteMyAccountBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DeleteMyAccount> get serializer => _$DeleteMyAccountSerializer();
}

class _$DeleteMyAccountSerializer implements PrimitiveSerializer<DeleteMyAccount> {
  @override
  final Iterable<Type> types = const [DeleteMyAccount, _$DeleteMyAccount];

  @override
  final String wireName = r'DeleteMyAccount';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DeleteMyAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'currentPassword';
    yield serializers.serialize(
      object.currentPassword,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DeleteMyAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DeleteMyAccountBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'currentPassword':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.currentPassword = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DeleteMyAccount deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DeleteMyAccountBuilder();
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
