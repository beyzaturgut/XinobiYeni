//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/assistant_product.dart';
import 'package:built_collection/built_collection.dart';
import 'package:xinobi_api_client/src/model/assistant_action.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'assistant_message.g.dart';

/// AssistantMessage
///
/// Properties:
/// * [id]
/// * [role]
/// * [text]
/// * [products]
/// * [actions]
/// * [at]
/// * [source_]
@BuiltValue()
abstract class AssistantMessage implements Built<AssistantMessage, AssistantMessageBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'role')
  String get role;

  @BuiltValueField(wireName: r'text')
  String get text;

  @BuiltValueField(wireName: r'products')
  BuiltList<AssistantProduct> get products;

  @BuiltValueField(wireName: r'actions')
  BuiltList<AssistantAction> get actions;

  @BuiltValueField(wireName: r'at')
  DateTime get at;

  @BuiltValueField(wireName: r'source')
  String? get source_;

  AssistantMessage._();

  factory AssistantMessage([void updates(AssistantMessageBuilder b)]) = _$AssistantMessage;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(AssistantMessageBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<AssistantMessage> get serializer => _$AssistantMessageSerializer();
}

class _$AssistantMessageSerializer implements PrimitiveSerializer<AssistantMessage> {
  @override
  final Iterable<Type> types = const [AssistantMessage, _$AssistantMessage];

  @override
  final String wireName = r'AssistantMessage';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    AssistantMessage object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'role';
    yield serializers.serialize(
      object.role,
      specifiedType: const FullType(String),
    );
    yield r'text';
    yield serializers.serialize(
      object.text,
      specifiedType: const FullType(String),
    );
    yield r'products';
    yield serializers.serialize(
      object.products,
      specifiedType: const FullType(BuiltList, [FullType(AssistantProduct)]),
    );
    yield r'actions';
    yield serializers.serialize(
      object.actions,
      specifiedType: const FullType(BuiltList, [FullType(AssistantAction)]),
    );
    yield r'at';
    yield serializers.serialize(
      object.at,
      specifiedType: const FullType(DateTime),
    );
    if (object.source_ != null) {
      yield r'source';
      yield serializers.serialize(
        object.source_,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    AssistantMessage object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required AssistantMessageBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'role':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.role = valueDes;
          break;
        case r'text':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.text = valueDes;
          break;
        case r'products':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(AssistantProduct)]),
          ) as BuiltList<AssistantProduct>;
          result.products.replace(valueDes);
          break;
        case r'actions':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(BuiltList, [FullType(AssistantAction)]),
          ) as BuiltList<AssistantAction>;
          result.actions.replace(valueDes);
          break;
        case r'at':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(DateTime),
          ) as DateTime;
          result.at = valueDes;
          break;
        case r'source':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.source_ = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  AssistantMessage deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = AssistantMessageBuilder();
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
