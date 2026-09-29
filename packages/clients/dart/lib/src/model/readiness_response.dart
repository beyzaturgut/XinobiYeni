//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/dependency_health.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'readiness_response.g.dart';

/// ReadinessResponse
///
/// Properties:
/// * [service]
/// * [status]
/// * [timestampUtc]
/// * [requestId]
/// * [checks]
@BuiltValue()
abstract class ReadinessResponse implements Built<ReadinessResponse, ReadinessResponseBuilder> {
  @BuiltValueField(wireName: r'service')
  String get service;

  @BuiltValueField(wireName: r'status')
  String get status;

  @BuiltValueField(wireName: r'timestampUtc')
  DateTime get timestampUtc;

  @BuiltValueField(wireName: r'requestId')
  String get requestId;

  @BuiltValueField(wireName: r'checks')
  BuiltList<DependencyHealth> get checks;

  ReadinessResponse._();

  factory ReadinessResponse([void updates(ReadinessResponseBuilder b)]) = _$ReadinessResponse;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReadinessResponseBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReadinessResponse> get serializer => _$ReadinessResponseSerializer();
}

class _$ReadinessResponseSerializer implements PrimitiveSerializer<ReadinessResponse> {
  @override
  final Iterable<Type> types = const [ReadinessResponse, _$ReadinessResponse];

  @override
  final String wireName = r'ReadinessResponse';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReadinessResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'service';
    yield serializers.serialize(
      object.service,
      specifiedType: const FullType(String),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(String),
    );
    yield r'timestampUtc';
    yield serializers.serialize(
      object.timestampUtc,
      specifiedType: const FullType(DateTime),
    );
    yield r'requestId';
    yield serializers.serialize(
      object.requestId,
      specifiedType: const FullType(String),
    );
    yield r'checks';
    yield serializers.serialize(
      object.checks,
      specifiedType: const FullType(BuiltList, [FullType(DependencyHealth)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ReadinessResponse object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReadinessResponseBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'service':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.service = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.status = valueDes;
          break;
        case r'timestampUtc':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.timestampUtc = valueDes;
          break;
        case r'requestId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.requestId = valueDes;
          break;
        case r'checks':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(DependencyHealth)]),
          ) as BuiltList<DependencyHealth>;
          result.checks.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReadinessResponse deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReadinessResponseBuilder();
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
