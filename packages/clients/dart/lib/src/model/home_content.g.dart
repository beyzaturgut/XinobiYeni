// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'home_content.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$HomeContent extends HomeContent {
  @override
  final BuiltList<HomeSlide> slides;
  @override
  final String? featureImageUrl;
  @override
  final String accentColor;
  @override
  final BuiltList<ProductSummary> featuredProducts;
  @override
  final BuiltList<CategoryHighlight> categories;

  factory _$HomeContent([void Function(HomeContentBuilder)? updates]) =>
      (HomeContentBuilder()..update(updates))._build();

  _$HomeContent._(
      {required this.slides,
      this.featureImageUrl,
      required this.accentColor,
      required this.featuredProducts,
      required this.categories})
      : super._();
  @override
  HomeContent rebuild(void Function(HomeContentBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  HomeContentBuilder toBuilder() => HomeContentBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is HomeContent &&
        slides == other.slides &&
        featureImageUrl == other.featureImageUrl &&
        accentColor == other.accentColor &&
        featuredProducts == other.featuredProducts &&
        categories == other.categories;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, slides.hashCode);
    _$hash = $jc(_$hash, featureImageUrl.hashCode);
    _$hash = $jc(_$hash, accentColor.hashCode);
    _$hash = $jc(_$hash, featuredProducts.hashCode);
    _$hash = $jc(_$hash, categories.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'HomeContent')
          ..add('slides', slides)
          ..add('featureImageUrl', featureImageUrl)
          ..add('accentColor', accentColor)
          ..add('featuredProducts', featuredProducts)
          ..add('categories', categories))
        .toString();
  }
}

class HomeContentBuilder implements Builder<HomeContent, HomeContentBuilder> {
  _$HomeContent? _$v;

  ListBuilder<HomeSlide>? _slides;
  ListBuilder<HomeSlide> get slides =>
      _$this._slides ??= ListBuilder<HomeSlide>();
  set slides(ListBuilder<HomeSlide>? slides) => _$this._slides = slides;

  String? _featureImageUrl;
  String? get featureImageUrl => _$this._featureImageUrl;
  set featureImageUrl(String? featureImageUrl) =>
      _$this._featureImageUrl = featureImageUrl;

  String? _accentColor;
  String? get accentColor => _$this._accentColor;
  set accentColor(String? accentColor) => _$this._accentColor = accentColor;

  ListBuilder<ProductSummary>? _featuredProducts;
  ListBuilder<ProductSummary> get featuredProducts =>
      _$this._featuredProducts ??= ListBuilder<ProductSummary>();
  set featuredProducts(ListBuilder<ProductSummary>? featuredProducts) =>
      _$this._featuredProducts = featuredProducts;

  ListBuilder<CategoryHighlight>? _categories;
  ListBuilder<CategoryHighlight> get categories =>
      _$this._categories ??= ListBuilder<CategoryHighlight>();
  set categories(ListBuilder<CategoryHighlight>? categories) =>
      _$this._categories = categories;

  HomeContentBuilder() {
    HomeContent._defaults(this);
  }

  HomeContentBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _slides = $v.slides.toBuilder();
      _featureImageUrl = $v.featureImageUrl;
      _accentColor = $v.accentColor;
      _featuredProducts = $v.featuredProducts.toBuilder();
      _categories = $v.categories.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(HomeContent other) {
    _$v = other as _$HomeContent;
  }

  @override
  void update(void Function(HomeContentBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  HomeContent build() => _build();

  _$HomeContent _build() {
    _$HomeContent _$result;
    try {
      _$result = _$v ??
          _$HomeContent._(
            slides: slides.build(),
            featureImageUrl: featureImageUrl,
            accentColor: BuiltValueNullFieldError.checkNotNull(
                accentColor, r'HomeContent', 'accentColor'),
            featuredProducts: featuredProducts.build(),
            categories: categories.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'slides';
        slides.build();

        _$failedField = 'featuredProducts';
        featuredProducts.build();
        _$failedField = 'categories';
        categories.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'HomeContent', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
