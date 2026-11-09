//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/single_source_rendering_inputs.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'single_source_publication.g.dart';

/// SingleSourcePublication
///
/// Properties:
/// * [schemaVersion]
/// * [scope]
/// * [productReference]
/// * [surfaceId]
/// * [sourceRevision]
/// * [inputs]
@BuiltValue()
abstract class SingleSourcePublication implements Built<SingleSourcePublication, SingleSourcePublicationBuilder> {
  @BuiltValueField(wireName: r'schemaVersion')
  int get schemaVersion;

  @BuiltValueField(wireName: r'scope')
  String get scope;

  @BuiltValueField(wireName: r'productReference')
  String get productReference;

  @BuiltValueField(wireName: r'surfaceId')
  String get surfaceId;

  @BuiltValueField(wireName: r'sourceRevision')
  int get sourceRevision;

  @BuiltValueField(wireName: r'inputs')
  SingleSourceRenderingInputs get inputs;

  SingleSourcePublication._();

  factory SingleSourcePublication([void updates(SingleSourcePublicationBuilder b)]) = _$SingleSourcePublication;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SingleSourcePublicationBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SingleSourcePublication> get serializer => _$SingleSourcePublicationSerializer();
}

class _$SingleSourcePublicationSerializer implements PrimitiveSerializer<SingleSourcePublication> {
  @override
  final Iterable<Type> types = const [SingleSourcePublication, _$SingleSourcePublication];

  @override
  final String wireName = r'SingleSourcePublication';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SingleSourcePublication object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'schemaVersion';
    yield serializers.serialize(
      object.schemaVersion,
      specifiedType: const FullType(int),
    );
    yield r'scope';
    yield serializers.serialize(
      object.scope,
      specifiedType: const FullType(String),
    );
    yield r'productReference';
    yield serializers.serialize(
      object.productReference,
      specifiedType: const FullType(String),
    );
    yield r'surfaceId';
    yield serializers.serialize(
      object.surfaceId,
      specifiedType: const FullType(String),
    );
    yield r'sourceRevision';
    yield serializers.serialize(
      object.sourceRevision,
      specifiedType: const FullType(int),
    );
    yield r'inputs';
    yield serializers.serialize(
      object.inputs,
      specifiedType: const FullType(SingleSourceRenderingInputs),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SingleSourcePublication object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SingleSourcePublicationBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'schemaVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.schemaVersion = valueDes;
          break;
        case r'scope':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.scope = valueDes;
          break;
        case r'productReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productReference = valueDes;
          break;
        case r'surfaceId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.surfaceId = valueDes;
          break;
        case r'sourceRevision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sourceRevision = valueDes;
          break;
        case r'inputs':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(SingleSourceRenderingInputs),
          ) as SingleSourceRenderingInputs;
          result.inputs.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SingleSourcePublication deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SingleSourcePublicationBuilder();
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
