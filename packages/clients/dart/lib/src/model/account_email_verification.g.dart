// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'account_email_verification.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AccountEmailVerification extends AccountEmailVerification {
  @override
  final String verificationId;
  @override
  final String email;
  @override
  final DateTime expiresAt;
  @override
  final String? previewCode;

  factory _$AccountEmailVerification(
          [void Function(AccountEmailVerificationBuilder)? updates]) =>
      (AccountEmailVerificationBuilder()..update(updates))._build();

  _$AccountEmailVerification._(
      {required this.verificationId,
      required this.email,
      required this.expiresAt,
      this.previewCode})
      : super._();
  @override
  AccountEmailVerification rebuild(
          void Function(AccountEmailVerificationBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AccountEmailVerificationBuilder toBuilder() =>
      AccountEmailVerificationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AccountEmailVerification &&
        verificationId == other.verificationId &&
        email == other.email &&
        expiresAt == other.expiresAt &&
        previewCode == other.previewCode;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, verificationId.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, previewCode.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AccountEmailVerification')
          ..add('verificationId', verificationId)
          ..add('email', email)
          ..add('expiresAt', expiresAt)
          ..add('previewCode', previewCode))
        .toString();
  }
}

class AccountEmailVerificationBuilder
    implements
        Builder<AccountEmailVerification, AccountEmailVerificationBuilder> {
  _$AccountEmailVerification? _$v;

  String? _verificationId;
  String? get verificationId => _$this._verificationId;
  set verificationId(String? verificationId) =>
      _$this._verificationId = verificationId;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  String? _previewCode;
  String? get previewCode => _$this._previewCode;
  set previewCode(String? previewCode) => _$this._previewCode = previewCode;

  AccountEmailVerificationBuilder() {
    AccountEmailVerification._defaults(this);
  }

  AccountEmailVerificationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _verificationId = $v.verificationId;
      _email = $v.email;
      _expiresAt = $v.expiresAt;
      _previewCode = $v.previewCode;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AccountEmailVerification other) {
    _$v = other as _$AccountEmailVerification;
  }

  @override
  void update(void Function(AccountEmailVerificationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AccountEmailVerification build() => _build();

  _$AccountEmailVerification _build() {
    final _$result = _$v ??
        _$AccountEmailVerification._(
          verificationId: BuiltValueNullFieldError.checkNotNull(
              verificationId, r'AccountEmailVerification', 'verificationId'),
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'AccountEmailVerification', 'email'),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
              expiresAt, r'AccountEmailVerification', 'expiresAt'),
          previewCode: previewCode,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
