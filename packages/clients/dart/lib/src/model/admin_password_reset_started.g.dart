// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_password_reset_started.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminPasswordResetStarted extends AdminPasswordResetStarted {
  @override
  final String message;
  @override
  final String? previewUrl;

  factory _$AdminPasswordResetStarted(
          [void Function(AdminPasswordResetStartedBuilder)? updates]) =>
      (AdminPasswordResetStartedBuilder()..update(updates))._build();

  _$AdminPasswordResetStarted._({required this.message, this.previewUrl})
      : super._();
  @override
  AdminPasswordResetStarted rebuild(
          void Function(AdminPasswordResetStartedBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminPasswordResetStartedBuilder toBuilder() =>
      AdminPasswordResetStartedBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminPasswordResetStarted &&
        message == other.message &&
        previewUrl == other.previewUrl;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jc(_$hash, previewUrl.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminPasswordResetStarted')
          ..add('message', message)
          ..add('previewUrl', previewUrl))
        .toString();
  }
}

class AdminPasswordResetStartedBuilder
    implements
        Builder<AdminPasswordResetStarted, AdminPasswordResetStartedBuilder> {
  _$AdminPasswordResetStarted? _$v;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  String? _previewUrl;
  String? get previewUrl => _$this._previewUrl;
  set previewUrl(String? previewUrl) => _$this._previewUrl = previewUrl;

  AdminPasswordResetStartedBuilder() {
    AdminPasswordResetStarted._defaults(this);
  }

  AdminPasswordResetStartedBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _message = $v.message;
      _previewUrl = $v.previewUrl;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminPasswordResetStarted other) {
    _$v = other as _$AdminPasswordResetStarted;
  }

  @override
  void update(void Function(AdminPasswordResetStartedBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminPasswordResetStarted build() => _build();

  _$AdminPasswordResetStarted _build() {
    final _$result = _$v ??
        _$AdminPasswordResetStarted._(
          message: BuiltValueNullFieldError.checkNotNull(
              message, r'AdminPasswordResetStarted', 'message'),
          previewUrl: previewUrl,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
