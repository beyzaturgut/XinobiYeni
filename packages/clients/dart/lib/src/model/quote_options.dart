//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'quote_options.g.dart';

/// QuoteOptions
///
/// Properties:
/// * [purposes]
/// * [minQuantity]
/// * [maxQuantity]
/// * [maxItems]
@BuiltValue()
abstract class QuoteOptions implements Built<QuoteOptions, QuoteOptionsBuilder> {
  @BuiltValueField(wireName: r'purposes')
  BuiltList<String> get purposes;

  @BuiltValueField(wireName: r'minQuantity')
  int get minQuantity;

  @BuiltValueField(wireName: r'maxQuantity')
  int get maxQuantity;

  @BuiltValueField(wireName: r'maxItems')
  int get maxItems;

  QuoteOptions._();

  factory QuoteOptions([void updates(QuoteOptionsBuilder b)]) = _$QuoteOptions;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(QuoteOptionsBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<QuoteOptions> get serializer => _$QuoteOptionsSerializer();
}

class _$QuoteOptionsSerializer implements PrimitiveSerializer<QuoteOptions> {
  @override
  final Iterable<Type> types = const [QuoteOptions, _$QuoteOptions];

  @override
  final String wireName = r'QuoteOptions';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    QuoteOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'purposes';
    yield serializers.serialize(
      object.purposes,
      specifiedType: const FullType(BuiltList, [FullType(String)]),
    );
    yield r'minQuantity';
    yield serializers.serialize(
      object.minQuantity,
      specifiedType: const FullType(int),
    );
    yield r'maxQuantity';
    yield serializers.serialize(
      object.maxQuantity,
      specifiedType: const FullType(int),
    );
    yield r'maxItems';
    yield serializers.serialize(
      object.maxItems,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    QuoteOptions object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required QuoteOptionsBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'purposes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(String)]),
          ) as BuiltList<String>;
          result.purposes.replace(valueDes);
          break;
        case r'minQuantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.minQuantity = valueDes;
          break;
        case r'maxQuantity':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.maxQuantity = valueDes;
          break;
        case r'maxItems':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.maxItems = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  QuoteOptions deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = QuoteOptionsBuilder();
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
