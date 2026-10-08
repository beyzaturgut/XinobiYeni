// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'confirm_email_change.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ConfirmEmailChange extends ConfirmEmailChange {
  @override
  final String newEmail;
  @override
  final String verificationId;
  @override
  final String verificationCode;
  @override
  final String currentPassword;

  factory _$ConfirmEmailChange(
          [void Function(ConfirmEmailChangeBuilder)? updates]) =>
      (ConfirmEmailChangeBuilder()..update(updates))._build();

  _$ConfirmEmailChange._(
      {required this.newEmail,
      required this.verificationId,
      required this.verificationCode,
      required this.currentPassword})
      : super._();
  @override
  ConfirmEmailChange rebuild(
          void Function(ConfirmEmailChangeBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ConfirmEmailChangeBuilder toBuilder() =>
      ConfirmEmailChangeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ConfirmEmailChange &&
        newEmail == other.newEmail &&
        verificationId == other.verificationId &&
        verificationCode == other.verificationCode &&
        currentPassword == other.currentPassword;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, newEmail.hashCode);
    _$hash = $jc(_$hash, verificationId.hashCode);
    _$hash = $jc(_$hash, verificationCode.hashCode);
    _$hash = $jc(_$hash, currentPassword.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ConfirmEmailChange')
          ..add('newEmail', newEmail)
          ..add('verificationId', verificationId)
          ..add('verificationCode', verificationCode)
          ..add('currentPassword', currentPassword))
        .toString();
  }
}

class ConfirmEmailChangeBuilder
    implements Builder<ConfirmEmailChange, ConfirmEmailChangeBuilder> {
  _$ConfirmEmailChange? _$v;

  String? _newEmail;
  String? get newEmail => _$this._newEmail;
  set newEmail(String? newEmail) => _$this._newEmail = newEmail;

  String? _verificationId;
  String? get verificationId => _$this._verificationId;
  set verificationId(String? verificationId) =>
      _$this._verificationId = verificationId;

  String? _verificationCode;
  String? get verificationCode => _$this._verificationCode;
  set verificationCode(String? verificationCode) =>
      _$this._verificationCode = verificationCode;

  String? _currentPassword;
  String? get currentPassword => _$this._currentPassword;
  set currentPassword(String? currentPassword) =>
      _$this._currentPassword = currentPassword;

  ConfirmEmailChangeBuilder() {
    ConfirmEmailChange._defaults(this);
  }

  ConfirmEmailChangeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _newEmail = $v.newEmail;
      _verificationId = $v.verificationId;
      _verificationCode = $v.verificationCode;
      _currentPassword = $v.currentPassword;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ConfirmEmailChange other) {
    _$v = other as _$ConfirmEmailChange;
  }

  @override
  void update(void Function(ConfirmEmailChangeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ConfirmEmailChange build() => _build();

  _$ConfirmEmailChange _build() {
    final _$result = _$v ??
        _$ConfirmEmailChange._(
          newEmail: BuiltValueNullFieldError.checkNotNull(
              newEmail, r'ConfirmEmailChange', 'newEmail'),
          verificationId: BuiltValueNullFieldError.checkNotNull(
              verificationId, r'ConfirmEmailChange', 'verificationId'),
          verificationCode: BuiltValueNullFieldError.checkNotNull(
              verificationCode, r'ConfirmEmailChange', 'verificationCode'),
          currentPassword: BuiltValueNullFieldError.checkNotNull(
              currentPassword, r'ConfirmEmailChange', 'currentPassword'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
