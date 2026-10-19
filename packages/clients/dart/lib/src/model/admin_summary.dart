//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/order_status_count.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'admin_summary.g.dart';

/// AdminSummary
///
/// Properties:
/// * [fromInclusive]
/// * [untilExclusive]
/// * [generatedAt]
/// * [timeZone]
/// * [orderCount]
/// * [registeredCustomerCount]
/// * [orderStatuses]
@BuiltValue()
abstract class AdminSummary implements Built<AdminSummary, AdminSummaryBuilder> {
  @BuiltValueField(wireName: r'fromInclusive')
  DateTime? get fromInclusive;

  @BuiltValueField(wireName: r'untilExclusive')
  DateTime get untilExclusive;

  @BuiltValueField(wireName: r'generatedAt')
  DateTime get generatedAt;

  @BuiltValueField(wireName: r'timeZone')
  String get timeZone;

  @BuiltValueField(wireName: r'orderCount')
  int get orderCount;

  @BuiltValueField(wireName: r'registeredCustomerCount')
  int get registeredCustomerCount;

  @BuiltValueField(wireName: r'orderStatuses')
  BuiltList<OrderStatusCount> get orderStatuses;

  AdminSummary._();

  factory AdminSummary([void updates(AdminSummaryBuilder b)]) = _$AdminSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AdminSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AdminSummary> get serializer => _$AdminSummarySerializer();
}

class _$AdminSummarySerializer implements PrimitiveSerializer<AdminSummary> {
  @override
  final Iterable<Type> types = const [AdminSummary, _$AdminSummary];

  @override
  final String wireName = r'AdminSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AdminSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'fromInclusive';
    yield object.fromInclusive == null ? null : serializers.serialize(
      object.fromInclusive,
      specifiedType: const FullType.nullable(DateTime),
    );
    yield r'untilExclusive';
    yield serializers.serialize(
      object.untilExclusive,
      specifiedType: const FullType(DateTime),
    );
    yield r'generatedAt';
    yield serializers.serialize(
      object.generatedAt,
      specifiedType: const FullType(DateTime),
    );
    yield r'timeZone';
    yield serializers.serialize(
      object.timeZone,
      specifiedType: const FullType(String),
    );
    yield r'orderCount';
    yield serializers.serialize(
      object.orderCount,
      specifiedType: const FullType(int),
    );
    yield r'registeredCustomerCount';
    yield serializers.serialize(
      object.registeredCustomerCount,
      specifiedType: const FullType(int),
    );
    yield r'orderStatuses';
    yield serializers.serialize(
      object.orderStatuses,
      specifiedType: const FullType(BuiltList, [FullType(OrderStatusCount)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AdminSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AdminSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'fromInclusive':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.fromInclusive = valueDes;
          break;
        case r'untilExclusive':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.untilExclusive = valueDes;
          break;
        case r'generatedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.generatedAt = valueDes;
          break;
        case r'timeZone':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.timeZone = valueDes;
          break;
        case r'orderCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.orderCount = valueDes;
          break;
        case r'registeredCustomerCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.registeredCustomerCount = valueDes;
          break;
        case r'orderStatuses':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(OrderStatusCount)]),
          ) as BuiltList<OrderStatusCount>;
          result.orderStatuses.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AdminSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AdminSummaryBuilder();
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
