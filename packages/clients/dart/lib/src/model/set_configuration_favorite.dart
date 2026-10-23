//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'set_configuration_favorite.g.dart';

/// SetConfigurationFavorite
///
/// Properties:
/// * [favorite]
@BuiltValue()
abstract class SetConfigurationFavorite implements Built<SetConfigurationFavorite, SetConfigurationFavoriteBuilder> {
  @BuiltValueField(wireName: r'favorite')
  bool get favorite;

  SetConfigurationFavorite._();

  factory SetConfigurationFavorite([void updates(SetConfigurationFavoriteBuilder b)]) = _$SetConfigurationFavorite;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SetConfigurationFavoriteBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SetConfigurationFavorite> get serializer => _$SetConfigurationFavoriteSerializer();
}

class _$SetConfigurationFavoriteSerializer implements PrimitiveSerializer<SetConfigurationFavorite> {
  @override
  final Iterable<Type> types = const [SetConfigurationFavorite, _$SetConfigurationFavorite];

  @override
  final String wireName = r'SetConfigurationFavorite';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SetConfigurationFavorite object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'favorite';
    yield serializers.serialize(
      object.favorite,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SetConfigurationFavorite object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SetConfigurationFavoriteBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'favorite':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.favorite = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SetConfigurationFavorite deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SetConfigurationFavoriteBuilder();
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
