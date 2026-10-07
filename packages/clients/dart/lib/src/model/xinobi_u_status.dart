//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'xinobi_u_status.g.dart';

/// XinobiUStatus
///
/// Properties:
/// * [generationAvailable]
/// * [questionBankVersion]
/// * [questionCount]
@BuiltValue()
abstract class XinobiUStatus implements Built<XinobiUStatus, XinobiUStatusBuilder> {
  @BuiltValueField(wireName: r'generationAvailable')
  bool get generationAvailable;

  @BuiltValueField(wireName: r'questionBankVersion')
  String get questionBankVersion;

  @BuiltValueField(wireName: r'questionCount')
  int get questionCount;

  XinobiUStatus._();

  factory XinobiUStatus([void updates(XinobiUStatusBuilder b)]) = _$XinobiUStatus;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(XinobiUStatusBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<XinobiUStatus> get serializer => _$XinobiUStatusSerializer();
}

class _$XinobiUStatusSerializer implements PrimitiveSerializer<XinobiUStatus> {
  @override
  final Iterable<Type> types = const [XinobiUStatus, _$XinobiUStatus];

  @override
  final String wireName = r'XinobiUStatus';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    XinobiUStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'generationAvailable';
    yield serializers.serialize(
      object.generationAvailable,
      specifiedType: const FullType(bool),
    );
    yield r'questionBankVersion';
    yield serializers.serialize(
      object.questionBankVersion,
      specifiedType: const FullType(String),
    );
    yield r'questionCount';
    yield serializers.serialize(
      object.questionCount,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    XinobiUStatus object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required XinobiUStatusBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'generationAvailable':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(bool),
          ) as bool;
          result.generationAvailable = valueDes;
          break;
        case r'questionBankVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.questionBankVersion = valueDes;
          break;
        case r'questionCount':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.questionCount = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  XinobiUStatus deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = XinobiUStatusBuilder();
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
