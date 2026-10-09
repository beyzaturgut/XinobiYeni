// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote_item_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$QuoteItemRequest extends QuoteItemRequest {
  @override
  final String productId;
  @override
  final int quantity;

  factory _$QuoteItemRequest(
          [void Function(QuoteItemRequestBuilder)? updates]) =>
      (QuoteItemRequestBuilder()..update(updates))._build();

  _$QuoteItemRequest._({required this.productId, required this.quantity})
      : super._();
  @override
  QuoteItemRequest rebuild(void Function(QuoteItemRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  QuoteItemRequestBuilder toBuilder() =>
      QuoteItemRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuoteItemRequest &&
        productId == other.productId &&
        quantity == other.quantity;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, quantity.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuoteItemRequest')
          ..add('productId', productId)
          ..add('quantity', quantity))
        .toString();
  }
}

class QuoteItemRequestBuilder
    implements Builder<QuoteItemRequest, QuoteItemRequestBuilder> {
  _$QuoteItemRequest? _$v;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  int? _quantity;
  int? get quantity => _$this._quantity;
  set quantity(int? quantity) => _$this._quantity = quantity;

  QuoteItemRequestBuilder() {
    QuoteItemRequest._defaults(this);
  }

  QuoteItemRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _quantity = $v.quantity;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(QuoteItemRequest other) {
    _$v = other as _$QuoteItemRequest;
  }

  @override
  void update(void Function(QuoteItemRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuoteItemRequest build() => _build();

  _$QuoteItemRequest _build() {
    final _$result = _$v ??
        _$QuoteItemRequest._(
          productId: BuiltValueNullFieldError.checkNotNull(
              productId, r'QuoteItemRequest', 'productId'),
          quantity: BuiltValueNullFieldError.checkNotNull(
              quantity, r'QuoteItemRequest', 'quantity'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
