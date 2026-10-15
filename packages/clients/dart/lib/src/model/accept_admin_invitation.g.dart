// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'accept_admin_invitation.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AcceptAdminInvitation extends AcceptAdminInvitation {
  @override
  final String token;
  @override
  final String name;
  @override
  final String password;

  factory _$AcceptAdminInvitation(
          [void Function(AcceptAdminInvitationBuilder)? updates]) =>
      (AcceptAdminInvitationBuilder()..update(updates))._build();

  _$AcceptAdminInvitation._(
      {required this.token, required this.name, required this.password})
      : super._();
  @override
  AcceptAdminInvitation rebuild(
          void Function(AcceptAdminInvitationBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AcceptAdminInvitationBuilder toBuilder() =>
      AcceptAdminInvitationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AcceptAdminInvitation &&
        token == other.token &&
        name == other.name &&
        password == other.password;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, token.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, password.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AcceptAdminInvitation')
          ..add('token', token)
          ..add('name', name)
          ..add('password', password))
        .toString();
  }
}

class AcceptAdminInvitationBuilder
    implements Builder<AcceptAdminInvitation, AcceptAdminInvitationBuilder> {
  _$AcceptAdminInvitation? _$v;

  String? _token;
  String? get token => _$this._token;
  set token(String? token) => _$this._token = token;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _password;
  String? get password => _$this._password;
  set password(String? password) => _$this._password = password;

  AcceptAdminInvitationBuilder() {
    AcceptAdminInvitation._defaults(this);
  }

  AcceptAdminInvitationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _token = $v.token;
      _name = $v.name;
      _password = $v.password;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AcceptAdminInvitation other) {
    _$v = other as _$AcceptAdminInvitation;
  }

  @override
  void update(void Function(AcceptAdminInvitationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AcceptAdminInvitation build() => _build();

  _$AcceptAdminInvitation _build() {
    final _$result = _$v ??
        _$AcceptAdminInvitation._(
          token: BuiltValueNullFieldError.checkNotNull(
              token, r'AcceptAdminInvitation', 'token'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'AcceptAdminInvitation', 'name'),
          password: BuiltValueNullFieldError.checkNotNull(
              password, r'AcceptAdminInvitation', 'password'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
