// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'print_profile_definition.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PrintProfileDefinition extends PrintProfileDefinition {
  @override
  final String productId;
  @override
  final String variantId;
  @override
  final String face;
  @override
  final String title;
  @override
  final double? widthMm;
  @override
  final double? heightMm;
  @override
  final int? dpi;
  @override
  final double? bleedMm;
  @override
  final double? safeInsetMm;
  @override
  final String? process;
  @override
  final String? colorSpace;
  @override
  final String? colorProfile;
  @override
  final String? outputFormat;
  @override
  final bool? allowTransparency;
  @override
  final int? sourceWidth;
  @override
  final int? sourceHeight;
  @override
  final String? surfaceVersion;
  @override
  final PrintRect? referenceRectPx;
  @override
  final String? mappingKind;
  @override
  final String? templateReference;
  @override
  final BuiltList<PrintRect>? exclusionsMm;
  @override
  final String? notes;

  factory _$PrintProfileDefinition(
          [void Function(PrintProfileDefinitionBuilder)? updates]) =>
      (PrintProfileDefinitionBuilder()..update(updates))._build();

  _$PrintProfileDefinition._(
      {required this.productId,
      required this.variantId,
      required this.face,
      required this.title,
      this.widthMm,
      this.heightMm,
      this.dpi,
      this.bleedMm,
      this.safeInsetMm,
      this.process,
      this.colorSpace,
      this.colorProfile,
      this.outputFormat,
      this.allowTransparency,
      this.sourceWidth,
      this.sourceHeight,
      this.surfaceVersion,
      this.referenceRectPx,
      this.mappingKind,
      this.templateReference,
      this.exclusionsMm,
      this.notes})
      : super._();
  @override
  PrintProfileDefinition rebuild(
          void Function(PrintProfileDefinitionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PrintProfileDefinitionBuilder toBuilder() =>
      PrintProfileDefinitionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PrintProfileDefinition &&
        productId == other.productId &&
        variantId == other.variantId &&
        face == other.face &&
        title == other.title &&
        widthMm == other.widthMm &&
        heightMm == other.heightMm &&
        dpi == other.dpi &&
        bleedMm == other.bleedMm &&
        safeInsetMm == other.safeInsetMm &&
        process == other.process &&
        colorSpace == other.colorSpace &&
        colorProfile == other.colorProfile &&
        outputFormat == other.outputFormat &&
        allowTransparency == other.allowTransparency &&
        sourceWidth == other.sourceWidth &&
        sourceHeight == other.sourceHeight &&
        surfaceVersion == other.surfaceVersion &&
        referenceRectPx == other.referenceRectPx &&
        mappingKind == other.mappingKind &&
        templateReference == other.templateReference &&
        exclusionsMm == other.exclusionsMm &&
        notes == other.notes;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, face.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, widthMm.hashCode);
    _$hash = $jc(_$hash, heightMm.hashCode);
    _$hash = $jc(_$hash, dpi.hashCode);
    _$hash = $jc(_$hash, bleedMm.hashCode);
    _$hash = $jc(_$hash, safeInsetMm.hashCode);
    _$hash = $jc(_$hash, process.hashCode);
    _$hash = $jc(_$hash, colorSpace.hashCode);
    _$hash = $jc(_$hash, colorProfile.hashCode);
    _$hash = $jc(_$hash, outputFormat.hashCode);
    _$hash = $jc(_$hash, allowTransparency.hashCode);
    _$hash = $jc(_$hash, sourceWidth.hashCode);
    _$hash = $jc(_$hash, sourceHeight.hashCode);
    _$hash = $jc(_$hash, surfaceVersion.hashCode);
    _$hash = $jc(_$hash, referenceRectPx.hashCode);
    _$hash = $jc(_$hash, mappingKind.hashCode);
    _$hash = $jc(_$hash, templateReference.hashCode);
    _$hash = $jc(_$hash, exclusionsMm.hashCode);
    _$hash = $jc(_$hash, notes.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PrintProfileDefinition')
          ..add('productId', productId)
          ..add('variantId', variantId)
          ..add('face', face)
          ..add('title', title)
          ..add('widthMm', widthMm)
          ..add('heightMm', heightMm)
          ..add('dpi', dpi)
          ..add('bleedMm', bleedMm)
          ..add('safeInsetMm', safeInsetMm)
          ..add('process', process)
          ..add('colorSpace', colorSpace)
          ..add('colorProfile', colorProfile)
          ..add('outputFormat', outputFormat)
          ..add('allowTransparency', allowTransparency)
          ..add('sourceWidth', sourceWidth)
          ..add('sourceHeight', sourceHeight)
          ..add('surfaceVersion', surfaceVersion)
          ..add('referenceRectPx', referenceRectPx)
          ..add('mappingKind', mappingKind)
          ..add('templateReference', templateReference)
          ..add('exclusionsMm', exclusionsMm)
          ..add('notes', notes))
        .toString();
  }
}

class PrintProfileDefinitionBuilder
    implements Builder<PrintProfileDefinition, PrintProfileDefinitionBuilder> {
  _$PrintProfileDefinition? _$v;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  String? _variantId;
  String? get variantId => _$this._variantId;
  set variantId(String? variantId) => _$this._variantId = variantId;

  String? _face;
  String? get face => _$this._face;
  set face(String? face) => _$this._face = face;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  double? _widthMm;
  double? get widthMm => _$this._widthMm;
  set widthMm(double? widthMm) => _$this._widthMm = widthMm;

  double? _heightMm;
  double? get heightMm => _$this._heightMm;
  set heightMm(double? heightMm) => _$this._heightMm = heightMm;

  int? _dpi;
  int? get dpi => _$this._dpi;
  set dpi(int? dpi) => _$this._dpi = dpi;

  double? _bleedMm;
  double? get bleedMm => _$this._bleedMm;
  set bleedMm(double? bleedMm) => _$this._bleedMm = bleedMm;

  double? _safeInsetMm;
  double? get safeInsetMm => _$this._safeInsetMm;
  set safeInsetMm(double? safeInsetMm) => _$this._safeInsetMm = safeInsetMm;

  String? _process;
  String? get process => _$this._process;
  set process(String? process) => _$this._process = process;

  String? _colorSpace;
  String? get colorSpace => _$this._colorSpace;
  set colorSpace(String? colorSpace) => _$this._colorSpace = colorSpace;

  String? _colorProfile;
  String? get colorProfile => _$this._colorProfile;
  set colorProfile(String? colorProfile) => _$this._colorProfile = colorProfile;

  String? _outputFormat;
  String? get outputFormat => _$this._outputFormat;
  set outputFormat(String? outputFormat) => _$this._outputFormat = outputFormat;

  bool? _allowTransparency;
  bool? get allowTransparency => _$this._allowTransparency;
  set allowTransparency(bool? allowTransparency) =>
      _$this._allowTransparency = allowTransparency;

  int? _sourceWidth;
  int? get sourceWidth => _$this._sourceWidth;
  set sourceWidth(int? sourceWidth) => _$this._sourceWidth = sourceWidth;

  int? _sourceHeight;
  int? get sourceHeight => _$this._sourceHeight;
  set sourceHeight(int? sourceHeight) => _$this._sourceHeight = sourceHeight;

  String? _surfaceVersion;
  String? get surfaceVersion => _$this._surfaceVersion;
  set surfaceVersion(String? surfaceVersion) =>
      _$this._surfaceVersion = surfaceVersion;

  PrintRectBuilder? _referenceRectPx;
  PrintRectBuilder get referenceRectPx =>
      _$this._referenceRectPx ??= PrintRectBuilder();
  set referenceRectPx(PrintRectBuilder? referenceRectPx) =>
      _$this._referenceRectPx = referenceRectPx;

  String? _mappingKind;
  String? get mappingKind => _$this._mappingKind;
  set mappingKind(String? mappingKind) => _$this._mappingKind = mappingKind;

  String? _templateReference;
  String? get templateReference => _$this._templateReference;
  set templateReference(String? templateReference) =>
      _$this._templateReference = templateReference;

  ListBuilder<PrintRect>? _exclusionsMm;
  ListBuilder<PrintRect> get exclusionsMm =>
      _$this._exclusionsMm ??= ListBuilder<PrintRect>();
  set exclusionsMm(ListBuilder<PrintRect>? exclusionsMm) =>
      _$this._exclusionsMm = exclusionsMm;

  String? _notes;
  String? get notes => _$this._notes;
  set notes(String? notes) => _$this._notes = notes;

  PrintProfileDefinitionBuilder() {
    PrintProfileDefinition._defaults(this);
  }

  PrintProfileDefinitionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _variantId = $v.variantId;
      _face = $v.face;
      _title = $v.title;
      _widthMm = $v.widthMm;
      _heightMm = $v.heightMm;
      _dpi = $v.dpi;
      _bleedMm = $v.bleedMm;
      _safeInsetMm = $v.safeInsetMm;
      _process = $v.process;
      _colorSpace = $v.colorSpace;
      _colorProfile = $v.colorProfile;
      _outputFormat = $v.outputFormat;
      _allowTransparency = $v.allowTransparency;
      _sourceWidth = $v.sourceWidth;
      _sourceHeight = $v.sourceHeight;
      _surfaceVersion = $v.surfaceVersion;
      _referenceRectPx = $v.referenceRectPx?.toBuilder();
      _mappingKind = $v.mappingKind;
      _templateReference = $v.templateReference;
      _exclusionsMm = $v.exclusionsMm?.toBuilder();
      _notes = $v.notes;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PrintProfileDefinition other) {
    _$v = other as _$PrintProfileDefinition;
  }

  @override
  void update(void Function(PrintProfileDefinitionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PrintProfileDefinition build() => _build();

  _$PrintProfileDefinition _build() {
    _$PrintProfileDefinition _$result;
    try {
      _$result = _$v ??
          _$PrintProfileDefinition._(
            productId: BuiltValueNullFieldError.checkNotNull(
                productId, r'PrintProfileDefinition', 'productId'),
            variantId: BuiltValueNullFieldError.checkNotNull(
                variantId, r'PrintProfileDefinition', 'variantId'),
            face: BuiltValueNullFieldError.checkNotNull(
                face, r'PrintProfileDefinition', 'face'),
            title: BuiltValueNullFieldError.checkNotNull(
                title, r'PrintProfileDefinition', 'title'),
            widthMm: widthMm,
            heightMm: heightMm,
            dpi: dpi,
            bleedMm: bleedMm,
            safeInsetMm: safeInsetMm,
            process: process,
            colorSpace: colorSpace,
            colorProfile: colorProfile,
            outputFormat: outputFormat,
            allowTransparency: allowTransparency,
            sourceWidth: sourceWidth,
            sourceHeight: sourceHeight,
            surfaceVersion: surfaceVersion,
            referenceRectPx: _referenceRectPx?.build(),
            mappingKind: mappingKind,
            templateReference: templateReference,
            exclusionsMm: _exclusionsMm?.build(),
            notes: notes,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'referenceRectPx';
        _referenceRectPx?.build();

        _$failedField = 'exclusionsMm';
        _exclusionsMm?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'PrintProfileDefinition', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
