//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'save_design_from_session.g.dart';

/// SaveDesignFromSession
///
/// Properties:
/// * [sessionId]
/// * [name]
@BuiltValue()
abstract class SaveDesignFromSession implements Built<SaveDesignFromSession, SaveDesignFromSessionBuilder> {
  @BuiltValueField(wireName: r'sessionId')
  String get sessionId;

  @BuiltValueField(wireName: r'name')
  String? get name;

  SaveDesignFromSession._();

  factory SaveDesignFromSession([void updates(SaveDesignFromSessionBuilder b)]) = _$SaveDesignFromSession;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SaveDesignFromSessionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SaveDesignFromSession> get serializer => _$SaveDesignFromSessionSerializer();
}

class _$SaveDesignFromSessionSerializer implements PrimitiveSerializer<SaveDesignFromSession> {
  @override
  final Iterable<Type> types = const [SaveDesignFromSession, _$SaveDesignFromSession];

  @override
  final String wireName = r'SaveDesignFromSession';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SaveDesignFromSession object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'sessionId';
    yield serializers.serialize(
      object.sessionId,
      specifiedType: const FullType(String),
    );
    yield r'name';
    yield object.name == null ? null : serializers.serialize(
      object.name,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SaveDesignFromSession object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SaveDesignFromSessionBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'sessionId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sessionId = valueDes;
          break;
        case r'name':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
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
  SaveDesignFromSession deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SaveDesignFromSessionBuilder();
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
