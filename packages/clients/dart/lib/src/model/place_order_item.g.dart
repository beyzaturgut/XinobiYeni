// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'place_order_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PlaceOrderItem extends PlaceOrderItem {
  @override
  final String productId;
  @override
  final String variantId;
  @override
  final int quantity;
  @override
  final String? designId;

  factory _$PlaceOrderItem([void Function(PlaceOrderItemBuilder)? updates]) =>
      (PlaceOrderItemBuilder()..update(updates))._build();

  _$PlaceOrderItem._(
      {required this.productId,
      required this.variantId,
      required this.quantity,
      this.designId})
      : super._();
  @override
  PlaceOrderItem rebuild(void Function(PlaceOrderItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PlaceOrderItemBuilder toBuilder() => PlaceOrderItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PlaceOrderItem &&
        productId == other.productId &&
        variantId == other.variantId &&
        quantity == other.quantity &&
        designId == other.designId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, designId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PlaceOrderItem')
          ..add('productId', productId)
          ..add('variantId', variantId)
          ..add('quantity', quantity)
          ..add('designId', designId))
        .toString();
  }
}

class PlaceOrderItemBuilder
    implements Builder<PlaceOrderItem, PlaceOrderItemBuilder> {
  _$PlaceOrderItem? _$v;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  String? _variantId;
  String? get variantId => _$this._variantId;
  set variantId(String? variantId) => _$this._variantId = variantId;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  String? _designId;
  String? get designId => _$this._designId;
  set designId(String? designId) => _$this._designId = designId;

  PlaceOrderItemBuilder() {
    PlaceOrderItem._defaults(this);
  }

  PlaceOrderItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _variantId = $v.variantId;
      _quantity = $v.quantity;
      _designId = $v.designId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PlaceOrderItem other) {
    _$v = other as _$PlaceOrderItem;
  }

  @override
  void update(void Function(PlaceOrderItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PlaceOrderItem build() => _build();

  _$PlaceOrderItem _build() {
    final _$result = _$v ??
        _$PlaceOrderItem._(
          productId: BuiltValueNullFieldError.checkNotNull(
              productId, r'PlaceOrderItem', 'productId'),
          variantId: BuiltValueNullFieldError.checkNotNull(
              variantId, r'PlaceOrderItem', 'variantId'),
          quantity: BuiltValueNullFieldError.checkNotNull(
              quantity, r'PlaceOrderItem', 'quantity'),
          designId: designId,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
