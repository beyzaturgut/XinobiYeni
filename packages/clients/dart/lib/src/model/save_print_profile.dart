//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/print_profile_definition.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'save_print_profile.g.dart';

/// SavePrintProfile
///
/// Properties:
/// * [id]
/// * [expectedRevision]
/// * [definition]
@BuiltValue()
abstract class SavePrintProfile implements Built<SavePrintProfile, SavePrintProfileBuilder> {
  @BuiltValueField(wireName: r'id')
  String? get id;

  @BuiltValueField(wireName: r'expectedRevision')
  int? get expectedRevision;

  @BuiltValueField(wireName: r'definition')
  PrintProfileDefinition get definition;

  SavePrintProfile._();

  factory SavePrintProfile([void updates(SavePrintProfileBuilder b)]) = _$SavePrintProfile;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SavePrintProfileBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SavePrintProfile> get serializer => _$SavePrintProfileSerializer();
}

class _$SavePrintProfileSerializer implements PrimitiveSerializer<SavePrintProfile> {
  @override
  final Iterable<Type> types = const [SavePrintProfile, _$SavePrintProfile];

  @override
  final String wireName = r'SavePrintProfile';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SavePrintProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield object.id == null ? null : serializers.serialize(
      object.id,
      specifiedType: const FullType.nullable(String),
    );
    yield r'expectedRevision';
    yield object.expectedRevision == null ? null : serializers.serialize(
      object.expectedRevision,
      specifiedType: const FullType.nullable(int),
    );
    yield r'definition';
    yield serializers.serialize(
      object.definition,
      specifiedType: const FullType(PrintProfileDefinition),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SavePrintProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SavePrintProfileBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.id = valueDes;
          break;
        case r'expectedRevision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.expectedRevision = valueDes;
          break;
        case r'definition':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(PrintProfileDefinition),
          ) as PrintProfileDefinition;
          result.definition.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SavePrintProfile deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SavePrintProfileBuilder();
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
