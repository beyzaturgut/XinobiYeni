// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delete_my_account.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DeleteMyAccount extends DeleteMyAccount {
  @override
  final String currentPassword;

  factory _$DeleteMyAccount([void Function(DeleteMyAccountBuilder)? updates]) =>
      (DeleteMyAccountBuilder()..update(updates))._build();

  _$DeleteMyAccount._({required this.currentPassword}) : super._();
  @override
  DeleteMyAccount rebuild(void Function(DeleteMyAccountBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DeleteMyAccountBuilder toBuilder() => DeleteMyAccountBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DeleteMyAccount && currentPassword == other.currentPassword;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, currentPassword.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DeleteMyAccount')
          ..add('currentPassword', currentPassword))
        .toString();
  }
}

class DeleteMyAccountBuilder
    implements Builder<DeleteMyAccount, DeleteMyAccountBuilder> {
  _$DeleteMyAccount? _$v;

  String? _currentPassword;
  String? get currentPassword => _$this._currentPassword;
  set currentPassword(String? currentPassword) =>
      _$this._currentPassword = currentPassword;

  DeleteMyAccountBuilder() {
    DeleteMyAccount._defaults(this);
  }

  DeleteMyAccountBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _currentPassword = $v.currentPassword;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DeleteMyAccount other) {
    _$v = other as _$DeleteMyAccount;
  }

  @override
  void update(void Function(DeleteMyAccountBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DeleteMyAccount build() => _build();

  _$DeleteMyAccount _build() {
    final _$result = _$v ??
        _$DeleteMyAccount._(
          currentPassword: BuiltValueNullFieldError.checkNotNull(
              currentPassword, r'DeleteMyAccount', 'currentPassword'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
