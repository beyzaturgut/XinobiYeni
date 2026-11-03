// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'surat_connection_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SuratConnectionStatus extends SuratConnectionStatus {
  @override
  final bool enabled;
  @override
  final String mode;
  @override
  final bool accountConfigured;
  @override
  final bool pollingEnabled;
  @override
  final bool liveOperationsAllowed;

  factory _$SuratConnectionStatus(
          [void Function(SuratConnectionStatusBuilder)? updates]) =>
      (SuratConnectionStatusBuilder()..update(updates))._build();

  _$SuratConnectionStatus._(
      {required this.enabled,
      required this.mode,
      required this.accountConfigured,
      required this.pollingEnabled,
      required this.liveOperationsAllowed})
      : super._();
  @override
  SuratConnectionStatus rebuild(
          void Function(SuratConnectionStatusBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SuratConnectionStatusBuilder toBuilder() =>
      SuratConnectionStatusBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SuratConnectionStatus &&
        enabled == other.enabled &&
        mode == other.mode &&
        accountConfigured == other.accountConfigured &&
        pollingEnabled == other.pollingEnabled &&
        liveOperationsAllowed == other.liveOperationsAllowed;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, enabled.hashCode);
    _$hash = $jc(_$hash, mode.hashCode);
    _$hash = $jc(_$hash, accountConfigured.hashCode);
    _$hash = $jc(_$hash, pollingEnabled.hashCode);
    _$hash = $jc(_$hash, liveOperationsAllowed.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SuratConnectionStatus')
          ..add('enabled', enabled)
          ..add('mode', mode)
          ..add('accountConfigured', accountConfigured)
          ..add('pollingEnabled', pollingEnabled)
          ..add('liveOperationsAllowed', liveOperationsAllowed))
        .toString();
  }
}

class SuratConnectionStatusBuilder
    implements Builder<SuratConnectionStatus, SuratConnectionStatusBuilder> {
  _$SuratConnectionStatus? _$v;

  bool? _enabled;
  bool? get enabled => _$this._enabled;
  set enabled(bool? enabled) => _$this._enabled = enabled;

  String? _mode;
  String? get mode => _$this._mode;
  set mode(String? mode) => _$this._mode = mode;

  bool? _accountConfigured;
  bool? get accountConfigured => _$this._accountConfigured;
  set accountConfigured(bool? accountConfigured) =>
      _$this._accountConfigured = accountConfigured;

  bool? _pollingEnabled;
  bool? get pollingEnabled => _$this._pollingEnabled;
  set pollingEnabled(bool? pollingEnabled) =>
      _$this._pollingEnabled = pollingEnabled;

  bool? _liveOperationsAllowed;
  bool? get liveOperationsAllowed => _$this._liveOperationsAllowed;
  set liveOperationsAllowed(bool? liveOperationsAllowed) =>
      _$this._liveOperationsAllowed = liveOperationsAllowed;

  SuratConnectionStatusBuilder() {
    SuratConnectionStatus._defaults(this);
  }

  SuratConnectionStatusBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _enabled = $v.enabled;
      _mode = $v.mode;
      _accountConfigured = $v.accountConfigured;
      _pollingEnabled = $v.pollingEnabled;
      _liveOperationsAllowed = $v.liveOperationsAllowed;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SuratConnectionStatus other) {
    _$v = other as _$SuratConnectionStatus;
  }

  @override
  void update(void Function(SuratConnectionStatusBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SuratConnectionStatus build() => _build();

  _$SuratConnectionStatus _build() {
    final _$result = _$v ??
        _$SuratConnectionStatus._(
          enabled: BuiltValueNullFieldError.checkNotNull(
              enabled, r'SuratConnectionStatus', 'enabled'),
          mode: BuiltValueNullFieldError.checkNotNull(
              mode, r'SuratConnectionStatus', 'mode'),
          accountConfigured: BuiltValueNullFieldError.checkNotNull(
              accountConfigured, r'SuratConnectionStatus', 'accountConfigured'),
          pollingEnabled: BuiltValueNullFieldError.checkNotNull(
              pollingEnabled, r'SuratConnectionStatus', 'pollingEnabled'),
          liveOperationsAllowed: BuiltValueNullFieldError.checkNotNull(
              liveOperationsAllowed,
              r'SuratConnectionStatus',
              'liveOperationsAllowed'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
