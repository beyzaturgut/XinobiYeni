//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/surat_tracking_item.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'surat_tracking_view.g.dart';

/// SuratTrackingView
///
/// Properties:
/// * [reference]
/// * [registrationState]
/// * [environment]
/// * [result]
/// * [lastAttempt]
/// * [lastSuccess]
/// * [items]
@BuiltValue()
abstract class SuratTrackingView implements Built<SuratTrackingView, SuratTrackingViewBuilder> {
  @BuiltValueField(wireName: r'reference')
  String get reference;

  @BuiltValueField(wireName: r'registrationState')
  String get registrationState;

  @BuiltValueField(wireName: r'environment')
  String get environment;

  @BuiltValueField(wireName: r'result')
  String get result;

  @BuiltValueField(wireName: r'lastAttempt')
  DateTime? get lastAttempt;

  @BuiltValueField(wireName: r'lastSuccess')
  DateTime? get lastSuccess;

  @BuiltValueField(wireName: r'items')
  BuiltList<SuratTrackingItem> get items;

  SuratTrackingView._();

  factory SuratTrackingView([void updates(SuratTrackingViewBuilder b)]) = _$SuratTrackingView;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(SuratTrackingViewBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<SuratTrackingView> get serializer => _$SuratTrackingViewSerializer();
}

class _$SuratTrackingViewSerializer implements PrimitiveSerializer<SuratTrackingView> {
  @override
  final Iterable<Type> types = const [SuratTrackingView, _$SuratTrackingView];

  @override
  final String wireName = r'SuratTrackingView';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    SuratTrackingView object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'reference';
    yield serializers.serialize(
      object.reference,
      specifiedType: const FullType(String),
    );
    yield r'registrationState';
    yield serializers.serialize(
      object.registrationState,
      specifiedType: const FullType(String),
    );
    yield r'environment';
    yield serializers.serialize(
      object.environment,
      specifiedType: const FullType(String),
    );
    yield r'result';
    yield serializers.serialize(
      object.result,
      specifiedType: const FullType(String),
    );
    yield r'lastAttempt';
    yield object.lastAttempt == null ? null : serializers.serialize(
      object.lastAttempt,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'lastSuccess';
    yield object.lastSuccess == null ? null : serializers.serialize(
      object.lastSuccess,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(SuratTrackingItem)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    SuratTrackingView object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required SuratTrackingViewBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'reference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.reference = valueDes;
          break;
        case r'registrationState':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.registrationState = valueDes;
          break;
        case r'environment':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.environment = valueDes;
          break;
        case r'result':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.result = valueDes;
          break;
        case r'lastAttempt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.lastAttempt = valueDes;
          break;
        case r'lastSuccess':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.lastSuccess = valueDes;
          break;
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(SuratTrackingItem)]),
          ) as BuiltList<SuratTrackingItem>;
          result.items.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  SuratTrackingView deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = SuratTrackingViewBuilder();
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
