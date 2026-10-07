// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'start_account_email_verification.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StartAccountEmailVerification extends StartAccountEmailVerification {
  @override
  final String email;

  factory _$StartAccountEmailVerification(
          [void Function(StartAccountEmailVerificationBuilder)? updates]) =>
      (StartAccountEmailVerificationBuilder()..update(updates))._build();

  _$StartAccountEmailVerification._({required this.email}) : super._();
  @override
  StartAccountEmailVerification rebuild(
          void Function(StartAccountEmailVerificationBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StartAccountEmailVerificationBuilder toBuilder() =>
      StartAccountEmailVerificationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StartAccountEmailVerification && email == other.email;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'StartAccountEmailVerification')
          ..add('email', email))
        .toString();
  }
}

class StartAccountEmailVerificationBuilder
    implements
        Builder<StartAccountEmailVerification,
            StartAccountEmailVerificationBuilder> {
  _$StartAccountEmailVerification? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  StartAccountEmailVerificationBuilder() {
    StartAccountEmailVerification._defaults(this);
  }

  StartAccountEmailVerificationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StartAccountEmailVerification other) {
    _$v = other as _$StartAccountEmailVerification;
  }

  @override
  void update(void Function(StartAccountEmailVerificationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StartAccountEmailVerification build() => _build();

  _$StartAccountEmailVerification _build() {
    final _$result = _$v ??
        _$StartAccountEmailVerification._(
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'StartAccountEmailVerification', 'email'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
