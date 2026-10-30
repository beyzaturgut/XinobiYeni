//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/print_profile_snapshot.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'print_setup_snapshot.g.dart';

/// PrintSetupSnapshot
///
/// Properties:
/// * [status]
/// * [profiles]
/// * [productionReady]
@BuiltValue()
abstract class PrintSetupSnapshot implements Built<PrintSetupSnapshot, PrintSetupSnapshotBuilder> {
  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'profiles')
  BuiltList<PrintProfileSnapshot> get profiles;

  @BuiltValueField(wireName: r'productionReady')
  bool? get productionReady;

  PrintSetupSnapshot._();

  factory PrintSetupSnapshot([void updates(PrintSetupSnapshotBuilder b)]) = _$PrintSetupSnapshot;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PrintSetupSnapshotBuilder b) => b
      ..productionReady = false;

  @BuiltValueSerializer(custom: true)
  static Serializer<PrintSetupSnapshot> get serializer => _$PrintSetupSnapshotSerializer();
}

class _$PrintSetupSnapshotSerializer implements PrimitiveSerializer<PrintSetupSnapshot> {
  @override
  final Iterable<Type> types = const [PrintSetupSnapshot, _$PrintSetupSnapshot];

  @override
  final String wireName = r'PrintSetupSnapshot';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PrintSetupSnapshot object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'profiles';
    yield serializers.serialize(
      object.profiles,
      specifiedType: const FullType(BuiltList, [FullType(PrintProfileSnapshot)]),
    );
    if (object.productionReady != null) {
      yield r'productionReady';
      yield serializers.serialize(
        object.productionReady,
        specifiedType: const FullType(bool),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PrintSetupSnapshot object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PrintSetupSnapshotBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'profiles':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PrintProfileSnapshot)]),
          ) as BuiltList<PrintProfileSnapshot>;
          result.profiles.replace(valueDes);
          break;
        case r'productionReady':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(bool),
          ) as bool?;
          if (valueDes == null) continue;
          result.productionReady = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PrintSetupSnapshot deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PrintSetupSnapshotBuilder();
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
