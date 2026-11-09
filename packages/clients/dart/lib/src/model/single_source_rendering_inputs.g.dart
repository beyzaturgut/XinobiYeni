// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'single_source_rendering_inputs.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SingleSourceRenderingInputs extends SingleSourceRenderingInputs {
  @override
  final String surfaceVersion;
  @override
  final String sourceMediaVersion;
  @override
  final int width;
  @override
  final int height;
  @override
  final SurfaceMedia source_;
  @override
  final SurfaceMedia mask;
  @override
  final bool? brandingRequired;
  @override
  final SurfaceMedia? branding;

  factory _$SingleSourceRenderingInputs(
          [void Function(SingleSourceRenderingInputsBuilder)? updates]) =>
      (SingleSourceRenderingInputsBuilder()..update(updates))._build();

  _$SingleSourceRenderingInputs._(
      {required this.surfaceVersion,
      required this.sourceMediaVersion,
      required this.width,
      required this.height,
      required this.source_,
      required this.mask,
      this.brandingRequired,
      this.branding})
      : super._();
  @override
  SingleSourceRenderingInputs rebuild(
          void Function(SingleSourceRenderingInputsBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SingleSourceRenderingInputsBuilder toBuilder() =>
      SingleSourceRenderingInputsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SingleSourceRenderingInputs &&
        surfaceVersion == other.surfaceVersion &&
        sourceMediaVersion == other.sourceMediaVersion &&
        width == other.width &&
        height == other.height &&
        source_ == other.source_ &&
        mask == other.mask &&
        brandingRequired == other.brandingRequired &&
        branding == other.branding;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, surfaceVersion.hashCode);
    _$hash = $jc(_$hash, sourceMediaVersion.hashCode);
    _$hash = $jc(_$hash, width.hashCode);
    _$hash = $jc(_$hash, height.hashCode);
    _$hash = $jc(_$hash, source_.hashCode);
    _$hash = $jc(_$hash, mask.hashCode);
    _$hash = $jc(_$hash, brandingRequired.hashCode);
    _$hash = $jc(_$hash, branding.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SingleSourceRenderingInputs')
          ..add('surfaceVersion', surfaceVersion)
          ..add('sourceMediaVersion', sourceMediaVersion)
          ..add('width', width)
          ..add('height', height)
          ..add('source_', source_)
          ..add('mask', mask)
          ..add('brandingRequired', brandingRequired)
          ..add('branding', branding))
        .toString();
  }
}

class SingleSourceRenderingInputsBuilder
    implements
        Builder<SingleSourceRenderingInputs,
            SingleSourceRenderingInputsBuilder> {
  _$SingleSourceRenderingInputs? _$v;

  String? _surfaceVersion;
  String? get surfaceVersion => _$this._surfaceVersion;
  set surfaceVersion(String? surfaceVersion) =>
      _$this._surfaceVersion = surfaceVersion;

  String? _sourceMediaVersion;
  String? get sourceMediaVersion => _$this._sourceMediaVersion;
  set sourceMediaVersion(String? sourceMediaVersion) =>
      _$this._sourceMediaVersion = sourceMediaVersion;

  int? _width;
  int? get width => _$this._width;
  set width(int? width) => _$this._width = width;

  int? _height;
  int? get height => _$this._height;
  set height(int? height) => _$this._height = height;

  SurfaceMediaBuilder? _source_;
  SurfaceMediaBuilder get source_ => _$this._source_ ??= SurfaceMediaBuilder();
  set source_(SurfaceMediaBuilder? source_) => _$this._source_ = source_;

  SurfaceMediaBuilder? _mask;
  SurfaceMediaBuilder get mask => _$this._mask ??= SurfaceMediaBuilder();
  set mask(SurfaceMediaBuilder? mask) => _$this._mask = mask;

  bool? _brandingRequired;
  bool? get brandingRequired => _$this._brandingRequired;
  set brandingRequired(bool? brandingRequired) =>
      _$this._brandingRequired = brandingRequired;

  SurfaceMediaBuilder? _branding;
  SurfaceMediaBuilder get branding =>
      _$this._branding ??= SurfaceMediaBuilder();
  set branding(SurfaceMediaBuilder? branding) => _$this._branding = branding;

  SingleSourceRenderingInputsBuilder() {
    SingleSourceRenderingInputs._defaults(this);
  }

  SingleSourceRenderingInputsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _surfaceVersion = $v.surfaceVersion;
      _sourceMediaVersion = $v.sourceMediaVersion;
      _width = $v.width;
      _height = $v.height;
      _source_ = $v.source_.toBuilder();
      _mask = $v.mask.toBuilder();
      _brandingRequired = $v.brandingRequired;
      _branding = $v.branding?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SingleSourceRenderingInputs other) {
    _$v = other as _$SingleSourceRenderingInputs;
  }

  @override
  void update(void Function(SingleSourceRenderingInputsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SingleSourceRenderingInputs build() => _build();

  _$SingleSourceRenderingInputs _build() {
    _$SingleSourceRenderingInputs _$result;
    try {
      _$result = _$v ??
          _$SingleSourceRenderingInputs._(
            surfaceVersion: BuiltValueNullFieldError.checkNotNull(
                surfaceVersion,
                r'SingleSourceRenderingInputs',
                'surfaceVersion'),
            sourceMediaVersion: BuiltValueNullFieldError.checkNotNull(
                sourceMediaVersion,
                r'SingleSourceRenderingInputs',
                'sourceMediaVersion'),
            width: BuiltValueNullFieldError.checkNotNull(
                width, r'SingleSourceRenderingInputs', 'width'),
            height: BuiltValueNullFieldError.checkNotNull(
                height, r'SingleSourceRenderingInputs', 'height'),
            source_: source_.build(),
            mask: mask.build(),
            brandingRequired: brandingRequired,
            branding: _branding?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'source_';
        source_.build();
        _$failedField = 'mask';
        mask.build();

        _$failedField = 'branding';
        _branding?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SingleSourceRenderingInputs', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
