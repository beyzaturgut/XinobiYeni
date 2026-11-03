//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/order_design_file.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'order_design_files.g.dart';

/// OrderDesignFiles
///
/// Properties:
/// * [pattern]
/// * [productSource]
/// * [composition]
@BuiltValue()
abstract class OrderDesignFiles implements Built<OrderDesignFiles, OrderDesignFilesBuilder> {
  @BuiltValueField(wireName: r'pattern')
  OrderDesignFile get pattern;

  @BuiltValueField(wireName: r'productSource')
  OrderDesignFile? get productSource;

  @BuiltValueField(wireName: r'composition')
  OrderDesignFile? get composition;

  OrderDesignFiles._();

  factory OrderDesignFiles([void updates(OrderDesignFilesBuilder b)]) = _$OrderDesignFiles;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(OrderDesignFilesBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<OrderDesignFiles> get serializer => _$OrderDesignFilesSerializer();
}

class _$OrderDesignFilesSerializer implements PrimitiveSerializer<OrderDesignFiles> {
  @override
  final Iterable<Type> types = const [OrderDesignFiles, _$OrderDesignFiles];

  @override
  final String wireName = r'OrderDesignFiles';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    OrderDesignFiles object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'pattern';
    yield serializers.serialize(
      object.pattern,
      specifiedType: const FullType(OrderDesignFile),
    );
    if (object.productSource != null) {
      yield r'productSource';
      yield serializers.serialize(
        object.productSource,
        specifiedType: const FullType.nullable(OrderDesignFile),
      );
    }
    if (object.composition != null) {
      yield r'composition';
      yield serializers.serialize(
        object.composition,
        specifiedType: const FullType.nullable(OrderDesignFile),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    OrderDesignFiles object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required OrderDesignFilesBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'pattern':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(OrderDesignFile),
          ) as OrderDesignFile;
          result.pattern.replace(valueDes);
          break;
        case r'productSource':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(OrderDesignFile),
          ) as OrderDesignFile?;
          if (valueDes == null) continue;
          result.productSource.replace(valueDes);
          break;
        case r'composition':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(OrderDesignFile),
          ) as OrderDesignFile?;
          if (valueDes == null) continue;
          result.composition.replace(valueDes);
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  OrderDesignFiles deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = OrderDesignFilesBuilder();
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
