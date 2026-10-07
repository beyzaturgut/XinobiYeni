// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ProductPage extends ProductPage {
  @override
  final BuiltList<ProductSummary> items;
  @override
  final int page;
  @override
  final int pageSize;
  @override
  final int total;

  factory _$ProductPage([void Function(ProductPageBuilder)? updates]) =>
      (ProductPageBuilder()..update(updates))._build();

  _$ProductPage._(
      {required this.items,
      required this.page,
      required this.pageSize,
      required this.total})
      : super._();
  @override
  ProductPage rebuild(void Function(ProductPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ProductPageBuilder toBuilder() => ProductPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProductPage &&
        items == other.items &&
        page == other.page &&
        pageSize == other.pageSize &&
        total == other.total;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jc(_$hash, pageSize.hashCode);
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ProductPage')
          ..add('items', items)
          ..add('page', page)
          ..add('pageSize', pageSize)
          ..add('total', total))
        .toString();
  }
}

class ProductPageBuilder implements Builder<ProductPage, ProductPageBuilder> {
  _$ProductPage? _$v;

  ListBuilder<ProductSummary>? _items;
  ListBuilder<ProductSummary> get items =>
      _$this._items ??= ListBuilder<ProductSummary>();
  set items(ListBuilder<ProductSummary>? items) => _$this._items = items;

  int? _page;
  int? get page => _$this._page;
  set page(int? page) => _$this._page = page;

  int? _pageSize;
  int? get pageSize => _$this._pageSize;
  set pageSize(int? pageSize) => _$this._pageSize = pageSize;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  ProductPageBuilder() {
    ProductPage._defaults(this);
  }

  ProductPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page;
      _pageSize = $v.pageSize;
      _total = $v.total;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ProductPage other) {
    _$v = other as _$ProductPage;
  }

  @override
  void update(void Function(ProductPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProductPage build() => _build();

  _$ProductPage _build() {
    _$ProductPage _$result;
    try {
      _$result = _$v ??
          _$ProductPage._(
            items: items.build(),
            page: BuiltValueNullFieldError.checkNotNull(
                page, r'ProductPage', 'page'),
            pageSize: BuiltValueNullFieldError.checkNotNull(
                pageSize, r'ProductPage', 'pageSize'),
            total: BuiltValueNullFieldError.checkNotNull(
                total, r'ProductPage', 'total'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ProductPage', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
