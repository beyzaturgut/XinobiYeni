// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account_profile.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AccountProfile extends AccountProfile {
  @override
  final String id;
  @override
  final String name;
  @override
  final String email;
  @override
  final DateTime createdAt;

  factory _$AccountProfile([void Function(AccountProfileBuilder)? updates]) =>
      (AccountProfileBuilder()..update(updates))._build();

  _$AccountProfile._(
      {required this.id,
      required this.name,
      required this.email,
      required this.createdAt})
      : super._();
  @override
  AccountProfile rebuild(void Function(AccountProfileBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AccountProfileBuilder toBuilder() => AccountProfileBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AccountProfile &&
        id == other.id &&
        name == other.name &&
        email == other.email &&
        createdAt == other.createdAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AccountProfile')
          ..add('id', id)
          ..add('name', name)
          ..add('email', email)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class AccountProfileBuilder
    implements Builder<AccountProfile, AccountProfileBuilder> {
  _$AccountProfile? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  AccountProfileBuilder() {
    AccountProfile._defaults(this);
  }

  AccountProfileBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _email = $v.email;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AccountProfile other) {
    _$v = other as _$AccountProfile;
  }

  @override
  void update(void Function(AccountProfileBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AccountProfile build() => _build();

  _$AccountProfile _build() {
    final _$result = _$v ??
        _$AccountProfile._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'AccountProfile', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'AccountProfile', 'name'),
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'AccountProfile', 'email'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'AccountProfile', 'createdAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
