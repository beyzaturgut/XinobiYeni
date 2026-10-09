// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$QuoteItem extends QuoteItem {
  @override
  final String productId;
  @override
  final String productName;
  @override
  final int quantity;
  @override
  final Money? unitPrice;
  @override
  final Money? lineTotal;

  factory _$QuoteItem([void Function(QuoteItemBuilder)? updates]) =>
      (QuoteItemBuilder()..update(updates))._build();

  _$QuoteItem._(
      {required this.productId,
      required this.productName,
      required this.quantity,
      this.unitPrice,
      this.lineTotal})
      : super._();
  @override
  QuoteItem rebuild(void Function(QuoteItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  QuoteItemBuilder toBuilder() => QuoteItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuoteItem &&
        productId == other.productId &&
        productName == other.productName &&
        quantity == other.quantity &&
        unitPrice == other.unitPrice &&
        lineTotal == other.lineTotal;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, productName.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, unitPrice.hashCode);
    _$hash = $jc(_$hash, lineTotal.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuoteItem')
          ..add('productId', productId)
          ..add('productName', productName)
          ..add('quantity', quantity)
          ..add('unitPrice', unitPrice)
          ..add('lineTotal', lineTotal))
        .toString();
  }
}

class QuoteItemBuilder implements Builder<QuoteItem, QuoteItemBuilder> {
  _$QuoteItem? _$v;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  String? _productName;
  String? get productName => _$this._productName;
  set productName(String? productName) => _$this._productName = productName;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  MoneyBuilder? _unitPrice;
  MoneyBuilder get unitPrice => _$this._unitPrice ??= MoneyBuilder();
  set unitPrice(MoneyBuilder? unitPrice) => _$this._unitPrice = unitPrice;

  MoneyBuilder? _lineTotal;
  MoneyBuilder get lineTotal => _$this._lineTotal ??= MoneyBuilder();
  set lineTotal(MoneyBuilder? lineTotal) => _$this._lineTotal = lineTotal;

  QuoteItemBuilder() {
    QuoteItem._defaults(this);
  }

  QuoteItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _productName = $v.productName;
      _quantity = $v.quantity;
      _unitPrice = $v.unitPrice?.toBuilder();
      _lineTotal = $v.lineTotal?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(QuoteItem other) {
    _$v = other as _$QuoteItem;
  }

  @override
  void update(void Function(QuoteItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuoteItem build() => _build();

  _$QuoteItem _build() {
    _$QuoteItem _$result;
    try {
      _$result = _$v ??
          _$QuoteItem._(
            productId: BuiltValueNullFieldError.checkNotNull(
                productId, r'QuoteItem', 'productId'),
            productName: BuiltValueNullFieldError.checkNotNull(
                productName, r'QuoteItem', 'productName'),
            quantity: BuiltValueNullFieldError.checkNotNull(
                quantity, r'QuoteItem', 'quantity'),
            unitPrice: _unitPrice?.build(),
            lineTotal: _lineTotal?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'unitPrice';
        _unitPrice?.build();
        _$failedField = 'lineTotal';
        _lineTotal?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'QuoteItem', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
