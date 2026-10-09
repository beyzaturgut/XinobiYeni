// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_request_line.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderRequestLine extends OrderRequestLine {
  @override
  final String variantId;
  @override
  final int quantity;

  factory _$OrderRequestLine(
          [void Function(OrderRequestLineBuilder)? updates]) =>
      (OrderRequestLineBuilder()..update(updates))._build();

  _$OrderRequestLine._({required this.variantId, required this.quantity})
      : super._();
  @override
  OrderRequestLine rebuild(void Function(OrderRequestLineBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderRequestLineBuilder toBuilder() =>
      OrderRequestLineBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderRequestLine &&
        variantId == other.variantId &&
        quantity == other.quantity;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderRequestLine')
          ..add('variantId', variantId)
          ..add('quantity', quantity))
        .toString();
  }
}

class OrderRequestLineBuilder
    implements Builder<OrderRequestLine, OrderRequestLineBuilder> {
  _$OrderRequestLine? _$v;

  String? _variantId;
  String? get variantId => _$this._variantId;
  set variantId(String? variantId) => _$this._variantId = variantId;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  OrderRequestLineBuilder() {
    OrderRequestLine._defaults(this);
  }

  OrderRequestLineBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _variantId = $v.variantId;
      _quantity = $v.quantity;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderRequestLine other) {
    _$v = other as _$OrderRequestLine;
  }

  @override
  void update(void Function(OrderRequestLineBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderRequestLine build() => _build();

  _$OrderRequestLine _build() {
    final _$result = _$v ??
        _$OrderRequestLine._(
          variantId: BuiltValueNullFieldError.checkNotNull(
              variantId, r'OrderRequestLine', 'variantId'),
          quantity: BuiltValueNullFieldError.checkNotNull(
              quantity, r'OrderRequestLine', 'quantity'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
