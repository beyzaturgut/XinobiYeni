// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'remove_device.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RemoveDevice extends RemoveDevice {
  @override
  final String token;

  factory _$RemoveDevice([void Function(RemoveDeviceBuilder)? updates]) =>
      (RemoveDeviceBuilder()..update(updates))._build();

  _$RemoveDevice._({required this.token}) : super._();
  @override
  RemoveDevice rebuild(void Function(RemoveDeviceBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RemoveDeviceBuilder toBuilder() => RemoveDeviceBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RemoveDevice && token == other.token;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, token.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RemoveDevice')..add('token', token))
        .toString();
  }
}

class RemoveDeviceBuilder
    implements Builder<RemoveDevice, RemoveDeviceBuilder> {
  _$RemoveDevice? _$v;

  String? _token;
  String? get token => _$this._token;
  set token(String? token) => _$this._token = token;

  RemoveDeviceBuilder() {
    RemoveDevice._defaults(this);
  }

  RemoveDeviceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _token = $v.token;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RemoveDevice other) {
    _$v = other as _$RemoveDevice;
  }

  @override
  void update(void Function(RemoveDeviceBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RemoveDevice build() => _build();

  _$RemoveDevice _build() {
    final _$result = _$v ??
        _$RemoveDevice._(
          token: BuiltValueNullFieldError.checkNotNull(
              token, r'RemoveDevice', 'token'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
