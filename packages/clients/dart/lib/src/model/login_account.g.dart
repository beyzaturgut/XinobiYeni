// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'login_account.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$LoginAccount extends LoginAccount {
  @override
  final String email;
  @override
  final String password;

  factory _$LoginAccount([void Function(LoginAccountBuilder)? updates]) =>
      (LoginAccountBuilder()..update(updates))._build();

  _$LoginAccount._({required this.email, required this.password}) : super._();
  @override
  LoginAccount rebuild(void Function(LoginAccountBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  LoginAccountBuilder toBuilder() => LoginAccountBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is LoginAccount &&
        email == other.email &&
        password == other.password;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, password.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'LoginAccount')
          ..add('email', email)
          ..add('password', password))
        .toString();
  }
}

class LoginAccountBuilder
    implements Builder<LoginAccount, LoginAccountBuilder> {
  _$LoginAccount? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _password;
  String? get password => _$this._password;
  set password(String? password) => _$this._password = password;

  LoginAccountBuilder() {
    LoginAccount._defaults(this);
  }

  LoginAccountBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _password = $v.password;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(LoginAccount other) {
    _$v = other as _$LoginAccount;
  }

  @override
  void update(void Function(LoginAccountBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  LoginAccount build() => _build();

  _$LoginAccount _build() {
    final _$result = _$v ??
        _$LoginAccount._(
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'LoginAccount', 'email'),
          password: BuiltValueNullFieldError.checkNotNull(
              password, r'LoginAccount', 'password'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
