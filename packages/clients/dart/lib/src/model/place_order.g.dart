// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'place_order.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PlaceOrder extends PlaceOrder {
  @override
  final String addressId;
  @override
  final BuiltList<PlaceOrderItem> items;
  @override
  final String clientRequestId;

  factory _$PlaceOrder([void Function(PlaceOrderBuilder)? updates]) =>
      (PlaceOrderBuilder()..update(updates))._build();

  _$PlaceOrder._(
      {required this.addressId,
      required this.items,
      required this.clientRequestId})
      : super._();
  @override
  PlaceOrder rebuild(void Function(PlaceOrderBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PlaceOrderBuilder toBuilder() => PlaceOrderBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PlaceOrder &&
        addressId == other.addressId &&
        items == other.items &&
        clientRequestId == other.clientRequestId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, addressId.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, clientRequestId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PlaceOrder')
          ..add('addressId', addressId)
          ..add('items', items)
          ..add('clientRequestId', clientRequestId))
        .toString();
  }
}

class PlaceOrderBuilder implements Builder<PlaceOrder, PlaceOrderBuilder> {
  _$PlaceOrder? _$v;

  String? _addressId;
  String? get addressId => _$this._addressId;
  set addressId(String? addressId) => _$this._addressId = addressId;

  ListBuilder<PlaceOrderItem>? _items;
  ListBuilder<PlaceOrderItem> get items =>
      _$this._items ??= ListBuilder<PlaceOrderItem>();
  set items(ListBuilder<PlaceOrderItem>? items) => _$this._items = items;

  String? _clientRequestId;
  String? get clientRequestId => _$this._clientRequestId;
  set clientRequestId(String? clientRequestId) =>
      _$this._clientRequestId = clientRequestId;

  PlaceOrderBuilder() {
    PlaceOrder._defaults(this);
  }

  PlaceOrderBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _addressId = $v.addressId;
      _items = $v.items.toBuilder();
      _clientRequestId = $v.clientRequestId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PlaceOrder other) {
    _$v = other as _$PlaceOrder;
  }

  @override
  void update(void Function(PlaceOrderBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PlaceOrder build() => _build();

  _$PlaceOrder _build() {
    _$PlaceOrder _$result;
    try {
      _$result = _$v ??
          _$PlaceOrder._(
            addressId: BuiltValueNullFieldError.checkNotNull(
                addressId, r'PlaceOrder', 'addressId'),
            items: items.build(),
            clientRequestId: BuiltValueNullFieldError.checkNotNull(
                clientRequestId, r'PlaceOrder', 'clientRequestId'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'PlaceOrder', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
