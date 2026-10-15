// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AuditPage extends AuditPage {
  @override
  final BuiltList<AuditEntry> items;
  @override
  final int page;
  @override
  final int pageSize;
  @override
  final int total;

  factory _$AuditPage([void Function(AuditPageBuilder)? updates]) =>
      (AuditPageBuilder()..update(updates))._build();

  _$AuditPage._(
      {required this.items,
      required this.page,
      required this.pageSize,
      required this.total})
      : super._();
  @override
  AuditPage rebuild(void Function(AuditPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AuditPageBuilder toBuilder() => AuditPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuditPage &&
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
    return (newBuiltValueToStringHelper(r'AuditPage')
          ..add('items', items)
          ..add('page', page)
          ..add('pageSize', pageSize)
          ..add('total', total))
        .toString();
  }
}

class AuditPageBuilder implements Builder<AuditPage, AuditPageBuilder> {
  _$AuditPage? _$v;

  ListBuilder<AuditEntry>? _items;
  ListBuilder<AuditEntry> get items =>
      _$this._items ??= ListBuilder<AuditEntry>();
  set items(ListBuilder<AuditEntry>? items) => _$this._items = items;

  int? _page;
  int? get page => _$this._page;
  set page(int? page) => _$this._page = page;

  int? _pageSize;
  int? get pageSize => _$this._pageSize;
  set pageSize(int? pageSize) => _$this._pageSize = pageSize;

  int? _total;
  int? get total => _$this._total;
  set total(int? total) => _$this._total = total;

  AuditPageBuilder() {
    AuditPage._defaults(this);
  }

  AuditPageBuilder get _$this {
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
  void replace(AuditPage other) {
    _$v = other as _$AuditPage;
  }

  @override
  void update(void Function(AuditPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuditPage build() => _build();

  _$AuditPage _build() {
    _$AuditPage _$result;
    try {
      _$result = _$v ??
          _$AuditPage._(
            items: items.build(),
            page: BuiltValueNullFieldError.checkNotNull(
                page, r'AuditPage', 'page'),
            pageSize: BuiltValueNullFieldError.checkNotNull(
                pageSize, r'AuditPage', 'pageSize'),
            total: BuiltValueNullFieldError.checkNotNull(
                total, r'AuditPage', 'total'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AuditPage', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
