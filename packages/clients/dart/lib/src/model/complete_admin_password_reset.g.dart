// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'complete_admin_password_reset.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CompleteAdminPasswordReset extends CompleteAdminPasswordReset {
  @override
  final String token;
  @override
  final String newPassword;

  factory _$CompleteAdminPasswordReset(
          [void Function(CompleteAdminPasswordResetBuilder)? updates]) =>
      (CompleteAdminPasswordResetBuilder()..update(updates))._build();

  _$CompleteAdminPasswordReset._(
      {required this.token, required this.newPassword})
      : super._();
  @override
  CompleteAdminPasswordReset rebuild(
          void Function(CompleteAdminPasswordResetBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CompleteAdminPasswordResetBuilder toBuilder() =>
      CompleteAdminPasswordResetBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CompleteAdminPasswordReset &&
        token == other.token &&
        newPassword == other.newPassword;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, token.hashCode);
    _$hash = $jc(_$hash, newPassword.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CompleteAdminPasswordReset')
          ..add('token', token)
          ..add('newPassword', newPassword))
        .toString();
  }
}

class CompleteAdminPasswordResetBuilder
    implements
        Builder<CompleteAdminPasswordReset, CompleteAdminPasswordResetBuilder> {
  _$CompleteAdminPasswordReset? _$v;

  String? _token;
  String? get token => _$this._token;
  set token(String? token) => _$this._token = token;

  String? _newPassword;
  String? get newPassword => _$this._newPassword;
  set newPassword(String? newPassword) => _$this._newPassword = newPassword;

  CompleteAdminPasswordResetBuilder() {
    CompleteAdminPasswordReset._defaults(this);
  }

  CompleteAdminPasswordResetBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _token = $v.token;
      _newPassword = $v.newPassword;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CompleteAdminPasswordReset other) {
    _$v = other as _$CompleteAdminPasswordReset;
  }

  @override
  void update(void Function(CompleteAdminPasswordResetBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CompleteAdminPasswordReset build() => _build();

  _$CompleteAdminPasswordReset _build() {
    final _$result = _$v ??
        _$CompleteAdminPasswordReset._(
          token: BuiltValueNullFieldError.checkNotNull(
              token, r'CompleteAdminPasswordReset', 'token'),
          newPassword: BuiltValueNullFieldError.checkNotNull(
              newPassword, r'CompleteAdminPasswordReset', 'newPassword'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
