// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'auth_session.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AuthSession extends AuthSession {
  @override
  final String accessToken;
  @override
  final DateTime accessTokenExpiresAt;
  @override
  final String refreshToken;
  @override
  final DateTime refreshTokenExpiresAt;
  @override
  final AccountProfile account;

  factory _$AuthSession([void Function(AuthSessionBuilder)? updates]) =>
      (AuthSessionBuilder()..update(updates))._build();

  _$AuthSession._(
      {required this.accessToken,
      required this.accessTokenExpiresAt,
      required this.refreshToken,
      required this.refreshTokenExpiresAt,
      required this.account})
      : super._();
  @override
  AuthSession rebuild(void Function(AuthSessionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AuthSessionBuilder toBuilder() => AuthSessionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuthSession &&
        accessToken == other.accessToken &&
        accessTokenExpiresAt == other.accessTokenExpiresAt &&
        refreshToken == other.refreshToken &&
        refreshTokenExpiresAt == other.refreshTokenExpiresAt &&
        account == other.account;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, accessToken.hashCode);
    _$hash = $jc(_$hash, accessTokenExpiresAt.hashCode);
    _$hash = $jc(_$hash, refreshToken.hashCode);
    _$hash = $jc(_$hash, refreshTokenExpiresAt.hashCode);
    _$hash = $jc(_$hash, account.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AuthSession')
          ..add('accessToken', accessToken)
          ..add('accessTokenExpiresAt', accessTokenExpiresAt)
          ..add('refreshToken', refreshToken)
          ..add('refreshTokenExpiresAt', refreshTokenExpiresAt)
          ..add('account', account))
        .toString();
  }
}

class AuthSessionBuilder implements Builder<AuthSession, AuthSessionBuilder> {
  _$AuthSession? _$v;

  String? _accessToken;
  String? get accessToken => _$this._accessToken;
  set accessToken(String? accessToken) => _$this._accessToken = accessToken;

  DateTime? _accessTokenExpiresAt;
  DateTime? get accessTokenExpiresAt => _$this._accessTokenExpiresAt;
  set accessTokenExpiresAt(DateTime? accessTokenExpiresAt) =>
      _$this._accessTokenExpiresAt = accessTokenExpiresAt;

  String? _refreshToken;
  String? get refreshToken => _$this._refreshToken;
  set refreshToken(String? refreshToken) => _$this._refreshToken = refreshToken;

  DateTime? _refreshTokenExpiresAt;
  DateTime? get refreshTokenExpiresAt => _$this._refreshTokenExpiresAt;
  set refreshTokenExpiresAt(DateTime? refreshTokenExpiresAt) =>
      _$this._refreshTokenExpiresAt = refreshTokenExpiresAt;

  AccountProfileBuilder? _account;
  AccountProfileBuilder get account =>
      _$this._account ??= AccountProfileBuilder();
  set account(AccountProfileBuilder? account) => _$this._account = account;

  AuthSessionBuilder() {
    AuthSession._defaults(this);
  }

  AuthSessionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _accessToken = $v.accessToken;
      _accessTokenExpiresAt = $v.accessTokenExpiresAt;
      _refreshToken = $v.refreshToken;
      _refreshTokenExpiresAt = $v.refreshTokenExpiresAt;
      _account = $v.account.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuthSession other) {
    _$v = other as _$AuthSession;
  }

  @override
  void update(void Function(AuthSessionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuthSession build() => _build();

  _$AuthSession _build() {
    _$AuthSession _$result;
    try {
      _$result = _$v ??
          _$AuthSession._(
            accessToken: BuiltValueNullFieldError.checkNotNull(
                accessToken, r'AuthSession', 'accessToken'),
            accessTokenExpiresAt: BuiltValueNullFieldError.checkNotNull(
                accessTokenExpiresAt, r'AuthSession', 'accessTokenExpiresAt'),
            refreshToken: BuiltValueNullFieldError.checkNotNull(
                refreshToken, r'AuthSession', 'refreshToken'),
            refreshTokenExpiresAt: BuiltValueNullFieldError.checkNotNull(
                refreshTokenExpiresAt, r'AuthSession', 'refreshTokenExpiresAt'),
            account: account.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'account';
        account.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AuthSession', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
