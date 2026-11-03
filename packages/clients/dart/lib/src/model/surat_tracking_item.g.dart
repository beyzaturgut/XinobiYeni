// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'surat_tracking_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SuratTrackingItem extends SuratTrackingItem {
  @override
  final String? trackingNumber;
  @override
  final int? statusCode;
  @override
  final String state;
  @override
  final String? providerText;
  @override
  final String? lastMovementRaw;
  @override
  final String? deliveredDateRaw;

  factory _$SuratTrackingItem(
          [void Function(SuratTrackingItemBuilder)? updates]) =>
      (SuratTrackingItemBuilder()..update(updates))._build();

  _$SuratTrackingItem._(
      {this.trackingNumber,
      this.statusCode,
      required this.state,
      this.providerText,
      this.lastMovementRaw,
      this.deliveredDateRaw})
      : super._();
  @override
  SuratTrackingItem rebuild(void Function(SuratTrackingItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SuratTrackingItemBuilder toBuilder() =>
      SuratTrackingItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SuratTrackingItem &&
        trackingNumber == other.trackingNumber &&
        statusCode == other.statusCode &&
        state == other.state &&
        providerText == other.providerText &&
        lastMovementRaw == other.lastMovementRaw &&
        deliveredDateRaw == other.deliveredDateRaw;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, trackingNumber.hashCode);
    _$hash = $jc(_$hash, statusCode.hashCode);
    _$hash = $jc(_$hash, state.hashCode);
    _$hash = $jc(_$hash, providerText.hashCode);
    _$hash = $jc(_$hash, lastMovementRaw.hashCode);
    _$hash = $jc(_$hash, deliveredDateRaw.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SuratTrackingItem')
          ..add('trackingNumber', trackingNumber)
          ..add('statusCode', statusCode)
          ..add('state', state)
          ..add('providerText', providerText)
          ..add('lastMovementRaw', lastMovementRaw)
          ..add('deliveredDateRaw', deliveredDateRaw))
        .toString();
  }
}

class SuratTrackingItemBuilder
    implements Builder<SuratTrackingItem, SuratTrackingItemBuilder> {
  _$SuratTrackingItem? _$v;

  String? _trackingNumber;
  String? get trackingNumber => _$this._trackingNumber;
  set trackingNumber(String? trackingNumber) =>
      _$this._trackingNumber = trackingNumber;

  int? _statusCode;
  int? get statusCode => _$this._statusCode;
  set statusCode(int? statusCode) => _$this._statusCode = statusCode;

  String? _state;
  String? get state => _$this._state;
  set state(String? state) => _$this._state = state;

  String? _providerText;
  String? get providerText => _$this._providerText;
  set providerText(String? providerText) => _$this._providerText = providerText;

  String? _lastMovementRaw;
  String? get lastMovementRaw => _$this._lastMovementRaw;
  set lastMovementRaw(String? lastMovementRaw) =>
      _$this._lastMovementRaw = lastMovementRaw;

  String? _deliveredDateRaw;
  String? get deliveredDateRaw => _$this._deliveredDateRaw;
  set deliveredDateRaw(String? deliveredDateRaw) =>
      _$this._deliveredDateRaw = deliveredDateRaw;

  SuratTrackingItemBuilder() {
    SuratTrackingItem._defaults(this);
  }

  SuratTrackingItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _trackingNumber = $v.trackingNumber;
      _statusCode = $v.statusCode;
      _state = $v.state;
      _providerText = $v.providerText;
      _lastMovementRaw = $v.lastMovementRaw;
      _deliveredDateRaw = $v.deliveredDateRaw;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SuratTrackingItem other) {
    _$v = other as _$SuratTrackingItem;
  }

  @override
  void update(void Function(SuratTrackingItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SuratTrackingItem build() => _build();

  _$SuratTrackingItem _build() {
    final _$result = _$v ??
        _$SuratTrackingItem._(
          trackingNumber: trackingNumber,
          statusCode: statusCode,
          state: BuiltValueNullFieldError.checkNotNull(
              state, r'SuratTrackingItem', 'state'),
          providerText: providerText,
          lastMovementRaw: lastMovementRaw,
          deliveredDateRaw: deliveredDateRaw,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
