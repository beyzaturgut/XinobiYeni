//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'add_favorite.g.dart';

/// AddFavorite
///
/// Properties:
/// * [productId]
@BuiltValue()
abstract class AddFavorite implements Built<AddFavorite, AddFavoriteBuilder> {
  @BuiltValueField(wireName: r'productId')
  String get productId;

  AddFavorite._();

  factory AddFavorite([void updates(AddFavoriteBuilder b)]) = _$AddFavorite;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AddFavoriteBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AddFavorite> get serializer => _$AddFavoriteSerializer();
}

class _$AddFavoriteSerializer implements PrimitiveSerializer<AddFavorite> {
  @override
  final Iterable<Type> types = const [AddFavorite, _$AddFavorite];

  @override
  final String wireName = r'AddFavorite';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AddFavorite object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'productId';
    yield serializers.serialize(
      object.productId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AddFavorite object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AddFavoriteBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'productId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AddFavorite deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AddFavoriteBuilder();
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
