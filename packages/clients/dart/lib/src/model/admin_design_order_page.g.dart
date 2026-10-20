// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_design_order_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminDesignOrderPage extends AdminDesignOrderPage {
  @override
  final BuiltList<AdminDesignOrderReference> items;
  @override
  final int page;
  @override
  final int pageSize;
  @override
  final int total;
  @override
  final int totalPages;

  factory _$AdminDesignOrderPage(
          [void Function(AdminDesignOrderPageBuilder)? updates]) =>
      (AdminDesignOrderPageBuilder()..update(updates))._build();

  _$AdminDesignOrderPage._(
      {required this.items,
      required this.page,
      required this.pageSize,
      required this.total,
      required this.totalPages})
      : super._();
  @override
  AdminDesignOrderPage rebuild(
          void Function(AdminDesignOrderPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminDesignOrderPageBuilder toBuilder() =>
      AdminDesignOrderPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminDesignOrderPage &&
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
    return (newBuiltValueToStringHelper(r'AdminDesignOrderPage')
          ..add('items', items)
          ..add('page', page)
          ..add('pageSize', pageSize)
          ..add('total', total)
          ..add('totalPages', totalPages))
        .toString();
  }
}

class AdminDesignOrderPageBuilder
    implements Builder<AdminDesignOrderPage, AdminDesignOrderPageBuilder> {
  _$AdminDesignOrderPage? _$v;

  ListBuilder<AdminDesignOrderReference>? _items;
  ListBuilder<AdminDesignOrderReference> get items =>
      _$this._items ??= ListBuilder<AdminDesignOrderReference>();
  set items(ListBuilder<AdminDesignOrderReference>? items) =>
      _$this._items = items;

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

  AdminDesignOrderPageBuilder() {
    AdminDesignOrderPage._defaults(this);
  }

  AdminDesignOrderPageBuilder get _$this {
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
  void replace(AdminDesignOrderPage other) {
    _$v = other as _$AdminDesignOrderPage;
  }

  @override
  void update(void Function(AdminDesignOrderPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminDesignOrderPage build() => _build();

  _$AdminDesignOrderPage _build() {
    _$AdminDesignOrderPage _$result;
    try {
      _$result = _$v ??
          _$AdminDesignOrderPage._(
            items: items.build(),
            page: BuiltValueNullFieldError.checkNotNull(
                page, r'AdminDesignOrderPage', 'page'),
            pageSize: BuiltValueNullFieldError.checkNotNull(
                pageSize, r'AdminDesignOrderPage', 'pageSize'),
            total: BuiltValueNullFieldError.checkNotNull(
                total, r'AdminDesignOrderPage', 'total'),
            totalPages: BuiltValueNullFieldError.checkNotNull(
                totalPages, r'AdminDesignOrderPage', 'totalPages'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AdminDesignOrderPage', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
