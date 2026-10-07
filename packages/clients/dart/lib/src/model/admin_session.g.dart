// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_session.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminSession extends AdminSession {
  @override
  final AccountProfile account;
  @override
  final BuiltList<String> roles;
  @override
  final BuiltList<String> permissions;

  factory _$AdminSession([void Function(AdminSessionBuilder)? updates]) =>
      (AdminSessionBuilder()..update(updates))._build();

  _$AdminSession._(
      {required this.account, required this.roles, required this.permissions})
      : super._();
  @override
  AdminSession rebuild(void Function(AdminSessionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminSessionBuilder toBuilder() => AdminSessionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminSession &&
        account == other.account &&
        roles == other.roles &&
        permissions == other.permissions;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, account.hashCode);
    _$hash = $jc(_$hash, roles.hashCode);
    _$hash = $jc(_$hash, permissions.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminSession')
          ..add('account', account)
          ..add('roles', roles)
          ..add('permissions', permissions))
        .toString();
  }
}

class AdminSessionBuilder
    implements Builder<AdminSession, AdminSessionBuilder> {
  _$AdminSession? _$v;

  AccountProfileBuilder? _account;
  AccountProfileBuilder get account =>
      _$this._account ??= AccountProfileBuilder();
  set account(AccountProfileBuilder? account) => _$this._account = account;

  ListBuilder<String>? _roles;
  ListBuilder<String> get roles => _$this._roles ??= ListBuilder<String>();
  set roles(ListBuilder<String>? roles) => _$this._roles = roles;

  ListBuilder<String>? _permissions;
  ListBuilder<String> get permissions =>
      _$this._permissions ??= ListBuilder<String>();
  set permissions(ListBuilder<String>? permissions) =>
      _$this._permissions = permissions;

  AdminSessionBuilder() {
    AdminSession._defaults(this);
  }

  AdminSessionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _account = $v.account.toBuilder();
      _roles = $v.roles.toBuilder();
      _permissions = $v.permissions.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminSession other) {
    _$v = other as _$AdminSession;
  }

  @override
  void update(void Function(AdminSessionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminSession build() => _build();

  _$AdminSession _build() {
    _$AdminSession _$result;
    try {
      _$result = _$v ??
          _$AdminSession._(
            account: account.build(),
            roles: roles.build(),
            permissions: permissions.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'account';
        account.build();
        _$failedField = 'roles';
        roles.build();
        _$failedField = 'permissions';
        permissions.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AdminSession', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
