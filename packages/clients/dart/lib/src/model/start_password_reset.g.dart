// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'start_password_reset.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StartPasswordReset extends StartPasswordReset {
  @override
  final String email;

  factory _$StartPasswordReset(
          [void Function(StartPasswordResetBuilder)? updates]) =>
      (StartPasswordResetBuilder()..update(updates))._build();

  _$StartPasswordReset._({required this.email}) : super._();
  @override
  StartPasswordReset rebuild(
          void Function(StartPasswordResetBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StartPasswordResetBuilder toBuilder() =>
      StartPasswordResetBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StartPasswordReset && email == other.email;
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
    return (newBuiltValueToStringHelper(r'StartPasswordReset')
          ..add('email', email))
        .toString();
  }
}

class StartPasswordResetBuilder
    implements Builder<StartPasswordReset, StartPasswordResetBuilder> {
  _$StartPasswordReset? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  StartPasswordResetBuilder() {
    StartPasswordReset._defaults(this);
  }

  StartPasswordResetBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StartPasswordReset other) {
    _$v = other as _$StartPasswordReset;
  }

  @override
  void update(void Function(StartPasswordResetBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StartPasswordReset build() => _build();

  _$StartPasswordReset _build() {
    final _$result = _$v ??
        _$StartPasswordReset._(
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'StartPasswordReset', 'email'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
