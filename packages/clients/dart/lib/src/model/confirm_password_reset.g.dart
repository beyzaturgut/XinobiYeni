// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'confirm_password_reset.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ConfirmPasswordReset extends ConfirmPasswordReset {
  @override
  final String email;
  @override
  final String verificationId;
  @override
  final String verificationCode;
  @override
  final String newPassword;

  factory _$ConfirmPasswordReset(
          [void Function(ConfirmPasswordResetBuilder)? updates]) =>
      (ConfirmPasswordResetBuilder()..update(updates))._build();

  _$ConfirmPasswordReset._(
      {required this.email,
      required this.verificationId,
      required this.verificationCode,
      required this.newPassword})
      : super._();
  @override
  ConfirmPasswordReset rebuild(
          void Function(ConfirmPasswordResetBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ConfirmPasswordResetBuilder toBuilder() =>
      ConfirmPasswordResetBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ConfirmPasswordReset &&
        email == other.email &&
        verificationId == other.verificationId &&
        verificationCode == other.verificationCode &&
        newPassword == other.newPassword;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, verificationId.hashCode);
    _$hash = $jc(_$hash, verificationCode.hashCode);
    _$hash = $jc(_$hash, newPassword.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ConfirmPasswordReset')
          ..add('email', email)
          ..add('verificationId', verificationId)
          ..add('verificationCode', verificationCode)
          ..add('newPassword', newPassword))
        .toString();
  }
}

class ConfirmPasswordResetBuilder
    implements Builder<ConfirmPasswordReset, ConfirmPasswordResetBuilder> {
  _$ConfirmPasswordReset? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _verificationId;
  String? get verificationId => _$this._verificationId;
  set verificationId(String? verificationId) =>
      _$this._verificationId = verificationId;

  String? _verificationCode;
  String? get verificationCode => _$this._verificationCode;
  set verificationCode(String? verificationCode) =>
      _$this._verificationCode = verificationCode;

  String? _newPassword;
  String? get newPassword => _$this._newPassword;
  set newPassword(String? newPassword) => _$this._newPassword = newPassword;

  ConfirmPasswordResetBuilder() {
    ConfirmPasswordReset._defaults(this);
  }

  ConfirmPasswordResetBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _verificationId = $v.verificationId;
      _verificationCode = $v.verificationCode;
      _newPassword = $v.newPassword;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ConfirmPasswordReset other) {
    _$v = other as _$ConfirmPasswordReset;
  }

  @override
  void update(void Function(ConfirmPasswordResetBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ConfirmPasswordReset build() => _build();

  _$ConfirmPasswordReset _build() {
    final _$result = _$v ??
        _$ConfirmPasswordReset._(
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'ConfirmPasswordReset', 'email'),
          verificationId: BuiltValueNullFieldError.checkNotNull(
              verificationId, r'ConfirmPasswordReset', 'verificationId'),
          verificationCode: BuiltValueNullFieldError.checkNotNull(
              verificationCode, r'ConfirmPasswordReset', 'verificationCode'),
          newPassword: BuiltValueNullFieldError.checkNotNull(
              newPassword, r'ConfirmPasswordReset', 'newPassword'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
