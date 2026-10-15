// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assign_admin_role.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssignAdminRole extends AssignAdminRole {
  @override
  final String email;
  @override
  final String role;

  factory _$AssignAdminRole([void Function(AssignAdminRoleBuilder)? updates]) =>
      (AssignAdminRoleBuilder()..update(updates))._build();

  _$AssignAdminRole._({required this.email, required this.role}) : super._();
  @override
  AssignAdminRole rebuild(void Function(AssignAdminRoleBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssignAdminRoleBuilder toBuilder() => AssignAdminRoleBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssignAdminRole &&
        email == other.email &&
        role == other.role;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssignAdminRole')
          ..add('email', email)
          ..add('role', role))
        .toString();
  }
}

class AssignAdminRoleBuilder
    implements Builder<AssignAdminRole, AssignAdminRoleBuilder> {
  _$AssignAdminRole? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _role;
  String? get role => _$this._role;
  set role(String? role) => _$this._role = role;

  AssignAdminRoleBuilder() {
    AssignAdminRole._defaults(this);
  }

  AssignAdminRoleBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _role = $v.role;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssignAdminRole other) {
    _$v = other as _$AssignAdminRole;
  }

  @override
  void update(void Function(AssignAdminRoleBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssignAdminRole build() => _build();

  _$AssignAdminRole _build() {
    final _$result = _$v ??
        _$AssignAdminRole._(
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'AssignAdminRole', 'email'),
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'AssignAdminRole', 'role'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
