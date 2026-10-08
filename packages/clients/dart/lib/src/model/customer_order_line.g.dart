// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_order_line.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerOrderLine extends CustomerOrderLine {
  @override
  final String productId;
  @override
  final String variantId;
  @override
  final String name;
  @override
  final String color;
  @override
  final String? imageUrl;
  @override
  final Money unitPrice;
  @override
  final int quantity;
  @override
  final Money lineTotal;

  factory _$CustomerOrderLine(
          [void Function(CustomerOrderLineBuilder)? updates]) =>
      (CustomerOrderLineBuilder()..update(updates))._build();

  _$CustomerOrderLine._(
      {required this.productId,
      required this.variantId,
      required this.name,
      required this.color,
      this.imageUrl,
      required this.unitPrice,
      required this.quantity,
      required this.lineTotal})
      : super._();
  @override
  CustomerOrderLine rebuild(void Function(CustomerOrderLineBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CustomerOrderLineBuilder toBuilder() =>
      CustomerOrderLineBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerOrderLine &&
        productId == other.productId &&
        variantId == other.variantId &&
        name == other.name &&
        color == other.color &&
        imageUrl == other.imageUrl &&
        unitPrice == other.unitPrice &&
        quantity == other.quantity &&
        lineTotal == other.lineTotal;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, color.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jc(_$hash, unitPrice.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jc(_$hash, lineTotal.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerOrderLine')
          ..add('productId', productId)
          ..add('variantId', variantId)
          ..add('name', name)
          ..add('color', color)
          ..add('imageUrl', imageUrl)
          ..add('unitPrice', unitPrice)
          ..add('quantity', quantity)
          ..add('lineTotal', lineTotal))
        .toString();
  }
}

class CustomerOrderLineBuilder
    implements Builder<CustomerOrderLine, CustomerOrderLineBuilder> {
  _$CustomerOrderLine? _$v;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  String? _variantId;
  String? get variantId => _$this._variantId;
  set variantId(String? variantId) => _$this._variantId = variantId;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _color;
  String? get color => _$this._color;
  set color(String? color) => _$this._color = color;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  MoneyBuilder? _unitPrice;
  MoneyBuilder get unitPrice => _$this._unitPrice ??= MoneyBuilder();
  set unitPrice(MoneyBuilder? unitPrice) => _$this._unitPrice = unitPrice;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  MoneyBuilder? _lineTotal;
  MoneyBuilder get lineTotal => _$this._lineTotal ??= MoneyBuilder();
  set lineTotal(MoneyBuilder? lineTotal) => _$this._lineTotal = lineTotal;

  CustomerOrderLineBuilder() {
    CustomerOrderLine._defaults(this);
  }

  CustomerOrderLineBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _variantId = $v.variantId;
      _name = $v.name;
      _color = $v.color;
      _imageUrl = $v.imageUrl;
      _unitPrice = $v.unitPrice.toBuilder();
      _quantity = $v.quantity;
      _lineTotal = $v.lineTotal.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerOrderLine other) {
    _$v = other as _$CustomerOrderLine;
  }

  @override
  void update(void Function(CustomerOrderLineBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerOrderLine build() => _build();

  _$CustomerOrderLine _build() {
    _$CustomerOrderLine _$result;
    try {
      _$result = _$v ??
          _$CustomerOrderLine._(
            productId: BuiltValueNullFieldError.checkNotNull(
                productId, r'CustomerOrderLine', 'productId'),
            variantId: BuiltValueNullFieldError.checkNotNull(
                variantId, r'CustomerOrderLine', 'variantId'),
            name: BuiltValueNullFieldError.checkNotNull(
                name, r'CustomerOrderLine', 'name'),
            color: BuiltValueNullFieldError.checkNotNull(
                color, r'CustomerOrderLine', 'color'),
            imageUrl: imageUrl,
            unitPrice: unitPrice.build(),
            quantity: BuiltValueNullFieldError.checkNotNull(
                quantity, r'CustomerOrderLine', 'quantity'),
            lineTotal: lineTotal.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'unitPrice';
        unitPrice.build();

        _$failedField = 'lineTotal';
        lineTotal.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'CustomerOrderLine', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
