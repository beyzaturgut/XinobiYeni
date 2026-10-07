//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/announcement_item.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'announcement_list.g.dart';

/// AnnouncementList
///
/// Properties:
/// * [items]
@BuiltValue()
abstract class AnnouncementList implements Built<AnnouncementList, AnnouncementListBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<AnnouncementItem> get items;

  AnnouncementList._();

  factory AnnouncementList([void updates(AnnouncementListBuilder b)]) = _$AnnouncementList;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AnnouncementListBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AnnouncementList> get serializer => _$AnnouncementListSerializer();
}

class _$AnnouncementListSerializer implements PrimitiveSerializer<AnnouncementList> {
  @override
  final Iterable<Type> types = const [AnnouncementList, _$AnnouncementList];

  @override
  final String wireName = r'AnnouncementList';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AnnouncementList object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(AnnouncementItem)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    AnnouncementList object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AnnouncementListBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(AnnouncementItem)]),
          ) as BuiltList<AnnouncementItem>;
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
  AnnouncementList deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AnnouncementListBuilder();
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
