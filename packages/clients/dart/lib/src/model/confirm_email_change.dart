//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'confirm_email_change.g.dart';

/// ConfirmEmailChange
///
/// Properties:
/// * [newEmail]
/// * [verificationId]
/// * [verificationCode]
/// * [currentPassword]
@BuiltValue()
abstract class ConfirmEmailChange implements Built<ConfirmEmailChange, ConfirmEmailChangeBuilder> {
  @BuiltValueField(wireName: r'newEmail')
  String get newEmail;

  @BuiltValueField(wireName: r'verificationId')
  String get verificationId;

  @BuiltValueField(wireName: r'verificationCode')
  String get verificationCode;

  @BuiltValueField(wireName: r'currentPassword')
  String get currentPassword;

  ConfirmEmailChange._();

  factory ConfirmEmailChange([void updates(ConfirmEmailChangeBuilder b)]) = _$ConfirmEmailChange;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ConfirmEmailChangeBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ConfirmEmailChange> get serializer => _$ConfirmEmailChangeSerializer();
}

class _$ConfirmEmailChangeSerializer implements PrimitiveSerializer<ConfirmEmailChange> {
  @override
  final Iterable<Type> types = const [ConfirmEmailChange, _$ConfirmEmailChange];

  @override
  final String wireName = r'ConfirmEmailChange';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ConfirmEmailChange object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'newEmail';
    yield serializers.serialize(
      object.newEmail,
      specifiedType: const FullType(String),
    );
    yield r'verificationId';
    yield serializers.serialize(
      object.verificationId,
      specifiedType: const FullType(String),
    );
    yield r'verificationCode';
    yield serializers.serialize(
      object.verificationCode,
      specifiedType: const FullType(String),
    );
    yield r'currentPassword';
    yield serializers.serialize(
      object.currentPassword,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ConfirmEmailChange object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ConfirmEmailChangeBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'newEmail':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.newEmail = valueDes;
          break;
        case r'verificationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.verificationId = valueDes;
          break;
        case r'verificationCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.verificationCode = valueDes;
          break;
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
  ConfirmEmailChange deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ConfirmEmailChangeBuilder();
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
