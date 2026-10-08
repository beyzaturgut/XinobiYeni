// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'start_email_change.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StartEmailChange extends StartEmailChange {
  @override
  final String newEmail;

  factory _$StartEmailChange(
          [void Function(StartEmailChangeBuilder)? updates]) =>
      (StartEmailChangeBuilder()..update(updates))._build();

  _$StartEmailChange._({required this.newEmail}) : super._();
  @override
  StartEmailChange rebuild(void Function(StartEmailChangeBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StartEmailChangeBuilder toBuilder() =>
      StartEmailChangeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StartEmailChange && newEmail == other.newEmail;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, newEmail.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'StartEmailChange')
          ..add('newEmail', newEmail))
        .toString();
  }
}

class StartEmailChangeBuilder
    implements Builder<StartEmailChange, StartEmailChangeBuilder> {
  _$StartEmailChange? _$v;

  String? _newEmail;
  String? get newEmail => _$this._newEmail;
  set newEmail(String? newEmail) => _$this._newEmail = newEmail;

  StartEmailChangeBuilder() {
    StartEmailChange._defaults(this);
  }

  StartEmailChangeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _newEmail = $v.newEmail;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StartEmailChange other) {
    _$v = other as _$StartEmailChange;
  }

  @override
  void update(void Function(StartEmailChangeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StartEmailChange build() => _build();

  _$StartEmailChange _build() {
    final _$result = _$v ??
        _$StartEmailChange._(
          newEmail: BuiltValueNullFieldError.checkNotNull(
              newEmail, r'StartEmailChange', 'newEmail'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
