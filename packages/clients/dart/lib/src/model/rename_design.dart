//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'rename_design.g.dart';

/// RenameDesign
///
/// Properties:
/// * [name]
@BuiltValue()
abstract class RenameDesign implements Built<RenameDesign, RenameDesignBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  RenameDesign._();

  factory RenameDesign([void updates(RenameDesignBuilder b)]) = _$RenameDesign;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(RenameDesignBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<RenameDesign> get serializer => _$RenameDesignSerializer();
}

class _$RenameDesignSerializer implements PrimitiveSerializer<RenameDesign> {
  @override
  final Iterable<Type> types = const [RenameDesign, _$RenameDesign];

  @override
  final String wireName = r'RenameDesign';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    RenameDesign object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    RenameDesign object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required RenameDesignBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.name = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  RenameDesign deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = RenameDesignBuilder();
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
