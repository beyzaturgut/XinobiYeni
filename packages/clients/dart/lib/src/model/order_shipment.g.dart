// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_shipment.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderShipment extends OrderShipment {
  @override
  final String carrier;
  @override
  final String trackingNumber;
  @override
  final String? trackingUrl;
  @override
  final DateTime shippedAt;
  @override
  final DateTime? deliveredAt;

  factory _$OrderShipment([void Function(OrderShipmentBuilder)? updates]) =>
      (OrderShipmentBuilder()..update(updates))._build();

  _$OrderShipment._(
      {required this.carrier,
      required this.trackingNumber,
      this.trackingUrl,
      required this.shippedAt,
      this.deliveredAt})
      : super._();
  @override
  OrderShipment rebuild(void Function(OrderShipmentBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderShipmentBuilder toBuilder() => OrderShipmentBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderShipment &&
        carrier == other.carrier &&
        trackingNumber == other.trackingNumber &&
        trackingUrl == other.trackingUrl &&
        shippedAt == other.shippedAt &&
        deliveredAt == other.deliveredAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, carrier.hashCode);
    _$hash = $jc(_$hash, trackingNumber.hashCode);
    _$hash = $jc(_$hash, trackingUrl.hashCode);
    _$hash = $jc(_$hash, shippedAt.hashCode);
    _$hash = $jc(_$hash, deliveredAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderShipment')
          ..add('carrier', carrier)
          ..add('trackingNumber', trackingNumber)
          ..add('trackingUrl', trackingUrl)
          ..add('shippedAt', shippedAt)
          ..add('deliveredAt', deliveredAt))
        .toString();
  }
}

class OrderShipmentBuilder
    implements Builder<OrderShipment, OrderShipmentBuilder> {
  _$OrderShipment? _$v;

  String? _carrier;
  String? get carrier => _$this._carrier;
  set carrier(String? carrier) => _$this._carrier = carrier;

  String? _trackingNumber;
  String? get trackingNumber => _$this._trackingNumber;
  set trackingNumber(String? trackingNumber) =>
      _$this._trackingNumber = trackingNumber;

  String? _trackingUrl;
  String? get trackingUrl => _$this._trackingUrl;
  set trackingUrl(String? trackingUrl) => _$this._trackingUrl = trackingUrl;

  DateTime? _shippedAt;
  DateTime? get shippedAt => _$this._shippedAt;
  set shippedAt(DateTime? shippedAt) => _$this._shippedAt = shippedAt;

  DateTime? _deliveredAt;
  DateTime? get deliveredAt => _$this._deliveredAt;
  set deliveredAt(DateTime? deliveredAt) => _$this._deliveredAt = deliveredAt;

  OrderShipmentBuilder() {
    OrderShipment._defaults(this);
  }

  OrderShipmentBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _carrier = $v.carrier;
      _trackingNumber = $v.trackingNumber;
      _trackingUrl = $v.trackingUrl;
      _shippedAt = $v.shippedAt;
      _deliveredAt = $v.deliveredAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderShipment other) {
    _$v = other as _$OrderShipment;
  }

  @override
  void update(void Function(OrderShipmentBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderShipment build() => _build();

  _$OrderShipment _build() {
    final _$result = _$v ??
        _$OrderShipment._(
          carrier: BuiltValueNullFieldError.checkNotNull(
              carrier, r'OrderShipment', 'carrier'),
          trackingNumber: BuiltValueNullFieldError.checkNotNull(
              trackingNumber, r'OrderShipment', 'trackingNumber'),
          trackingUrl: trackingUrl,
          shippedAt: BuiltValueNullFieldError.checkNotNull(
              shippedAt, r'OrderShipment', 'shippedAt'),
          deliveredAt: deliveredAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
