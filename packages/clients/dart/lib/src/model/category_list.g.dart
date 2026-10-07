// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_list.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CategoryList extends CategoryList {
  @override
  final BuiltList<CategoryItem> items;

  factory _$CategoryList([void Function(CategoryListBuilder)? updates]) =>
      (CategoryListBuilder()..update(updates))._build();

  _$CategoryList._({required this.items}) : super._();
  @override
  CategoryList rebuild(void Function(CategoryListBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CategoryListBuilder toBuilder() => CategoryListBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CategoryList && items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CategoryList')..add('items', items))
        .toString();
  }
}

class CategoryListBuilder
    implements Builder<CategoryList, CategoryListBuilder> {
  _$CategoryList? _$v;

  ListBuilder<CategoryItem>? _items;
  ListBuilder<CategoryItem> get items =>
      _$this._items ??= ListBuilder<CategoryItem>();
  set items(ListBuilder<CategoryItem>? items) => _$this._items = items;

  CategoryListBuilder() {
    CategoryList._defaults(this);
  }

  CategoryListBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CategoryList other) {
    _$v = other as _$CategoryList;
  }

  @override
  void update(void Function(CategoryListBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CategoryList build() => _build();

  _$CategoryList _build() {
    _$CategoryList _$result;
    try {
      _$result = _$v ??
          _$CategoryList._(
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'CategoryList', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
