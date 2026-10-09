//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/inbox_item.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'inbox.g.dart';

/// Inbox
///
/// Properties:
/// * [items]
/// * [unread]
@BuiltValue()
abstract class Inbox implements Built<Inbox, InboxBuilder> {
  @BuiltValueField(wireName: r'items')
  BuiltList<InboxItem> get items;

  @BuiltValueField(wireName: r'unread')
  int get unread;

  Inbox._();

  factory Inbox([void updates(InboxBuilder b)]) = _$Inbox;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(InboxBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<Inbox> get serializer => _$InboxSerializer();
}

class _$InboxSerializer implements PrimitiveSerializer<Inbox> {
  @override
  final Iterable<Type> types = const [Inbox, _$Inbox];

  @override
  final String wireName = r'Inbox';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    Inbox object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'items';
    yield serializers.serialize(
      object.items,
      specifiedType: const FullType(BuiltList, [FullType(InboxItem)]),
    );
    yield r'unread';
    yield serializers.serialize(
      object.unread,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    Inbox object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required InboxBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'items':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(InboxItem)]),
          ) as BuiltList<InboxItem>;
          result.items.replace(valueDes);
          break;
        case r'unread':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.unread = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  Inbox deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = InboxBuilder();
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
