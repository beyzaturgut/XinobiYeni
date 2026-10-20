// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_design_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminDesignPage extends AdminDesignPage {
  @override
  final BuiltList<AdminDesignRow> items;
  @override
  final int page;
  @override
  final int pageSize;
  @override
  final int total;
  @override
  final int totalPages;

  factory _$AdminDesignPage([void Function(AdminDesignPageBuilder)? updates]) =>
      (AdminDesignPageBuilder()..update(updates))._build();

  _$AdminDesignPage._(
      {required this.items,
      required this.page,
      required this.pageSize,
      required this.total,
      required this.totalPages})
      : super._();
  @override
  AdminDesignPage rebuild(void Function(AdminDesignPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminDesignPageBuilder toBuilder() => AdminDesignPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminDesignPage &&
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
    return (newBuiltValueToStringHelper(r'AdminDesignPage')
          ..add('items', items)
          ..add('page', page)
          ..add('pageSize', pageSize)
          ..add('total', total)
          ..add('totalPages', totalPages))
        .toString();
  }
}

class AdminDesignPageBuilder
    implements Builder<AdminDesignPage, AdminDesignPageBuilder> {
  _$AdminDesignPage? _$v;

  ListBuilder<AdminDesignRow>? _items;
  ListBuilder<AdminDesignRow> get items =>
      _$this._items ??= ListBuilder<AdminDesignRow>();
  set items(ListBuilder<AdminDesignRow>? items) => _$this._items = items;

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

  AdminDesignPageBuilder() {
    AdminDesignPage._defaults(this);
  }

  AdminDesignPageBuilder get _$this {
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
  void replace(AdminDesignPage other) {
    _$v = other as _$AdminDesignPage;
  }

  @override
  void update(void Function(AdminDesignPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminDesignPage build() => _build();

  _$AdminDesignPage _build() {
    _$AdminDesignPage _$result;
    try {
      _$result = _$v ??
          _$AdminDesignPage._(
            items: items.build(),
            page: BuiltValueNullFieldError.checkNotNull(
                page, r'AdminDesignPage', 'page'),
            pageSize: BuiltValueNullFieldError.checkNotNull(
                pageSize, r'AdminDesignPage', 'pageSize'),
            total: BuiltValueNullFieldError.checkNotNull(
                total, r'AdminDesignPage', 'total'),
            totalPages: BuiltValueNullFieldError.checkNotNull(
                totalPages, r'AdminDesignPage', 'totalPages'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AdminDesignPage', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
