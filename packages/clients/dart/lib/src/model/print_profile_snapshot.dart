//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/print_profile_definition.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'print_profile_snapshot.g.dart';

/// PrintProfileSnapshot
///
/// Properties:
/// * [id]
/// * [revision]
/// * [sku]
/// * [definition]
/// * [sha256]
@BuiltValue()
abstract class PrintProfileSnapshot implements Built<PrintProfileSnapshot, PrintProfileSnapshotBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'revision')
  int get revision;

  @BuiltValueField(wireName: r'sku')
  String get sku;

  @BuiltValueField(wireName: r'definition')
  PrintProfileDefinition get definition;

  @BuiltValueField(wireName: r'sha256')
  String get sha256;

  PrintProfileSnapshot._();

  factory PrintProfileSnapshot([void updates(PrintProfileSnapshotBuilder b)]) = _$PrintProfileSnapshot;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PrintProfileSnapshotBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PrintProfileSnapshot> get serializer => _$PrintProfileSnapshotSerializer();
}

class _$PrintProfileSnapshotSerializer implements PrimitiveSerializer<PrintProfileSnapshot> {
  @override
  final Iterable<Type> types = const [PrintProfileSnapshot, _$PrintProfileSnapshot];

  @override
  final String wireName = r'PrintProfileSnapshot';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PrintProfileSnapshot object, {
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
    yield r'sha256';
    yield serializers.serialize(
      object.sha256,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    PrintProfileSnapshot object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PrintProfileSnapshotBuilder result,
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
        case r'sha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sha256 = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PrintProfileSnapshot deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PrintProfileSnapshotBuilder();
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
