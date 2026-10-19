// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_status_count.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderStatusCount extends OrderStatusCount {
  @override
  final String status;
  @override
  final int count;

  factory _$OrderStatusCount(
          [void Function(OrderStatusCountBuilder)? updates]) =>
      (OrderStatusCountBuilder()..update(updates))._build();

  _$OrderStatusCount._({required this.status, required this.count}) : super._();
  @override
  OrderStatusCount rebuild(void Function(OrderStatusCountBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderStatusCountBuilder toBuilder() =>
      OrderStatusCountBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderStatusCount &&
        status == other.status &&
        count == other.count;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, count.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderStatusCount')
          ..add('status', status)
          ..add('count', count))
        .toString();
  }
}

class OrderStatusCountBuilder
    implements Builder<OrderStatusCount, OrderStatusCountBuilder> {
  _$OrderStatusCount? _$v;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  int? _count;
  int? get count => _$this._count;
  set count(int? count) => _$this._count = count;

  OrderStatusCountBuilder() {
    OrderStatusCount._defaults(this);
  }

  OrderStatusCountBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _count = $v.count;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderStatusCount other) {
    _$v = other as _$OrderStatusCount;
  }

  @override
  void update(void Function(OrderStatusCountBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderStatusCount build() => _build();

  _$OrderStatusCount _build() {
    final _$result = _$v ??
        _$OrderStatusCount._(
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'OrderStatusCount', 'status'),
          count: BuiltValueNullFieldError.checkNotNull(
              count, r'OrderStatusCount', 'count'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
