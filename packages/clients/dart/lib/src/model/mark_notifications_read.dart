//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'mark_notifications_read.g.dart';

/// MarkNotificationsRead
///
/// Properties:
/// * [ids]
@BuiltValue()
abstract class MarkNotificationsRead implements Built<MarkNotificationsRead, MarkNotificationsReadBuilder> {
  @BuiltValueField(wireName: r'ids')
  BuiltList<String>? get ids;

  MarkNotificationsRead._();

  factory MarkNotificationsRead([void updates(MarkNotificationsReadBuilder b)]) = _$MarkNotificationsRead;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(MarkNotificationsReadBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<MarkNotificationsRead> get serializer => _$MarkNotificationsReadSerializer();
}

class _$MarkNotificationsReadSerializer implements PrimitiveSerializer<MarkNotificationsRead> {
  @override
  final Iterable<Type> types = const [MarkNotificationsRead, _$MarkNotificationsRead];

  @override
  final String wireName = r'MarkNotificationsRead';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    MarkNotificationsRead object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'ids';
    yield object.ids == null ? null : serializers.serialize(
      object.ids,
      specifiedType: const FullType.nullable(BuiltList, [FullType(String)]),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    MarkNotificationsRead object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required MarkNotificationsReadBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'ids':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BuiltList, [FullType(String)]),
          ) as BuiltList<String>?;
          if (valueDes == null) continue;
          result.ids.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  MarkNotificationsRead deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = MarkNotificationsReadBuilder();
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
