//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/review_summary.dart';
import 'package:xinobi_api_client/src/model/public_review.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'review_page.g.dart';

/// ReviewPage
///
/// Properties:
/// * [summary]
/// * [items]
/// * [page]
/// * [pageSize]
@BuiltValue()
abstract class ReviewPage implements Built<ReviewPage, ReviewPageBuilder> {
  @BuiltValueField(wireName: r'summary')
  ReviewSummary get summary;

  @BuiltValueField(wireName: r'items')
  BuiltList<PublicReview> get items;

  @BuiltValueField(wireName: r'page')
  int get page;

  @BuiltValueField(wireName: r'pageSize')
  int get pageSize;

  ReviewPage._();

  factory ReviewPage([void updates(ReviewPageBuilder b)]) = _$ReviewPage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(ReviewPageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<ReviewPage> get serializer => _$ReviewPageSerializer();
}

class _$ReviewPageSerializer implements PrimitiveSerializer<ReviewPage> {
  @override
  final Iterable<Type> types = const [ReviewPage, _$ReviewPage];

  @override
  final String wireName = r'ReviewPage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    ReviewPage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'summary';
    yield serializers.serialize(
      object.summary,
      specifiedType: const FullType(ReviewSummary),
    );
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(PublicReview)]),
    );
    yield r'page';
    yield serializers.serialize(
      object.page,
      specifiedType: const FullType(int),
    );
    yield r'pageSize';
    yield serializers.serialize(
      object.pageSize,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    ReviewPage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required ReviewPageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'summary':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(ReviewSummary),
          ) as ReviewSummary;
          result.summary.replace(valueDes);
          break;
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(PublicReview)]),
          ) as BuiltList<PublicReview>;
          result.items.replace(valueDes);
          break;
        case r'page':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.page = valueDes;
          break;
        case r'pageSize':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pageSize = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  ReviewPage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = ReviewPageBuilder();
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
