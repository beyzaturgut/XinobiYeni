// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_my_account.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$UpdateMyAccount extends UpdateMyAccount {
  @override
  final String name;
  @override
  final String? phone;

  factory _$UpdateMyAccount([void Function(UpdateMyAccountBuilder)? updates]) =>
      (UpdateMyAccountBuilder()..update(updates))._build();

  _$UpdateMyAccount._({required this.name, this.phone}) : super._();
  @override
  UpdateMyAccount rebuild(void Function(UpdateMyAccountBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  UpdateMyAccountBuilder toBuilder() => UpdateMyAccountBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is UpdateMyAccount &&
        name == other.name &&
        phone == other.phone;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'UpdateMyAccount')
          ..add('name', name)
          ..add('phone', phone))
        .toString();
  }
}

class UpdateMyAccountBuilder
    implements Builder<UpdateMyAccount, UpdateMyAccountBuilder> {
  _$UpdateMyAccount? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _phone;
  String? get phone => _$this._phone;
  set phone(String? phone) => _$this._phone = phone;

  UpdateMyAccountBuilder() {
    UpdateMyAccount._defaults(this);
  }

  UpdateMyAccountBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _phone = $v.phone;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(UpdateMyAccount other) {
    _$v = other as _$UpdateMyAccount;
  }

  @override
  void update(void Function(UpdateMyAccountBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  UpdateMyAccount build() => _build();

  _$UpdateMyAccount _build() {
    final _$result = _$v ??
        _$UpdateMyAccount._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'UpdateMyAccount', 'name'),
          phone: phone,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
