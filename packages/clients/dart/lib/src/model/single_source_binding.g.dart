// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'single_source_binding.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SingleSourceBinding extends SingleSourceBinding {
  @override
  final String productId;
  @override
  final int profileRevision;
  @override
  final int sourceRevision;
  @override
  final String surfaceId;
  @override
  final String productSourceSha256;
  @override
  final String maskSha256;
  @override
  final int width;
  @override
  final int height;
  @override
  final String fulfillmentVariantId;

  factory _$SingleSourceBinding(
          [void Function(SingleSourceBindingBuilder)? updates]) =>
      (SingleSourceBindingBuilder()..update(updates))._build();

  _$SingleSourceBinding._(
      {required this.productId,
      required this.profileRevision,
      required this.sourceRevision,
      required this.surfaceId,
      required this.productSourceSha256,
      required this.maskSha256,
      required this.width,
      required this.height,
      required this.fulfillmentVariantId})
      : super._();
  @override
  SingleSourceBinding rebuild(
          void Function(SingleSourceBindingBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SingleSourceBindingBuilder toBuilder() =>
      SingleSourceBindingBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SingleSourceBinding &&
        productId == other.productId &&
        profileRevision == other.profileRevision &&
        sourceRevision == other.sourceRevision &&
        surfaceId == other.surfaceId &&
        productSourceSha256 == other.productSourceSha256 &&
        maskSha256 == other.maskSha256 &&
        width == other.width &&
        height == other.height &&
        fulfillmentVariantId == other.fulfillmentVariantId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, profileRevision.hashCode);
    _$hash = $jc(_$hash, sourceRevision.hashCode);
    _$hash = $jc(_$hash, surfaceId.hashCode);
    _$hash = $jc(_$hash, productSourceSha256.hashCode);
    _$hash = $jc(_$hash, maskSha256.hashCode);
    _$hash = $jc(_$hash, width.hashCode);
    _$hash = $jc(_$hash, height.hashCode);
    _$hash = $jc(_$hash, fulfillmentVariantId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SingleSourceBinding')
          ..add('productId', productId)
          ..add('profileRevision', profileRevision)
          ..add('sourceRevision', sourceRevision)
          ..add('surfaceId', surfaceId)
          ..add('productSourceSha256', productSourceSha256)
          ..add('maskSha256', maskSha256)
          ..add('width', width)
          ..add('height', height)
          ..add('fulfillmentVariantId', fulfillmentVariantId))
        .toString();
  }
}

class SingleSourceBindingBuilder
    implements Builder<SingleSourceBinding, SingleSourceBindingBuilder> {
  _$SingleSourceBinding? _$v;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  int? _profileRevision;
  int? get profileRevision => _$this._profileRevision;
  set profileRevision(int? profileRevision) =>
      _$this._profileRevision = profileRevision;

  int? _sourceRevision;
  int? get sourceRevision => _$this._sourceRevision;
  set sourceRevision(int? sourceRevision) =>
      _$this._sourceRevision = sourceRevision;

  String? _surfaceId;
  String? get surfaceId => _$this._surfaceId;
  set surfaceId(String? surfaceId) => _$this._surfaceId = surfaceId;

  String? _productSourceSha256;
  String? get productSourceSha256 => _$this._productSourceSha256;
  set productSourceSha256(String? productSourceSha256) =>
      _$this._productSourceSha256 = productSourceSha256;

  String? _maskSha256;
  String? get maskSha256 => _$this._maskSha256;
  set maskSha256(String? maskSha256) => _$this._maskSha256 = maskSha256;

  int? _width;
  int? get width => _$this._width;
  set width(int? width) => _$this._width = width;

  int? _height;
  int? get height => _$this._height;
  set height(int? height) => _$this._height = height;

  String? _fulfillmentVariantId;
  String? get fulfillmentVariantId => _$this._fulfillmentVariantId;
  set fulfillmentVariantId(String? fulfillmentVariantId) =>
      _$this._fulfillmentVariantId = fulfillmentVariantId;

  SingleSourceBindingBuilder() {
    SingleSourceBinding._defaults(this);
  }

  SingleSourceBindingBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _profileRevision = $v.profileRevision;
      _sourceRevision = $v.sourceRevision;
      _surfaceId = $v.surfaceId;
      _productSourceSha256 = $v.productSourceSha256;
      _maskSha256 = $v.maskSha256;
      _width = $v.width;
      _height = $v.height;
      _fulfillmentVariantId = $v.fulfillmentVariantId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SingleSourceBinding other) {
    _$v = other as _$SingleSourceBinding;
  }

  @override
  void update(void Function(SingleSourceBindingBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SingleSourceBinding build() => _build();

  _$SingleSourceBinding _build() {
    final _$result = _$v ??
        _$SingleSourceBinding._(
          productId: BuiltValueNullFieldError.checkNotNull(
              productId, r'SingleSourceBinding', 'productId'),
          profileRevision: BuiltValueNullFieldError.checkNotNull(
              profileRevision, r'SingleSourceBinding', 'profileRevision'),
          sourceRevision: BuiltValueNullFieldError.checkNotNull(
              sourceRevision, r'SingleSourceBinding', 'sourceRevision'),
          surfaceId: BuiltValueNullFieldError.checkNotNull(
              surfaceId, r'SingleSourceBinding', 'surfaceId'),
          productSourceSha256: BuiltValueNullFieldError.checkNotNull(
              productSourceSha256,
              r'SingleSourceBinding',
              'productSourceSha256'),
          maskSha256: BuiltValueNullFieldError.checkNotNull(
              maskSha256, r'SingleSourceBinding', 'maskSha256'),
          width: BuiltValueNullFieldError.checkNotNull(
              width, r'SingleSourceBinding', 'width'),
          height: BuiltValueNullFieldError.checkNotNull(
              height, r'SingleSourceBinding', 'height'),
          fulfillmentVariantId: BuiltValueNullFieldError.checkNotNull(
              fulfillmentVariantId,
              r'SingleSourceBinding',
              'fulfillmentVariantId'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
