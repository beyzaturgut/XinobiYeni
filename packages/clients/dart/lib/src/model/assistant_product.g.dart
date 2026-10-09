// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_product.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantProduct extends AssistantProduct {
  @override
  final String id;
  @override
  final String name;
  @override
  final String category;
  @override
  final String? imageUrl;
  @override
  final Money? priceFrom;
  @override
  final bool inStock;
  @override
  final bool personalizable;

  factory _$AssistantProduct(
          [void Function(AssistantProductBuilder)? updates]) =>
      (AssistantProductBuilder()..update(updates))._build();

  _$AssistantProduct._(
      {required this.id,
      required this.name,
      required this.category,
      this.imageUrl,
      this.priceFrom,
      required this.inStock,
      required this.personalizable})
      : super._();
  @override
  AssistantProduct rebuild(void Function(AssistantProductBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantProductBuilder toBuilder() =>
      AssistantProductBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantProduct &&
        id == other.id &&
        name == other.name &&
        category == other.category &&
        imageUrl == other.imageUrl &&
        priceFrom == other.priceFrom &&
        inStock == other.inStock &&
        personalizable == other.personalizable;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, category.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jc(_$hash, priceFrom.hashCode);
    _$hash = $jc(_$hash, inStock.hashCode);
    _$hash = $jc(_$hash, personalizable.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantProduct')
          ..add('id', id)
          ..add('name', name)
          ..add('category', category)
          ..add('imageUrl', imageUrl)
          ..add('priceFrom', priceFrom)
          ..add('inStock', inStock)
          ..add('personalizable', personalizable))
        .toString();
  }
}

class AssistantProductBuilder
    implements Builder<AssistantProduct, AssistantProductBuilder> {
  _$AssistantProduct? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _category;
  String? get category => _$this._category;
  set category(String? category) => _$this._category = category;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  MoneyBuilder? _priceFrom;
  MoneyBuilder get priceFrom => _$this._priceFrom ??= MoneyBuilder();
  set priceFrom(MoneyBuilder? priceFrom) => _$this._priceFrom = priceFrom;

  bool? _inStock;
  bool? get inStock => _$this._inStock;
  set inStock(bool? inStock) => _$this._inStock = inStock;

  bool? _personalizable;
  bool? get personalizable => _$this._personalizable;
  set personalizable(bool? personalizable) =>
      _$this._personalizable = personalizable;

  AssistantProductBuilder() {
    AssistantProduct._defaults(this);
  }

  AssistantProductBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _category = $v.category;
      _imageUrl = $v.imageUrl;
      _priceFrom = $v.priceFrom?.toBuilder();
      _inStock = $v.inStock;
      _personalizable = $v.personalizable;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantProduct other) {
    _$v = other as _$AssistantProduct;
  }

  @override
  void update(void Function(AssistantProductBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantProduct build() => _build();

  _$AssistantProduct _build() {
    _$AssistantProduct _$result;
    try {
      _$result = _$v ??
          _$AssistantProduct._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'AssistantProduct', 'id'),
            name: BuiltValueNullFieldError.checkNotNull(
                name, r'AssistantProduct', 'name'),
            category: BuiltValueNullFieldError.checkNotNull(
                category, r'AssistantProduct', 'category'),
            imageUrl: imageUrl,
            priceFrom: _priceFrom?.build(),
            inStock: BuiltValueNullFieldError.checkNotNull(
                inStock, r'AssistantProduct', 'inStock'),
            personalizable: BuiltValueNullFieldError.checkNotNull(
                personalizable, r'AssistantProduct', 'personalizable'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'priceFrom';
        _priceFrom?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AssistantProduct', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
