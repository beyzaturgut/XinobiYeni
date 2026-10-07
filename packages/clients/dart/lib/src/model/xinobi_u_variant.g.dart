// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'xinobi_u_variant.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$XinobiUVariant extends XinobiUVariant {
  @override
  final String id;
  @override
  final String color;
  @override
  final String? hex;
  @override
  final String? imageUrl;

  factory _$XinobiUVariant([void Function(XinobiUVariantBuilder)? updates]) =>
      (XinobiUVariantBuilder()..update(updates))._build();

  _$XinobiUVariant._(
      {required this.id, required this.color, this.hex, this.imageUrl})
      : super._();
  @override
  XinobiUVariant rebuild(void Function(XinobiUVariantBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  XinobiUVariantBuilder toBuilder() => XinobiUVariantBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is XinobiUVariant &&
        id == other.id &&
        color == other.color &&
        hex == other.hex &&
        imageUrl == other.imageUrl;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, color.hashCode);
    _$hash = $jc(_$hash, hex.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'XinobiUVariant')
          ..add('id', id)
          ..add('color', color)
          ..add('hex', hex)
          ..add('imageUrl', imageUrl))
        .toString();
  }
}

class XinobiUVariantBuilder
    implements Builder<XinobiUVariant, XinobiUVariantBuilder> {
  _$XinobiUVariant? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _color;
  String? get color => _$this._color;
  set color(String? color) => _$this._color = color;

  String? _hex;
  String? get hex => _$this._hex;
  set hex(String? hex) => _$this._hex = hex;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  XinobiUVariantBuilder() {
    XinobiUVariant._defaults(this);
  }

  XinobiUVariantBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _color = $v.color;
      _hex = $v.hex;
      _imageUrl = $v.imageUrl;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(XinobiUVariant other) {
    _$v = other as _$XinobiUVariant;
  }

  @override
  void update(void Function(XinobiUVariantBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  XinobiUVariant build() => _build();

  _$XinobiUVariant _build() {
    final _$result = _$v ??
        _$XinobiUVariant._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'XinobiUVariant', 'id'),
          color: BuiltValueNullFieldError.checkNotNull(
              color, r'XinobiUVariant', 'color'),
          hex: hex,
          imageUrl: imageUrl,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
