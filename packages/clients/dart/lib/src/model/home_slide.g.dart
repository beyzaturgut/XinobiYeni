// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'home_slide.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$HomeSlide extends HomeSlide {
  @override
  final int id;
  @override
  final String type;
  @override
  final String url;
  @override
  final String alt;
  @override
  final int durationSeconds;

  factory _$HomeSlide([void Function(HomeSlideBuilder)? updates]) =>
      (HomeSlideBuilder()..update(updates))._build();

  _$HomeSlide._(
      {required this.id,
      required this.type,
      required this.url,
      required this.alt,
      required this.durationSeconds})
      : super._();
  @override
  HomeSlide rebuild(void Function(HomeSlideBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  HomeSlideBuilder toBuilder() => HomeSlideBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is HomeSlide &&
        id == other.id &&
        type == other.type &&
        url == other.url &&
        alt == other.alt &&
        durationSeconds == other.durationSeconds;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, url.hashCode);
    _$hash = $jc(_$hash, alt.hashCode);
    _$hash = $jc(_$hash, durationSeconds.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'HomeSlide')
          ..add('id', id)
          ..add('type', type)
          ..add('url', url)
          ..add('alt', alt)
          ..add('durationSeconds', durationSeconds))
        .toString();
  }
}

class HomeSlideBuilder implements Builder<HomeSlide, HomeSlideBuilder> {
  _$HomeSlide? _$v;

  int? _id;
  int? get id => _$this._id;
  set id(int? id) => _$this._id = id;

  String? _type;
  String? get type => _$this._type;
  set type(String? type) => _$this._type = type;

  String? _url;
  String? get url => _$this._url;
  set url(String? url) => _$this._url = url;

  String? _alt;
  String? get alt => _$this._alt;
  set alt(String? alt) => _$this._alt = alt;

  int? _durationSeconds;
  int? get durationSeconds => _$this._durationSeconds;
  set durationSeconds(int? durationSeconds) =>
      _$this._durationSeconds = durationSeconds;

  HomeSlideBuilder() {
    HomeSlide._defaults(this);
  }

  HomeSlideBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _type = $v.type;
      _url = $v.url;
      _alt = $v.alt;
      _durationSeconds = $v.durationSeconds;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(HomeSlide other) {
    _$v = other as _$HomeSlide;
  }

  @override
  void update(void Function(HomeSlideBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  HomeSlide build() => _build();

  _$HomeSlide _build() {
    final _$result = _$v ??
        _$HomeSlide._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'HomeSlide', 'id'),
          type:
              BuiltValueNullFieldError.checkNotNull(type, r'HomeSlide', 'type'),
          url: BuiltValueNullFieldError.checkNotNull(url, r'HomeSlide', 'url'),
          alt: BuiltValueNullFieldError.checkNotNull(alt, r'HomeSlide', 'alt'),
          durationSeconds: BuiltValueNullFieldError.checkNotNull(
              durationSeconds, r'HomeSlide', 'durationSeconds'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
