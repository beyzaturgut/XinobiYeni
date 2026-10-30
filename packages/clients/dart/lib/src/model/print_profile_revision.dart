//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/print_profile_definition.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'print_profile_revision.g.dart';

/// PrintProfileRevision
///
/// Properties:
/// * [id]
/// * [revision]
/// * [status]
/// * [sku]
/// * [definition]
/// * [actorId]
/// * [createdAt]
/// * [evidenceReference]
/// * [decisionNote]
@BuiltValue()
abstract class PrintProfileRevision implements Built<PrintProfileRevision, PrintProfileRevisionBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'revision')
  int get revision;

  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'sku')
  String get sku;

  @BuiltValueField(wireName: r'definition')
  PrintProfileDefinition get definition;

  @BuiltValueField(wireName: r'actorId')
  String get actorId;

  @BuiltValueField(wireName: r'createdAt')
  DateTime get createdAt;

  @BuiltValueField(wireName: r'evidenceReference')
  String? get evidenceReference;

  @BuiltValueField(wireName: r'decisionNote')
  String? get decisionNote;

  PrintProfileRevision._();

  factory PrintProfileRevision([void updates(PrintProfileRevisionBuilder b)]) = _$PrintProfileRevision;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PrintProfileRevisionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PrintProfileRevision> get serializer => _$PrintProfileRevisionSerializer();
}

class _$PrintProfileRevisionSerializer implements PrimitiveSerializer<PrintProfileRevision> {
  @override
  final Iterable<Type> types = const [PrintProfileRevision, _$PrintProfileRevision];

  @override
  final String wireName = r'PrintProfileRevision';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PrintProfileRevision object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'revision';
    yield serializers.serialize(
      object.revision,
      specifiedType: const FullType(int),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'sku';
    yield serializers.serialize(
      object.sku,
      specifiedType: const FullType(String),
    );
    yield r'definition';
    yield serializers.serialize(
      object.definition,
      specifiedType: const FullType(PrintProfileDefinition),
    );
    yield r'actorId';
    yield serializers.serialize(
      object.actorId,
      specifiedType: const FullType(String),
    );
    yield r'createdAt';
    yield serializers.serialize(
      object.createdAt,
      specifiedType: const FullType(DateTime),
    );
    if (object.evidenceReference != null) {
      yield r'evidenceReference';
      yield serializers.serialize(
        object.evidenceReference,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.decisionNote != null) {
      yield r'decisionNote';
      yield serializers.serialize(
        object.decisionNote,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PrintProfileRevision object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PrintProfileRevisionBuilder result,
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
        case r'revision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.revision = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'sku':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sku = valueDes;
          break;
        case r'definition':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PrintProfileDefinition),
          ) as PrintProfileDefinition;
          result.definition.replace(valueDes);
          break;
        case r'actorId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.actorId = valueDes;
          break;
        case r'createdAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.createdAt = valueDes;
          break;
        case r'evidenceReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.evidenceReference = valueDes;
          break;
        case r'decisionNote':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.decisionNote = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PrintProfileRevision deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PrintProfileRevisionBuilder();
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
