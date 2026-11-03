//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'surat_tracking_item.g.dart';

/// SuratTrackingItem
///
/// Properties:
/// * [trackingNumber]
/// * [statusCode]
/// * [state]
/// * [providerText]
/// * [lastMovementRaw]
/// * [deliveredDateRaw]
@BuiltValue()
abstract class SuratTrackingItem implements Built<SuratTrackingItem, SuratTrackingItemBuilder> {
  @BuiltValueField(wireName: r'trackingNumber')
  String? get trackingNumber;

  @BuiltValueField(wireName: r'statusCode')
  int? get statusCode;

  @BuiltValueField(wireName: r'state')
  String get state;

  @BuiltValueField(wireName: r'providerText')
  String? get providerText;

  @BuiltValueField(wireName: r'lastMovementRaw')
  String? get lastMovementRaw;

  @BuiltValueField(wireName: r'deliveredDateRaw')
  String? get deliveredDateRaw;

  SuratTrackingItem._();

  factory SuratTrackingItem([void updates(SuratTrackingItemBuilder b)]) = _$SuratTrackingItem;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SuratTrackingItemBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SuratTrackingItem> get serializer => _$SuratTrackingItemSerializer();
}

class _$SuratTrackingItemSerializer implements PrimitiveSerializer<SuratTrackingItem> {
  @override
  final Iterable<Type> types = const [SuratTrackingItem, _$SuratTrackingItem];

  @override
  final String wireName = r'SuratTrackingItem';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SuratTrackingItem object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'trackingNumber';
    yield object.trackingNumber == null ? null : serializers.serialize(
      object.trackingNumber,
      specifiedType: const FullType.nullable(String),
    );
    yield r'statusCode';
    yield object.statusCode == null ? null : serializers.serialize(
      object.statusCode,
      specifiedType: const FullType.nullable(int),
    );
    yield r'state';
    yield serializers.serialize(
      object.state,
      specifiedType: const FullType(String),
    );
    yield r'providerText';
    yield object.providerText == null ? null : serializers.serialize(
      object.providerText,
      specifiedType: const FullType.nullable(String),
    );
    yield r'lastMovementRaw';
    yield object.lastMovementRaw == null ? null : serializers.serialize(
      object.lastMovementRaw,
      specifiedType: const FullType.nullable(String),
    );
    yield r'deliveredDateRaw';
    yield object.deliveredDateRaw == null ? null : serializers.serialize(
      object.deliveredDateRaw,
      specifiedType: const FullType.nullable(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SuratTrackingItem object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SuratTrackingItemBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'trackingNumber':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.trackingNumber = valueDes;
          break;
        case r'statusCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.statusCode = valueDes;
          break;
        case r'state':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.state = valueDes;
          break;
        case r'providerText':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.providerText = valueDes;
          break;
        case r'lastMovementRaw':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.lastMovementRaw = valueDes;
          break;
        case r'deliveredDateRaw':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.deliveredDateRaw = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SuratTrackingItem deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SuratTrackingItemBuilder();
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
