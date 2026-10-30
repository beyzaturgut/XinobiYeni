//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:xinobi_api_client/src/model/print_rect.dart';
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'print_profile_definition.g.dart';

/// PrintProfileDefinition
///
/// Properties:
/// * [productId]
/// * [variantId]
/// * [face]
/// * [title]
/// * [widthMm]
/// * [heightMm]
/// * [dpi]
/// * [bleedMm]
/// * [safeInsetMm]
/// * [process]
/// * [colorSpace]
/// * [colorProfile]
/// * [outputFormat]
/// * [allowTransparency]
/// * [sourceWidth]
/// * [sourceHeight]
/// * [surfaceVersion]
/// * [referenceRectPx]
/// * [mappingKind]
/// * [templateReference]
/// * [exclusionsMm]
/// * [notes]
@BuiltValue()
abstract class PrintProfileDefinition implements Built<PrintProfileDefinition, PrintProfileDefinitionBuilder> {
  @BuiltValueField(wireName: r'productId')
  String get productId;

  @BuiltValueField(wireName: r'variantId')
  String get variantId;

  @BuiltValueField(wireName: r'face')
  String get face;

  @BuiltValueField(wireName: r'title')
  String get title;

  @BuiltValueField(wireName: r'widthMm')
  double? get widthMm;

  @BuiltValueField(wireName: r'heightMm')
  double? get heightMm;

  @BuiltValueField(wireName: r'dpi')
  int? get dpi;

  @BuiltValueField(wireName: r'bleedMm')
  double? get bleedMm;

  @BuiltValueField(wireName: r'safeInsetMm')
  double? get safeInsetMm;

  @BuiltValueField(wireName: r'process')
  String? get process;

  @BuiltValueField(wireName: r'colorSpace')
  String? get colorSpace;

  @BuiltValueField(wireName: r'colorProfile')
  String? get colorProfile;

  @BuiltValueField(wireName: r'outputFormat')
  String? get outputFormat;

  @BuiltValueField(wireName: r'allowTransparency')
  bool? get allowTransparency;

  @BuiltValueField(wireName: r'sourceWidth')
  int? get sourceWidth;

  @BuiltValueField(wireName: r'sourceHeight')
  int? get sourceHeight;

  @BuiltValueField(wireName: r'surfaceVersion')
  String? get surfaceVersion;

  @BuiltValueField(wireName: r'referenceRectPx')
  PrintRect? get referenceRectPx;

  @BuiltValueField(wireName: r'mappingKind')
  String? get mappingKind;

  @BuiltValueField(wireName: r'templateReference')
  String? get templateReference;

  @BuiltValueField(wireName: r'exclusionsMm')
  BuiltList<PrintRect>? get exclusionsMm;

  @BuiltValueField(wireName: r'notes')
  String? get notes;

  PrintProfileDefinition._();

  factory PrintProfileDefinition([void updates(PrintProfileDefinitionBuilder b)]) = _$PrintProfileDefinition;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(PrintProfileDefinitionBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<PrintProfileDefinition> get serializer => _$PrintProfileDefinitionSerializer();
}

class _$PrintProfileDefinitionSerializer implements PrimitiveSerializer<PrintProfileDefinition> {
  @override
  final Iterable<Type> types = const [PrintProfileDefinition, _$PrintProfileDefinition];

  @override
  final String wireName = r'PrintProfileDefinition';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    PrintProfileDefinition object, {
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
    yield r'face';
    yield serializers.serialize(
      object.face,
      specifiedType: const FullType(String),
    );
    yield r'title';
    yield serializers.serialize(
      object.title,
      specifiedType: const FullType(String),
    );
    if (object.widthMm != null) {
      yield r'widthMm';
      yield serializers.serialize(
        object.widthMm,
        specifiedType: const FullType.nullable(double),
      );
    }
    if (object.heightMm != null) {
      yield r'heightMm';
      yield serializers.serialize(
        object.heightMm,
        specifiedType: const FullType.nullable(double),
      );
    }
    if (object.dpi != null) {
      yield r'dpi';
      yield serializers.serialize(
        object.dpi,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.bleedMm != null) {
      yield r'bleedMm';
      yield serializers.serialize(
        object.bleedMm,
        specifiedType: const FullType.nullable(double),
      );
    }
    if (object.safeInsetMm != null) {
      yield r'safeInsetMm';
      yield serializers.serialize(
        object.safeInsetMm,
        specifiedType: const FullType.nullable(double),
      );
    }
    if (object.process != null) {
      yield r'process';
      yield serializers.serialize(
        object.process,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.colorSpace != null) {
      yield r'colorSpace';
      yield serializers.serialize(
        object.colorSpace,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.colorProfile != null) {
      yield r'colorProfile';
      yield serializers.serialize(
        object.colorProfile,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.outputFormat != null) {
      yield r'outputFormat';
      yield serializers.serialize(
        object.outputFormat,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.allowTransparency != null) {
      yield r'allowTransparency';
      yield serializers.serialize(
        object.allowTransparency,
        specifiedType: const FullType.nullable(bool),
      );
    }
    if (object.sourceWidth != null) {
      yield r'sourceWidth';
      yield serializers.serialize(
        object.sourceWidth,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.sourceHeight != null) {
      yield r'sourceHeight';
      yield serializers.serialize(
        object.sourceHeight,
        specifiedType: const FullType.nullable(int),
      );
    }
    if (object.surfaceVersion != null) {
      yield r'surfaceVersion';
      yield serializers.serialize(
        object.surfaceVersion,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.referenceRectPx != null) {
      yield r'referenceRectPx';
      yield serializers.serialize(
        object.referenceRectPx,
        specifiedType: const FullType.nullable(PrintRect),
      );
    }
    if (object.mappingKind != null) {
      yield r'mappingKind';
      yield serializers.serialize(
        object.mappingKind,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.templateReference != null) {
      yield r'templateReference';
      yield serializers.serialize(
        object.templateReference,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.exclusionsMm != null) {
      yield r'exclusionsMm';
      yield serializers.serialize(
        object.exclusionsMm,
        specifiedType: const FullType.nullable(BuiltList, [FullType(PrintRect)]),
      );
    }
    if (object.notes != null) {
      yield r'notes';
      yield serializers.serialize(
        object.notes,
        specifiedType: const FullType.nullable(String),
      );
    }
  }

  @override
  Object serialize(
    Serializers serializers,
    PrintProfileDefinition object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required PrintProfileDefinitionBuilder result,
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
        case r'face':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.face = valueDes;
          break;
        case r'title':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.title = valueDes;
          break;
        case r'widthMm':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(double),
          ) as double?;
          if (valueDes == null) continue;
          result.widthMm = valueDes;
          break;
        case r'heightMm':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(double),
          ) as double?;
          if (valueDes == null) continue;
          result.heightMm = valueDes;
          break;
        case r'dpi':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.dpi = valueDes;
          break;
        case r'bleedMm':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(double),
          ) as double?;
          if (valueDes == null) continue;
          result.bleedMm = valueDes;
          break;
        case r'safeInsetMm':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(double),
          ) as double?;
          if (valueDes == null) continue;
          result.safeInsetMm = valueDes;
          break;
        case r'process':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.process = valueDes;
          break;
        case r'colorSpace':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.colorSpace = valueDes;
          break;
        case r'colorProfile':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.colorProfile = valueDes;
          break;
        case r'outputFormat':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.outputFormat = valueDes;
          break;
        case r'allowTransparency':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(bool),
          ) as bool?;
          if (valueDes == null) continue;
          result.allowTransparency = valueDes;
          break;
        case r'sourceWidth':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.sourceWidth = valueDes;
          break;
        case r'sourceHeight':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(int),
          ) as int?;
          if (valueDes == null) continue;
          result.sourceHeight = valueDes;
          break;
        case r'surfaceVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.surfaceVersion = valueDes;
          break;
        case r'referenceRectPx':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(PrintRect),
          ) as PrintRect?;
          if (valueDes == null) continue;
          result.referenceRectPx.replace(valueDes);
          break;
        case r'mappingKind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.mappingKind = valueDes;
          break;
        case r'templateReference':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.templateReference = valueDes;
          break;
        case r'exclusionsMm':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(BuiltList, [FullType(PrintRect)]),
          ) as BuiltList<PrintRect>?;
          if (valueDes == null) continue;
          result.exclusionsMm.replace(valueDes);
          break;
        case r'notes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.notes = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  PrintProfileDefinition deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = PrintProfileDefinitionBuilder();
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
