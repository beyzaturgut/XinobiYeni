// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'surface_media.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SurfaceMedia extends SurfaceMedia {
  @override
  final String url;
  @override
  final String sha256;

  factory _$SurfaceMedia([void Function(SurfaceMediaBuilder)? updates]) =>
      (SurfaceMediaBuilder()..update(updates))._build();

  _$SurfaceMedia._({required this.url, required this.sha256}) : super._();
  @override
  SurfaceMedia rebuild(void Function(SurfaceMediaBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SurfaceMediaBuilder toBuilder() => SurfaceMediaBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SurfaceMedia && url == other.url && sha256 == other.sha256;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, url.hashCode);
    _$hash = $jc(_$hash, sha256.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SurfaceMedia')
          ..add('url', url)
          ..add('sha256', sha256))
        .toString();
  }
}

class SurfaceMediaBuilder
    implements Builder<SurfaceMedia, SurfaceMediaBuilder> {
  _$SurfaceMedia? _$v;

  String? _url;
  String? get url => _$this._url;
  set url(String? url) => _$this._url = url;

  String? _sha256;
  String? get sha256 => _$this._sha256;
  set sha256(String? sha256) => _$this._sha256 = sha256;

  SurfaceMediaBuilder() {
    SurfaceMedia._defaults(this);
  }

  SurfaceMediaBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _url = $v.url;
      _sha256 = $v.sha256;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SurfaceMedia other) {
    _$v = other as _$SurfaceMedia;
  }

  @override
  void update(void Function(SurfaceMediaBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SurfaceMedia build() => _build();

  _$SurfaceMedia _build() {
    final _$result = _$v ??
        _$SurfaceMedia._(
          url: BuiltValueNullFieldError.checkNotNull(
              url, r'SurfaceMedia', 'url'),
          sha256: BuiltValueNullFieldError.checkNotNull(
              sha256, r'SurfaceMedia', 'sha256'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
