// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'set_configuration_favorite.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SetConfigurationFavorite extends SetConfigurationFavorite {
  @override
  final bool favorite;

  factory _$SetConfigurationFavorite(
          [void Function(SetConfigurationFavoriteBuilder)? updates]) =>
      (SetConfigurationFavoriteBuilder()..update(updates))._build();

  _$SetConfigurationFavorite._({required this.favorite}) : super._();
  @override
  SetConfigurationFavorite rebuild(
          void Function(SetConfigurationFavoriteBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SetConfigurationFavoriteBuilder toBuilder() =>
      SetConfigurationFavoriteBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SetConfigurationFavorite && favorite == other.favorite;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, favorite.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SetConfigurationFavorite')
          ..add('favorite', favorite))
        .toString();
  }
}

class SetConfigurationFavoriteBuilder
    implements
        Builder<SetConfigurationFavorite, SetConfigurationFavoriteBuilder> {
  _$SetConfigurationFavorite? _$v;

  bool? _favorite;
  bool? get favorite => _$this._favorite;
  set favorite(bool? favorite) => _$this._favorite = favorite;

  SetConfigurationFavoriteBuilder() {
    SetConfigurationFavorite._defaults(this);
  }

  SetConfigurationFavoriteBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _favorite = $v.favorite;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SetConfigurationFavorite other) {
    _$v = other as _$SetConfigurationFavorite;
  }

  @override
  void update(void Function(SetConfigurationFavoriteBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SetConfigurationFavorite build() => _build();

  _$SetConfigurationFavorite _build() {
    final _$result = _$v ??
        _$SetConfigurationFavorite._(
          favorite: BuiltValueNullFieldError.checkNotNull(
              favorite, r'SetConfigurationFavorite', 'favorite'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
