//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'create_xinobi_u_session.g.dart';

/// CreateXinobiUSession
///
/// Properties:
/// * [productId]
/// * [variantId]
/// * [clientId]
@BuiltValue()
abstract class CreateXinobiUSession implements Built<CreateXinobiUSession, CreateXinobiUSessionBuilder> {
  @BuiltValueField(wireName: r'productId')
  String get productId;

  @BuiltValueField(wireName: r'variantId')
  String get variantId;

  @BuiltValueField(wireName: r'clientId')
  String get clientId;

  CreateXinobiUSession._();

  factory CreateXinobiUSession([void updates(CreateXinobiUSessionBuilder b)]) = _$CreateXinobiUSession;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(CreateXinobiUSessionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<CreateXinobiUSession> get serializer => _$CreateXinobiUSessionSerializer();
}

class _$CreateXinobiUSessionSerializer implements PrimitiveSerializer<CreateXinobiUSession> {
  @override
  final Iterable<Type> types = const [CreateXinobiUSession, _$CreateXinobiUSession];

  @override
  final String wireName = r'CreateXinobiUSession';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    CreateXinobiUSession object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'productId';
    yield serializers.serialize(
      object.productId,
      specifiedType: const FullType(String),
    );
    yield r'variantId';
    yield serializers.serialize(
      object.variantId,
      specifiedType: const FullType(String),
    );
    yield r'clientId';
    yield serializers.serialize(
      object.clientId,
      specifiedType: const FullType(String),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    CreateXinobiUSession object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required CreateXinobiUSessionBuilder result,
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
        case r'variantId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.variantId = valueDes;
          break;
        case r'clientId':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.clientId = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  CreateXinobiUSession deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = CreateXinobiUSessionBuilder();
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
