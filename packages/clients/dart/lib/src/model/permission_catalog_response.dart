//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'permission_catalog_response.g.dart';

/// PermissionCatalogResponse
///
/// Properties:
/// * [resources]
/// * [permissions]
@BuiltValue()
abstract class PermissionCatalogResponse implements Built<PermissionCatalogResponse, PermissionCatalogResponseBuilder> {
  @BuiltValueField(wireName: r'resources')
  BuiltList<String> get resources;

  @BuiltValueField(wireName: r'permissions')
  BuiltList<String> get permissions;

  PermissionCatalogResponse._();

  factory PermissionCatalogResponse([void updates(PermissionCatalogResponseBuilder b)]) = _$PermissionCatalogResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PermissionCatalogResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PermissionCatalogResponse> get serializer => _$PermissionCatalogResponseSerializer();
}

class _$PermissionCatalogResponseSerializer implements PrimitiveSerializer<PermissionCatalogResponse> {
  @override
  final Iterable<Type> types = const [PermissionCatalogResponse, _$PermissionCatalogResponse];

  @override
  final String wireName = r'PermissionCatalogResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PermissionCatalogResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'resources';
    yield serializers.serialize(
      object.resources,
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
    PermissionCatalogResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PermissionCatalogResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'resources':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.resources.replace(valueDes);
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
  PermissionCatalogResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PermissionCatalogResponseBuilder();
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
