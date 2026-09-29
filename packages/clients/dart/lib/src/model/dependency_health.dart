//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'dependency_health.g.dart';

/// DependencyHealth
///
/// Properties:
/// * [name]
/// * [isReady]
/// * [code]
@BuiltValue()
abstract class DependencyHealth implements Built<DependencyHealth, DependencyHealthBuilder> {
  @BuiltValueField(wireName: r'name')
  String get name;

  @BuiltValueField(wireName: r'isReady')
  bool get isReady;

  @BuiltValueField(wireName: r'code')
  String get code;

  DependencyHealth._();

  factory DependencyHealth([void updates(DependencyHealthBuilder b)]) = _$DependencyHealth;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(DependencyHealthBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<DependencyHealth> get serializer => _$DependencyHealthSerializer();
}

class _$DependencyHealthSerializer implements PrimitiveSerializer<DependencyHealth> {
  @override
  final Iterable<Type> types = const [DependencyHealth, _$DependencyHealth];

  @override
  final String wireName = r'DependencyHealth';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    DependencyHealth object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'name';
    yield serializers.serialize(
      object.name,
      specifiedType: const FullType(String),
    );
    yield r'isReady';
    yield serializers.serialize(
      object.isReady,
      specifiedType: const FullType(bool),
    );
    yield r'code';
    yield serializers.serialize(
      object.code,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    DependencyHealth object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required DependencyHealthBuilder result,
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
        case r'isReady':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.isReady = valueDes;
          break;
        case r'code':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.code = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  DependencyHealth deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = DependencyHealthBuilder();
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
