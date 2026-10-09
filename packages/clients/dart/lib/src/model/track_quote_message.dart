//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'track_quote_message.g.dart';

/// TrackQuoteMessage
///
/// Properties:
/// * [email]
/// * [text]
@BuiltValue()
abstract class TrackQuoteMessage implements Built<TrackQuoteMessage, TrackQuoteMessageBuilder> {
  @BuiltValueField(wireName: r'email')
  String get email;

  @BuiltValueField(wireName: r'text')
  String get text;

  TrackQuoteMessage._();

  factory TrackQuoteMessage([void updates(TrackQuoteMessageBuilder b)]) = _$TrackQuoteMessage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(TrackQuoteMessageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<TrackQuoteMessage> get serializer => _$TrackQuoteMessageSerializer();
}

class _$TrackQuoteMessageSerializer implements PrimitiveSerializer<TrackQuoteMessage> {
  @override
  final Iterable<Type> types = const [TrackQuoteMessage, _$TrackQuoteMessage];

  @override
  final String wireName = r'TrackQuoteMessage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    TrackQuoteMessage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'email';
    yield serializers.serialize(
      object.email,
      specifiedType: const FullType(String),
    );
    yield r'text';
    yield serializers.serialize(
      object.text,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    TrackQuoteMessage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required TrackQuoteMessageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'email':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.email = valueDes;
          break;
        case r'text':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.text = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  TrackQuoteMessage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = TrackQuoteMessageBuilder();
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
