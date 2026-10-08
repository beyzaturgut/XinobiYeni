//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'update_my_account.g.dart';

/// UpdateMyAccount
///
/// Properties:
/// * [name]
@BuiltValue()
abstract class UpdateMyAccount implements Built<UpdateMyAccount, UpdateMyAccountBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  UpdateMyAccount._();

  factory UpdateMyAccount([void updates(UpdateMyAccountBuilder b)]) = _$UpdateMyAccount;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(UpdateMyAccountBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<UpdateMyAccount> get serializer => _$UpdateMyAccountSerializer();
}

class _$UpdateMyAccountSerializer implements PrimitiveSerializer<UpdateMyAccount> {
  @override
  final Iterable<Type> types = const [UpdateMyAccount, _$UpdateMyAccount];

  @override
  final String wireName = r'UpdateMyAccount';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    UpdateMyAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    UpdateMyAccount object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required UpdateMyAccountBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  UpdateMyAccount deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = UpdateMyAccountBuilder();
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
