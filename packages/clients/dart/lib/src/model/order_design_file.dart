//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_design_file.g.dart';

/// OrderDesignFile
///
/// Properties:
/// * [sha256]
/// * [mime]
/// * [bytes]
@BuiltValue()
abstract class OrderDesignFile implements Built<OrderDesignFile, OrderDesignFileBuilder> {
  @BuiltValueField(wireName: r'sha256')
  String get sha256;

  @BuiltValueField(wireName: r'mime')
  String get mime;

  @BuiltValueField(wireName: r'bytes')
  int get bytes;

  OrderDesignFile._();

  factory OrderDesignFile([void updates(OrderDesignFileBuilder b)]) = _$OrderDesignFile;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderDesignFileBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderDesignFile> get serializer => _$OrderDesignFileSerializer();
}

class _$OrderDesignFileSerializer implements PrimitiveSerializer<OrderDesignFile> {
  @override
  final Iterable<Type> types = const [OrderDesignFile, _$OrderDesignFile];

  @override
  final String wireName = r'OrderDesignFile';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderDesignFile object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'sha256';
    yield serializers.serialize(
      object.sha256,
      specifiedType: const FullType(String),
    );
    yield r'mime';
    yield serializers.serialize(
      object.mime,
      specifiedType: const FullType(String),
    );
    yield r'bytes';
    yield serializers.serialize(
      object.bytes,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    OrderDesignFile object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderDesignFileBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'sha256':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.sha256 = valueDes;
          break;
        case r'mime':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.mime = valueDes;
          break;
        case r'bytes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.bytes = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OrderDesignFile deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderDesignFileBuilder();
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
