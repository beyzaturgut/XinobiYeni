//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'review_summary.g.dart';

/// ReviewSummary
///
/// Properties:
/// * [productId]
/// * [average]
/// * [count]
/// * [distribution]
@BuiltValue()
abstract class ReviewSummary implements Built<ReviewSummary, ReviewSummaryBuilder> {
  @BuiltValueField(wireName: r'productId')
  String get productId;

  @BuiltValueField(wireName: r'average')
  double get average;

  @BuiltValueField(wireName: r'count')
  int get count;

  @BuiltValueField(wireName: r'distribution')
  BuiltList<int> get distribution;

  ReviewSummary._();

  factory ReviewSummary([void updates(ReviewSummaryBuilder b)]) = _$ReviewSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReviewSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReviewSummary> get serializer => _$ReviewSummarySerializer();
}

class _$ReviewSummarySerializer implements PrimitiveSerializer<ReviewSummary> {
  @override
  final Iterable<Type> types = const [ReviewSummary, _$ReviewSummary];

  @override
  final String wireName = r'ReviewSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReviewSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'productId';
    yield serializers.serialize(
      object.productId,
      specifiedType: const FullType(String),
    );
    yield r'average';
    yield serializers.serialize(
      object.average,
      specifiedType: const FullType(double),
    );
    yield r'count';
    yield serializers.serialize(
      object.count,
      specifiedType: const FullType(int),
    );
    yield r'distribution';
    yield serializers.serialize(
      object.distribution,
      specifiedType: const FullType(BuiltList, [FullType(int)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ReviewSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReviewSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'productId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.productId = valueDes;
          break;
        case r'average':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(double),
          ) as double;
          result.average = valueDes;
          break;
        case r'count':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.count = valueDes;
          break;
        case r'distribution':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(int)]),
          ) as BuiltList<int>;
          result.distribution.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReviewSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReviewSummaryBuilder();
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
