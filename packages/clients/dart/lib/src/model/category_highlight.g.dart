// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'category_highlight.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CategoryHighlight extends CategoryHighlight {
  @override
  final String category;
  @override
  final String? imageUrl;
  @override
  final String imageAlt;
  @override
  final int productCount;
  @override
  final String description;

  factory _$CategoryHighlight(
          [void Function(CategoryHighlightBuilder)? updates]) =>
      (CategoryHighlightBuilder()..update(updates))._build();

  _$CategoryHighlight._(
      {required this.category,
      this.imageUrl,
      required this.imageAlt,
      required this.productCount,
      required this.description})
      : super._();
  @override
  CategoryHighlight rebuild(void Function(CategoryHighlightBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CategoryHighlightBuilder toBuilder() =>
      CategoryHighlightBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CategoryHighlight &&
        category == other.category &&
        imageUrl == other.imageUrl &&
        imageAlt == other.imageAlt &&
        productCount == other.productCount &&
        description == other.description;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, category.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jc(_$hash, imageAlt.hashCode);
    _$hash = $jc(_$hash, productCount.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CategoryHighlight')
          ..add('category', category)
          ..add('imageUrl', imageUrl)
          ..add('imageAlt', imageAlt)
          ..add('productCount', productCount)
          ..add('description', description))
        .toString();
  }
}

class CategoryHighlightBuilder
    implements Builder<CategoryHighlight, CategoryHighlightBuilder> {
  _$CategoryHighlight? _$v;

  String? _category;
  String? get category => _$this._category;
  set category(String? category) => _$this._category = category;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  String? _imageAlt;
  String? get imageAlt => _$this._imageAlt;
  set imageAlt(String? imageAlt) => _$this._imageAlt = imageAlt;

  int? _productCount;
  int? get productCount => _$this._productCount;
  set productCount(int? productCount) => _$this._productCount = productCount;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  CategoryHighlightBuilder() {
    CategoryHighlight._defaults(this);
  }

  CategoryHighlightBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _category = $v.category;
      _imageUrl = $v.imageUrl;
      _imageAlt = $v.imageAlt;
      _productCount = $v.productCount;
      _description = $v.description;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CategoryHighlight other) {
    _$v = other as _$CategoryHighlight;
  }

  @override
  void update(void Function(CategoryHighlightBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CategoryHighlight build() => _build();

  _$CategoryHighlight _build() {
    final _$result = _$v ??
        _$CategoryHighlight._(
          category: BuiltValueNullFieldError.checkNotNull(
              category, r'CategoryHighlight', 'category'),
          imageUrl: imageUrl,
          imageAlt: BuiltValueNullFieldError.checkNotNull(
              imageAlt, r'CategoryHighlight', 'imageAlt'),
          productCount: BuiltValueNullFieldError.checkNotNull(
              productCount, r'CategoryHighlight', 'productCount'),
          description: BuiltValueNullFieldError.checkNotNull(
              description, r'CategoryHighlight', 'description'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
