// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'register_device.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RegisterDevice extends RegisterDevice {
  @override
  final String token;
  @override
  final String platform;

  factory _$RegisterDevice([void Function(RegisterDeviceBuilder)? updates]) =>
      (RegisterDeviceBuilder()..update(updates))._build();

  _$RegisterDevice._({required this.token, required this.platform}) : super._();
  @override
  RegisterDevice rebuild(void Function(RegisterDeviceBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RegisterDeviceBuilder toBuilder() => RegisterDeviceBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RegisterDevice &&
        token == other.token &&
        platform == other.platform;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, token.hashCode);
    _$hash = $jc(_$hash, platform.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RegisterDevice')
          ..add('token', token)
          ..add('platform', platform))
        .toString();
  }
}

class RegisterDeviceBuilder
    implements Builder<RegisterDevice, RegisterDeviceBuilder> {
  _$RegisterDevice? _$v;

  String? _token;
  String? get token => _$this._token;
  set token(String? token) => _$this._token = token;

  String? _platform;
  String? get platform => _$this._platform;
  set platform(String? platform) => _$this._platform = platform;

  RegisterDeviceBuilder() {
    RegisterDevice._defaults(this);
  }

  RegisterDeviceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _token = $v.token;
      _platform = $v.platform;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RegisterDevice other) {
    _$v = other as _$RegisterDevice;
  }

  @override
  void update(void Function(RegisterDeviceBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RegisterDevice build() => _build();

  _$RegisterDevice _build() {
    final _$result = _$v ??
        _$RegisterDevice._(
          token: BuiltValueNullFieldError.checkNotNull(
              token, r'RegisterDevice', 'token'),
          platform: BuiltValueNullFieldError.checkNotNull(
              platform, r'RegisterDevice', 'platform'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
