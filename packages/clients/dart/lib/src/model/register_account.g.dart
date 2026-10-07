// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'register_account.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RegisterAccount extends RegisterAccount {
  @override
  final String name;
  @override
  final String email;
  @override
  final String password;
  @override
  final String verificationId;
  @override
  final String verificationCode;

  factory _$RegisterAccount([void Function(RegisterAccountBuilder)? updates]) =>
      (RegisterAccountBuilder()..update(updates))._build();

  _$RegisterAccount._(
      {required this.name,
      required this.email,
      required this.password,
      required this.verificationId,
      required this.verificationCode})
      : super._();
  @override
  RegisterAccount rebuild(void Function(RegisterAccountBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RegisterAccountBuilder toBuilder() => RegisterAccountBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RegisterAccount &&
        name == other.name &&
        email == other.email &&
        password == other.password &&
        verificationId == other.verificationId &&
        verificationCode == other.verificationCode;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, password.hashCode);
    _$hash = $jc(_$hash, verificationId.hashCode);
    _$hash = $jc(_$hash, verificationCode.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RegisterAccount')
          ..add('name', name)
          ..add('email', email)
          ..add('password', password)
          ..add('verificationId', verificationId)
          ..add('verificationCode', verificationCode))
        .toString();
  }
}

class RegisterAccountBuilder
    implements Builder<RegisterAccount, RegisterAccountBuilder> {
  _$RegisterAccount? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _password;
  String? get password => _$this._password;
  set password(String? password) => _$this._password = password;

  String? _verificationId;
  String? get verificationId => _$this._verificationId;
  set verificationId(String? verificationId) =>
      _$this._verificationId = verificationId;

  String? _verificationCode;
  String? get verificationCode => _$this._verificationCode;
  set verificationCode(String? verificationCode) =>
      _$this._verificationCode = verificationCode;

  RegisterAccountBuilder() {
    RegisterAccount._defaults(this);
  }

  RegisterAccountBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _email = $v.email;
      _password = $v.password;
      _verificationId = $v.verificationId;
      _verificationCode = $v.verificationCode;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RegisterAccount other) {
    _$v = other as _$RegisterAccount;
  }

  @override
  void update(void Function(RegisterAccountBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RegisterAccount build() => _build();

  _$RegisterAccount _build() {
    final _$result = _$v ??
        _$RegisterAccount._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'RegisterAccount', 'name'),
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'RegisterAccount', 'email'),
          password: BuiltValueNullFieldError.checkNotNull(
              password, r'RegisterAccount', 'password'),
          verificationId: BuiltValueNullFieldError.checkNotNull(
              verificationId, r'RegisterAccount', 'verificationId'),
          verificationCode: BuiltValueNullFieldError.checkNotNull(
              verificationCode, r'RegisterAccount', 'verificationCode'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
