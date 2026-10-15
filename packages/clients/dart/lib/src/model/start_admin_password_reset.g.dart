// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'start_admin_password_reset.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StartAdminPasswordReset extends StartAdminPasswordReset {
  @override
  final String email;

  factory _$StartAdminPasswordReset(
          [void Function(StartAdminPasswordResetBuilder)? updates]) =>
      (StartAdminPasswordResetBuilder()..update(updates))._build();

  _$StartAdminPasswordReset._({required this.email}) : super._();
  @override
  StartAdminPasswordReset rebuild(
          void Function(StartAdminPasswordResetBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StartAdminPasswordResetBuilder toBuilder() =>
      StartAdminPasswordResetBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StartAdminPasswordReset && email == other.email;
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
    return (newBuiltValueToStringHelper(r'StartAdminPasswordReset')
          ..add('email', email))
        .toString();
  }
}

class StartAdminPasswordResetBuilder
    implements
        Builder<StartAdminPasswordReset, StartAdminPasswordResetBuilder> {
  _$StartAdminPasswordReset? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  StartAdminPasswordResetBuilder() {
    StartAdminPasswordReset._defaults(this);
  }

  StartAdminPasswordResetBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StartAdminPasswordReset other) {
    _$v = other as _$StartAdminPasswordReset;
  }

  @override
  void update(void Function(StartAdminPasswordResetBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StartAdminPasswordReset build() => _build();

  _$StartAdminPasswordReset _build() {
    final _$result = _$v ??
        _$StartAdminPasswordReset._(
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'StartAdminPasswordReset', 'email'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
