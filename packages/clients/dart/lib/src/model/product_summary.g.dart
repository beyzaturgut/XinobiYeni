// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ProductSummary extends ProductSummary {
  @override
  final String id;
  @override
  final String name;
  @override
  final String category;
  @override
  final String description;
  @override
  final String? imageUrl;
  @override
  final bool personalizable;
  @override
  final int colorCount;
  @override
  final Money? priceFrom;
  @override
  final bool inStock;

  factory _$ProductSummary([void Function(ProductSummaryBuilder)? updates]) =>
      (ProductSummaryBuilder()..update(updates))._build();

  _$ProductSummary._(
      {required this.id,
      required this.name,
      required this.category,
      required this.description,
      this.imageUrl,
      required this.personalizable,
      required this.colorCount,
      this.priceFrom,
      required this.inStock})
      : super._();
  @override
  ProductSummary rebuild(void Function(ProductSummaryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ProductSummaryBuilder toBuilder() => ProductSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProductSummary &&
        id == other.id &&
        name == other.name &&
        category == other.category &&
        description == other.description &&
        imageUrl == other.imageUrl &&
        personalizable == other.personalizable &&
        colorCount == other.colorCount &&
        priceFrom == other.priceFrom &&
        inStock == other.inStock;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, category.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jc(_$hash, personalizable.hashCode);
    _$hash = $jc(_$hash, colorCount.hashCode);
    _$hash = $jc(_$hash, priceFrom.hashCode);
    _$hash = $jc(_$hash, inStock.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ProductSummary')
          ..add('id', id)
          ..add('name', name)
          ..add('category', category)
          ..add('description', description)
          ..add('imageUrl', imageUrl)
          ..add('personalizable', personalizable)
          ..add('colorCount', colorCount)
          ..add('priceFrom', priceFrom)
          ..add('inStock', inStock))
        .toString();
  }
}

class ProductSummaryBuilder
    implements Builder<ProductSummary, ProductSummaryBuilder> {
  _$ProductSummary? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _category;
  String? get category => _$this._category;
  set category(String? category) => _$this._category = category;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  bool? _personalizable;
  bool? get personalizable => _$this._personalizable;
  set personalizable(bool? personalizable) =>
      _$this._personalizable = personalizable;

  int? _colorCount;
  int? get colorCount => _$this._colorCount;
  set colorCount(int? colorCount) => _$this._colorCount = colorCount;

  MoneyBuilder? _priceFrom;
  MoneyBuilder get priceFrom => _$this._priceFrom ??= MoneyBuilder();
  set priceFrom(MoneyBuilder? priceFrom) => _$this._priceFrom = priceFrom;

  bool? _inStock;
  bool? get inStock => _$this._inStock;
  set inStock(bool? inStock) => _$this._inStock = inStock;

  ProductSummaryBuilder() {
    ProductSummary._defaults(this);
  }

  ProductSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _category = $v.category;
      _description = $v.description;
      _imageUrl = $v.imageUrl;
      _personalizable = $v.personalizable;
      _colorCount = $v.colorCount;
      _priceFrom = $v.priceFrom?.toBuilder();
      _inStock = $v.inStock;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ProductSummary other) {
    _$v = other as _$ProductSummary;
  }

  @override
  void update(void Function(ProductSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProductSummary build() => _build();

  _$ProductSummary _build() {
    _$ProductSummary _$result;
    try {
      _$result = _$v ??
          _$ProductSummary._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'ProductSummary', 'id'),
            name: BuiltValueNullFieldError.checkNotNull(
                name, r'ProductSummary', 'name'),
            category: BuiltValueNullFieldError.checkNotNull(
                category, r'ProductSummary', 'category'),
            description: BuiltValueNullFieldError.checkNotNull(
                description, r'ProductSummary', 'description'),
            imageUrl: imageUrl,
            personalizable: BuiltValueNullFieldError.checkNotNull(
                personalizable, r'ProductSummary', 'personalizable'),
            colorCount: BuiltValueNullFieldError.checkNotNull(
                colorCount, r'ProductSummary', 'colorCount'),
            priceFrom: _priceFrom?.build(),
            inStock: BuiltValueNullFieldError.checkNotNull(
                inStock, r'ProductSummary', 'inStock'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'priceFrom';
        _priceFrom?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ProductSummary', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
