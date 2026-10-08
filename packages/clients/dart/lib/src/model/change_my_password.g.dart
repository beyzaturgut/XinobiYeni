// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'change_my_password.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ChangeMyPassword extends ChangeMyPassword {
  @override
  final String currentPassword;
  @override
  final String newPassword;

  factory _$ChangeMyPassword(
          [void Function(ChangeMyPasswordBuilder)? updates]) =>
      (ChangeMyPasswordBuilder()..update(updates))._build();

  _$ChangeMyPassword._(
      {required this.currentPassword, required this.newPassword})
      : super._();
  @override
  ChangeMyPassword rebuild(void Function(ChangeMyPasswordBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ChangeMyPasswordBuilder toBuilder() =>
      ChangeMyPasswordBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ChangeMyPassword &&
        currentPassword == other.currentPassword &&
        newPassword == other.newPassword;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, currentPassword.hashCode);
    _$hash = $jc(_$hash, newPassword.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ChangeMyPassword')
          ..add('currentPassword', currentPassword)
          ..add('newPassword', newPassword))
        .toString();
  }
}

class ChangeMyPasswordBuilder
    implements Builder<ChangeMyPassword, ChangeMyPasswordBuilder> {
  _$ChangeMyPassword? _$v;

  String? _currentPassword;
  String? get currentPassword => _$this._currentPassword;
  set currentPassword(String? currentPassword) =>
      _$this._currentPassword = currentPassword;

  String? _newPassword;
  String? get newPassword => _$this._newPassword;
  set newPassword(String? newPassword) => _$this._newPassword = newPassword;

  ChangeMyPasswordBuilder() {
    ChangeMyPassword._defaults(this);
  }

  ChangeMyPasswordBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _currentPassword = $v.currentPassword;
      _newPassword = $v.newPassword;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ChangeMyPassword other) {
    _$v = other as _$ChangeMyPassword;
  }

  @override
  void update(void Function(ChangeMyPasswordBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ChangeMyPassword build() => _build();

  _$ChangeMyPassword _build() {
    final _$result = _$v ??
        _$ChangeMyPassword._(
          currentPassword: BuiltValueNullFieldError.checkNotNull(
              currentPassword, r'ChangeMyPassword', 'currentPassword'),
          newPassword: BuiltValueNullFieldError.checkNotNull(
              newPassword, r'ChangeMyPassword', 'newPassword'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
