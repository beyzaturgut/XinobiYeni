//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/review_summary.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'review_summary_list.g.dart';

/// ReviewSummaryList
///
/// Properties:
/// * [items]
@BuiltValue()
abstract class ReviewSummaryList implements Built<ReviewSummaryList, ReviewSummaryListBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<ReviewSummary> get items;

  ReviewSummaryList._();

  factory ReviewSummaryList([void updates(ReviewSummaryListBuilder b)]) = _$ReviewSummaryList;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReviewSummaryListBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReviewSummaryList> get serializer => _$ReviewSummaryListSerializer();
}

class _$ReviewSummaryListSerializer implements PrimitiveSerializer<ReviewSummaryList> {
  @override
  final Iterable<Type> types = const [ReviewSummaryList, _$ReviewSummaryList];

  @override
  final String wireName = r'ReviewSummaryList';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReviewSummaryList object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(ReviewSummary)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ReviewSummaryList object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReviewSummaryListBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(ReviewSummary)]),
          ) as BuiltList<ReviewSummary>;
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
  ReviewSummaryList deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReviewSummaryListBuilder();
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
