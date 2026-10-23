//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/design_placement.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'my_design_configuration.g.dart';

/// MyDesignConfiguration
///
/// Properties:
/// * [id]
/// * [designId]
/// * [productId]
/// * [variantId]
/// * [revision]
/// * [schemaVersion]
/// * [placement]
/// * [favorite]
/// * [sourceSha256]
/// * [createdAt]
@BuiltValue()
abstract class MyDesignConfiguration implements Built<MyDesignConfiguration, MyDesignConfigurationBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'designId')
  String get designId;

  @BuiltValueField(wireName: r'productId')
  String get productId;

  @BuiltValueField(wireName: r'variantId')
  String get variantId;

  @BuiltValueField(wireName: r'revision')
  int get revision;

  @BuiltValueField(wireName: r'schemaVersion')
  int get schemaVersion;

  @BuiltValueField(wireName: r'placement')
  DesignPlacement get placement;

  @BuiltValueField(wireName: r'favorite')
  bool get favorite;

  @BuiltValueField(wireName: r'sourceSha256')
  String get sourceSha256;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  MyDesignConfiguration._();

  factory MyDesignConfiguration([void updates(MyDesignConfigurationBuilder b)]) = _$MyDesignConfiguration;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MyDesignConfigurationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MyDesignConfiguration> get serializer => _$MyDesignConfigurationSerializer();
}

class _$MyDesignConfigurationSerializer implements PrimitiveSerializer<MyDesignConfiguration> {
  @override
  final Iterable<Type> types = const [MyDesignConfiguration, _$MyDesignConfiguration];

  @override
  final String wireName = r'MyDesignConfiguration';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MyDesignConfiguration object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'designId';
    yield serializers.serialize(
      object.designId,
      specifiedType: const FullType(String),
    );
    yield r'productId';
    yield serializers.serialize(
      object.productId,
      specifiedType: const FullType(String),
    );
    yield r'variantId';
    yield serializers.serialize(
      object.variantId,
      specifiedType: const FullType(String),
    );
    yield r'revision';
    yield serializers.serialize(
      object.revision,
      specifiedType: const FullType(int),
    );
    yield r'schemaVersion';
    yield serializers.serialize(
      object.schemaVersion,
      specifiedType: const FullType(int),
    );
    yield r'placement';
    yield serializers.serialize(
      object.placement,
      specifiedType: const FullType(DesignPlacement),
    );
    yield r'favorite';
    yield serializers.serialize(
      object.favorite,
      specifiedType: const FullType(bool),
    );
    yield r'sourceSha256';
    yield serializers.serialize(
      object.sourceSha256,
      specifiedType: const FullType(String),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MyDesignConfiguration object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MyDesignConfigurationBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'designId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.designId = valueDes;
          break;
        case r'productId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productId = valueDes;
          break;
        case r'variantId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.variantId = valueDes;
          break;
        case r'revision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.revision = valueDes;
          break;
        case r'schemaVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.schemaVersion = valueDes;
          break;
        case r'placement':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DesignPlacement),
          ) as DesignPlacement;
          result.placement.replace(valueDes);
          break;
        case r'favorite':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.favorite = valueDes;
          break;
        case r'sourceSha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sourceSha256 = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MyDesignConfiguration deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MyDesignConfigurationBuilder();
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
