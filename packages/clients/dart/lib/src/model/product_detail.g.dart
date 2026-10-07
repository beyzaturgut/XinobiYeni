// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ProductDetail extends ProductDetail {
  @override
  final String id;
  @override
  final String name;
  @override
  final String category;
  @override
  final String description;
  @override
  final String seoTitle;
  @override
  final String? imageUrl;
  @override
  final bool personalizable;
  @override
  final BuiltList<VariantDetail> variants;

  factory _$ProductDetail([void Function(ProductDetailBuilder)? updates]) =>
      (ProductDetailBuilder()..update(updates))._build();

  _$ProductDetail._(
      {required this.id,
      required this.name,
      required this.category,
      required this.description,
      required this.seoTitle,
      this.imageUrl,
      required this.personalizable,
      required this.variants})
      : super._();
  @override
  ProductDetail rebuild(void Function(ProductDetailBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ProductDetailBuilder toBuilder() => ProductDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProductDetail &&
        id == other.id &&
        name == other.name &&
        category == other.category &&
        description == other.description &&
        seoTitle == other.seoTitle &&
        imageUrl == other.imageUrl &&
        personalizable == other.personalizable &&
        variants == other.variants;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, category.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, seoTitle.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jc(_$hash, personalizable.hashCode);
    _$hash = $jc(_$hash, variants.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ProductDetail')
          ..add('id', id)
          ..add('name', name)
          ..add('category', category)
          ..add('description', description)
          ..add('seoTitle', seoTitle)
          ..add('imageUrl', imageUrl)
          ..add('personalizable', personalizable)
          ..add('variants', variants))
        .toString();
  }
}

class ProductDetailBuilder
    implements Builder<ProductDetail, ProductDetailBuilder> {
  _$ProductDetail? _$v;

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

  String? _seoTitle;
  String? get seoTitle => _$this._seoTitle;
  set seoTitle(String? seoTitle) => _$this._seoTitle = seoTitle;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  bool? _personalizable;
  bool? get personalizable => _$this._personalizable;
  set personalizable(bool? personalizable) =>
      _$this._personalizable = personalizable;

  ListBuilder<VariantDetail>? _variants;
  ListBuilder<VariantDetail> get variants =>
      _$this._variants ??= ListBuilder<VariantDetail>();
  set variants(ListBuilder<VariantDetail>? variants) =>
      _$this._variants = variants;

  ProductDetailBuilder() {
    ProductDetail._defaults(this);
  }

  ProductDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _category = $v.category;
      _description = $v.description;
      _seoTitle = $v.seoTitle;
      _imageUrl = $v.imageUrl;
      _personalizable = $v.personalizable;
      _variants = $v.variants.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ProductDetail other) {
    _$v = other as _$ProductDetail;
  }

  @override
  void update(void Function(ProductDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProductDetail build() => _build();

  _$ProductDetail _build() {
    _$ProductDetail _$result;
    try {
      _$result = _$v ??
          _$ProductDetail._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'ProductDetail', 'id'),
            name: BuiltValueNullFieldError.checkNotNull(
                name, r'ProductDetail', 'name'),
            category: BuiltValueNullFieldError.checkNotNull(
                category, r'ProductDetail', 'category'),
            description: BuiltValueNullFieldError.checkNotNull(
                description, r'ProductDetail', 'description'),
            seoTitle: BuiltValueNullFieldError.checkNotNull(
                seoTitle, r'ProductDetail', 'seoTitle'),
            imageUrl: imageUrl,
            personalizable: BuiltValueNullFieldError.checkNotNull(
                personalizable, r'ProductDetail', 'personalizable'),
            variants: variants.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'variants';
        variants.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ProductDetail', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
