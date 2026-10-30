//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'act_on_print_profile.g.dart';

/// ActOnPrintProfile
///
/// Properties:
/// * [expectedRevision]
/// * [evidenceReference]
/// * [note]
@BuiltValue()
abstract class ActOnPrintProfile implements Built<ActOnPrintProfile, ActOnPrintProfileBuilder> {
  @BuiltValueField(wireName: r'expectedRevision')
  int get expectedRevision;

  @BuiltValueField(wireName: r'evidenceReference')
  String get evidenceReference;

  @BuiltValueField(wireName: r'note')
  String get note;

  ActOnPrintProfile._();

  factory ActOnPrintProfile([void updates(ActOnPrintProfileBuilder b)]) = _$ActOnPrintProfile;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ActOnPrintProfileBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ActOnPrintProfile> get serializer => _$ActOnPrintProfileSerializer();
}

class _$ActOnPrintProfileSerializer implements PrimitiveSerializer<ActOnPrintProfile> {
  @override
  final Iterable<Type> types = const [ActOnPrintProfile, _$ActOnPrintProfile];

  @override
  final String wireName = r'ActOnPrintProfile';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ActOnPrintProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'expectedRevision';
    yield serializers.serialize(
      object.expectedRevision,
      specifiedType: const FullType(int),
    );
    yield r'evidenceReference';
    yield serializers.serialize(
      object.evidenceReference,
      specifiedType: const FullType(String),
    );
    yield r'note';
    yield serializers.serialize(
      object.note,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ActOnPrintProfile object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ActOnPrintProfileBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'expectedRevision':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedRevision = valueDes;
          break;
        case r'evidenceReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.evidenceReference = valueDes;
          break;
        case r'note':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.note = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ActOnPrintProfile deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ActOnPrintProfileBuilder();
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
