//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/design_placement.dart';
import 'package:xinobi_api_client/src/model/single_source_binding.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'save_design_configuration.g.dart';

/// SaveDesignConfiguration
///
/// Properties:
/// * [variantId]
/// * [placement]
/// * [configurationId]
/// * [expectedRevision]
/// * [favorite]
/// * [surfaceBinding]
@BuiltValue()
abstract class SaveDesignConfiguration implements Built<SaveDesignConfiguration, SaveDesignConfigurationBuilder> {
  @BuiltValueField(wireName: r'variantId')
  String get variantId;

  @BuiltValueField(wireName: r'placement')
  DesignPlacement get placement;

  @BuiltValueField(wireName: r'configurationId')
  String? get configurationId;

  @BuiltValueField(wireName: r'expectedRevision')
  int? get expectedRevision;

  @BuiltValueField(wireName: r'favorite')
  bool? get favorite;

  @BuiltValueField(wireName: r'surfaceBinding')
  SingleSourceBinding? get surfaceBinding;

  SaveDesignConfiguration._();

  factory SaveDesignConfiguration([void updates(SaveDesignConfigurationBuilder b)]) = _$SaveDesignConfiguration;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SaveDesignConfigurationBuilder b) => b
      ..favorite = false;

  @BuiltValueSerializer(custom: true)
  static Serializer<SaveDesignConfiguration> get serializer => _$SaveDesignConfigurationSerializer();
}

class _$SaveDesignConfigurationSerializer implements PrimitiveSerializer<SaveDesignConfiguration> {
  @override
  final Iterable<Type> types = const [SaveDesignConfiguration, _$SaveDesignConfiguration];

  @override
  final String wireName = r'SaveDesignConfiguration';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SaveDesignConfiguration object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'variantId';
    yield serializers.serialize(
      object.variantId,
      specifiedType: const FullType(String),
    );
    yield r'placement';
    yield serializers.serialize(
      object.placement,
      specifiedType: const FullType(DesignPlacement),
    );
    if (object.configurationId != null) {
      yield r'configurationId';
      yield serializers.serialize(
        object.configurationId,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.expectedRevision != null) {
      yield r'expectedRevision';
      yield serializers.serialize(
        object.expectedRevision,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.favorite != null) {
      yield r'favorite';
      yield serializers.serialize(
        object.favorite,
        specifiedType: const FullType(bool),
      );
    }
    if (object.surfaceBinding != null) {
      yield r'surfaceBinding';
      yield serializers.serialize(
        object.surfaceBinding,
        specifiedType: const FullType.nullable(SingleSourceBinding),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    SaveDesignConfiguration object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SaveDesignConfigurationBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'variantId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.variantId = valueDes;
          break;
        case r'placement':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DesignPlacement),
          ) as DesignPlacement;
          result.placement.replace(valueDes);
          break;
        case r'configurationId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.configurationId = valueDes;
          break;
        case r'expectedRevision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.expectedRevision = valueDes;
          break;
        case r'favorite':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(bool),
          ) as bool?;
          if (valueDes == null) continue;
          result.favorite = valueDes;
          break;
        case r'surfaceBinding':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(SingleSourceBinding),
          ) as SingleSourceBinding?;
          if (valueDes == null) continue;
          result.surfaceBinding.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SaveDesignConfiguration deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SaveDesignConfigurationBuilder();
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
