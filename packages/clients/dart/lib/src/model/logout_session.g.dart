// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'logout_session.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LogoutSession extends LogoutSession {
  @override
  final String refreshToken;

  factory _$LogoutSession([void Function(LogoutSessionBuilder)? updates]) =>
      (LogoutSessionBuilder()..update(updates))._build();

  _$LogoutSession._({required this.refreshToken}) : super._();
  @override
  LogoutSession rebuild(void Function(LogoutSessionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  LogoutSessionBuilder toBuilder() => LogoutSessionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LogoutSession && refreshToken == other.refreshToken;
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
    return (newBuiltValueToStringHelper(r'LogoutSession')
          ..add('refreshToken', refreshToken))
        .toString();
  }
}

class LogoutSessionBuilder
    implements Builder<LogoutSession, LogoutSessionBuilder> {
  _$LogoutSession? _$v;

  String? _refreshToken;
  String? get refreshToken => _$this._refreshToken;
  set refreshToken(String? refreshToken) => _$this._refreshToken = refreshToken;

  LogoutSessionBuilder() {
    LogoutSession._defaults(this);
  }

  LogoutSessionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _refreshToken = $v.refreshToken;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LogoutSession other) {
    _$v = other as _$LogoutSession;
  }

  @override
  void update(void Function(LogoutSessionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LogoutSession build() => _build();

  _$LogoutSession _build() {
    final _$result = _$v ??
        _$LogoutSession._(
          refreshToken: BuiltValueNullFieldError.checkNotNull(
              refreshToken, r'LogoutSession', 'refreshToken'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
