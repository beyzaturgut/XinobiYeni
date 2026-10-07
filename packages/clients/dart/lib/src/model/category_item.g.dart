// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CategoryItem extends CategoryItem {
  @override
  final String name;
  @override
  final int productCount;
  @override
  final String? imageUrl;

  factory _$CategoryItem([void Function(CategoryItemBuilder)? updates]) =>
      (CategoryItemBuilder()..update(updates))._build();

  _$CategoryItem._(
      {required this.name, required this.productCount, this.imageUrl})
      : super._();
  @override
  CategoryItem rebuild(void Function(CategoryItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CategoryItemBuilder toBuilder() => CategoryItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CategoryItem &&
        name == other.name &&
        productCount == other.productCount &&
        imageUrl == other.imageUrl;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, productCount.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CategoryItem')
          ..add('name', name)
          ..add('productCount', productCount)
          ..add('imageUrl', imageUrl))
        .toString();
  }
}

class CategoryItemBuilder
    implements Builder<CategoryItem, CategoryItemBuilder> {
  _$CategoryItem? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _productCount;
  int? get productCount => _$this._productCount;
  set productCount(int? productCount) => _$this._productCount = productCount;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  CategoryItemBuilder() {
    CategoryItem._defaults(this);
  }

  CategoryItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _productCount = $v.productCount;
      _imageUrl = $v.imageUrl;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CategoryItem other) {
    _$v = other as _$CategoryItem;
  }

  @override
  void update(void Function(CategoryItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CategoryItem build() => _build();

  _$CategoryItem _build() {
    final _$result = _$v ??
        _$CategoryItem._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'CategoryItem', 'name'),
          productCount: BuiltValueNullFieldError.checkNotNull(
              productCount, r'CategoryItem', 'productCount'),
          imageUrl: imageUrl,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
