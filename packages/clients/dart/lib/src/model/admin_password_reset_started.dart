//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'admin_password_reset_started.g.dart';

/// AdminPasswordResetStarted
///
/// Properties:
/// * [message]
/// * [previewUrl]
@BuiltValue()
abstract class AdminPasswordResetStarted implements Built<AdminPasswordResetStarted, AdminPasswordResetStartedBuilder> {
  @BuiltValueField(wireName: r'message')
  String get message;

  @BuiltValueField(wireName: r'previewUrl')
  String? get previewUrl;

  AdminPasswordResetStarted._();

  factory AdminPasswordResetStarted([void updates(AdminPasswordResetStartedBuilder b)]) = _$AdminPasswordResetStarted;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdminPasswordResetStartedBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdminPasswordResetStarted> get serializer => _$AdminPasswordResetStartedSerializer();
}

class _$AdminPasswordResetStartedSerializer implements PrimitiveSerializer<AdminPasswordResetStarted> {
  @override
  final Iterable<Type> types = const [AdminPasswordResetStarted, _$AdminPasswordResetStarted];

  @override
  final String wireName = r'AdminPasswordResetStarted';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdminPasswordResetStarted object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'message';
    yield serializers.serialize(
      object.message,
      specifiedType: const FullType(String),
    );
    if (object.previewUrl != null) {
      yield r'previewUrl';
      yield serializers.serialize(
        object.previewUrl,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    AdminPasswordResetStarted object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdminPasswordResetStartedBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'message':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.message = valueDes;
          break;
        case r'previewUrl':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.previewUrl = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdminPasswordResetStarted deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdminPasswordResetStartedBuilder();
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
