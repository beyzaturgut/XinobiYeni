// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'refresh_session.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RefreshSession extends RefreshSession {
  @override
  final String refreshToken;

  factory _$RefreshSession([void Function(RefreshSessionBuilder)? updates]) =>
      (RefreshSessionBuilder()..update(updates))._build();

  _$RefreshSession._({required this.refreshToken}) : super._();
  @override
  RefreshSession rebuild(void Function(RefreshSessionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RefreshSessionBuilder toBuilder() => RefreshSessionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RefreshSession && refreshToken == other.refreshToken;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, refreshToken.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RefreshSession')
          ..add('refreshToken', refreshToken))
        .toString();
  }
}

class RefreshSessionBuilder
    implements Builder<RefreshSession, RefreshSessionBuilder> {
  _$RefreshSession? _$v;

  String? _refreshToken;
  String? get refreshToken => _$this._refreshToken;
  set refreshToken(String? refreshToken) => _$this._refreshToken = refreshToken;

  RefreshSessionBuilder() {
    RefreshSession._defaults(this);
  }

  RefreshSessionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _refreshToken = $v.refreshToken;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RefreshSession other) {
    _$v = other as _$RefreshSession;
  }

  @override
  void update(void Function(RefreshSessionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RefreshSession build() => _build();

  _$RefreshSession _build() {
    final _$result = _$v ??
        _$RefreshSession._(
          refreshToken: BuiltValueNullFieldError.checkNotNull(
              refreshToken, r'RefreshSession', 'refreshToken'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
