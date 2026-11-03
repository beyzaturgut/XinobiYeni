//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'surat_connection_status.g.dart';

/// SuratConnectionStatus
///
/// Properties:
/// * [enabled]
/// * [mode]
/// * [accountConfigured]
/// * [pollingEnabled]
/// * [liveOperationsAllowed]
@BuiltValue()
abstract class SuratConnectionStatus implements Built<SuratConnectionStatus, SuratConnectionStatusBuilder> {
  @BuiltValueField(wireName: r'enabled')
  bool get enabled;

  @BuiltValueField(wireName: r'mode')
  String get mode;

  @BuiltValueField(wireName: r'accountConfigured')
  bool get accountConfigured;

  @BuiltValueField(wireName: r'pollingEnabled')
  bool get pollingEnabled;

  @BuiltValueField(wireName: r'liveOperationsAllowed')
  bool get liveOperationsAllowed;

  SuratConnectionStatus._();

  factory SuratConnectionStatus([void updates(SuratConnectionStatusBuilder b)]) = _$SuratConnectionStatus;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SuratConnectionStatusBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SuratConnectionStatus> get serializer => _$SuratConnectionStatusSerializer();
}

class _$SuratConnectionStatusSerializer implements PrimitiveSerializer<SuratConnectionStatus> {
  @override
  final Iterable<Type> types = const [SuratConnectionStatus, _$SuratConnectionStatus];

  @override
  final String wireName = r'SuratConnectionStatus';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SuratConnectionStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'enabled';
    yield serializers.serialize(
      object.enabled,
      specifiedType: const FullType(bool),
    );
    yield r'mode';
    yield serializers.serialize(
      object.mode,
      specifiedType: const FullType(String),
    );
    yield r'accountConfigured';
    yield serializers.serialize(
      object.accountConfigured,
      specifiedType: const FullType(bool),
    );
    yield r'pollingEnabled';
    yield serializers.serialize(
      object.pollingEnabled,
      specifiedType: const FullType(bool),
    );
    yield r'liveOperationsAllowed';
    yield serializers.serialize(
      object.liveOperationsAllowed,
      specifiedType: const FullType(bool),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SuratConnectionStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SuratConnectionStatusBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'enabled':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.enabled = valueDes;
          break;
        case r'mode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.mode = valueDes;
          break;
        case r'accountConfigured':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.accountConfigured = valueDes;
          break;
        case r'pollingEnabled':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.pollingEnabled = valueDes;
          break;
        case r'liveOperationsAllowed':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.liveOperationsAllowed = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SuratConnectionStatus deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SuratConnectionStatusBuilder();
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
