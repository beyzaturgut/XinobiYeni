// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_customer_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminCustomerPage extends AdminCustomerPage {
  @override
  final BuiltList<AdminCustomerRow> items;
  @override
  final int page;
  @override
  final int pageSize;
  @override
  final int total;
  @override
  final int totalPages;

  factory _$AdminCustomerPage(
          [void Function(AdminCustomerPageBuilder)? updates]) =>
      (AdminCustomerPageBuilder()..update(updates))._build();

  _$AdminCustomerPage._(
      {required this.items,
      required this.page,
      required this.pageSize,
      required this.total,
      required this.totalPages})
      : super._();
  @override
  AdminCustomerPage rebuild(void Function(AdminCustomerPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminCustomerPageBuilder toBuilder() =>
      AdminCustomerPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminCustomerPage &&
        items == other.items &&
        page == other.page &&
        pageSize == other.pageSize &&
        total == other.total &&
        totalPages == other.totalPages;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jc(_$hash, pageSize.hashCode);
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, totalPages.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminCustomerPage')
          ..add('items', items)
          ..add('page', page)
          ..add('pageSize', pageSize)
          ..add('total', total)
          ..add('totalPages', totalPages))
        .toString();
  }
}

class AdminCustomerPageBuilder
    implements Builder<AdminCustomerPage, AdminCustomerPageBuilder> {
  _$AdminCustomerPage? _$v;

  ListBuilder<AdminCustomerRow>? _items;
  ListBuilder<AdminCustomerRow> get items =>
      _$this._items ??= ListBuilder<AdminCustomerRow>();
  set items(ListBuilder<AdminCustomerRow>? items) => _$this._items = items;

  int? _page;
  int? get page => _$this._page;
  set page(int? page) => _$this._page = page;

  int? _pageSize;
  int? get pageSize => _$this._pageSize;
  set pageSize(int? pageSize) => _$this._pageSize = pageSize;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  int? _totalPages;
  int? get totalPages => _$this._totalPages;
  set totalPages(int? totalPages) => _$this._totalPages = totalPages;

  AdminCustomerPageBuilder() {
    AdminCustomerPage._defaults(this);
  }

  AdminCustomerPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _page = $v.page;
      _pageSize = $v.pageSize;
      _total = $v.total;
      _totalPages = $v.totalPages;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminCustomerPage other) {
    _$v = other as _$AdminCustomerPage;
  }

  @override
  void update(void Function(AdminCustomerPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminCustomerPage build() => _build();

  _$AdminCustomerPage _build() {
    _$AdminCustomerPage _$result;
    try {
      _$result = _$v ??
          _$AdminCustomerPage._(
            items: items.build(),
            page: BuiltValueNullFieldError.checkNotNull(
                page, r'AdminCustomerPage', 'page'),
            pageSize: BuiltValueNullFieldError.checkNotNull(
                pageSize, r'AdminCustomerPage', 'pageSize'),
            total: BuiltValueNullFieldError.checkNotNull(
                total, r'AdminCustomerPage', 'total'),
            totalPages: BuiltValueNullFieldError.checkNotNull(
                totalPages, r'AdminCustomerPage', 'totalPages'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AdminCustomerPage', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
