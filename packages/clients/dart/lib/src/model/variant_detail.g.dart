// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'variant_detail.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VariantDetail extends VariantDetail {
  @override
  final String id;
  @override
  final String sku;
  @override
  final String color;
  @override
  final String? hex;
  @override
  final String? imageUrl;
  @override
  final Money? price;
  @override
  final Availability availability;
  @override
  final bool purchasable;
  @override
  final int maxQuantity;
  @override
  final String? surfaceMaskUrl;

  factory _$VariantDetail([void Function(VariantDetailBuilder)? updates]) =>
      (VariantDetailBuilder()..update(updates))._build();

  _$VariantDetail._(
      {required this.id,
      required this.sku,
      required this.color,
      this.hex,
      this.imageUrl,
      this.price,
      required this.availability,
      required this.purchasable,
      required this.maxQuantity,
      this.surfaceMaskUrl})
      : super._();
  @override
  VariantDetail rebuild(void Function(VariantDetailBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VariantDetailBuilder toBuilder() => VariantDetailBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VariantDetail &&
        id == other.id &&
        sku == other.sku &&
        color == other.color &&
        hex == other.hex &&
        imageUrl == other.imageUrl &&
        price == other.price &&
        availability == other.availability &&
        purchasable == other.purchasable &&
        maxQuantity == other.maxQuantity &&
        surfaceMaskUrl == other.surfaceMaskUrl;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, sku.hashCode);
    _$hash = $jc(_$hash, color.hashCode);
    _$hash = $jc(_$hash, hex.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jc(_$hash, price.hashCode);
    _$hash = $jc(_$hash, availability.hashCode);
    _$hash = $jc(_$hash, purchasable.hashCode);
    _$hash = $jc(_$hash, maxQuantity.hashCode);
    _$hash = $jc(_$hash, surfaceMaskUrl.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VariantDetail')
          ..add('id', id)
          ..add('sku', sku)
          ..add('color', color)
          ..add('hex', hex)
          ..add('imageUrl', imageUrl)
          ..add('price', price)
          ..add('availability', availability)
          ..add('purchasable', purchasable)
          ..add('maxQuantity', maxQuantity)
          ..add('surfaceMaskUrl', surfaceMaskUrl))
        .toString();
  }
}

class VariantDetailBuilder
    implements Builder<VariantDetail, VariantDetailBuilder> {
  _$VariantDetail? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _sku;
  String? get sku => _$this._sku;
  set sku(String? sku) => _$this._sku = sku;

  String? _color;
  String? get color => _$this._color;
  set color(String? color) => _$this._color = color;

  String? _hex;
  String? get hex => _$this._hex;
  set hex(String? hex) => _$this._hex = hex;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  MoneyBuilder? _price;
  MoneyBuilder get price => _$this._price ??= MoneyBuilder();
  set price(MoneyBuilder? price) => _$this._price = price;

  AvailabilityBuilder? _availability;
  AvailabilityBuilder get availability =>
      _$this._availability ??= AvailabilityBuilder();
  set availability(AvailabilityBuilder? availability) =>
      _$this._availability = availability;

  bool? _purchasable;
  bool? get purchasable => _$this._purchasable;
  set purchasable(bool? purchasable) => _$this._purchasable = purchasable;

  int? _maxQuantity;
  int? get maxQuantity => _$this._maxQuantity;
  set maxQuantity(int? maxQuantity) => _$this._maxQuantity = maxQuantity;

  String? _surfaceMaskUrl;
  String? get surfaceMaskUrl => _$this._surfaceMaskUrl;
  set surfaceMaskUrl(String? surfaceMaskUrl) =>
      _$this._surfaceMaskUrl = surfaceMaskUrl;

  VariantDetailBuilder() {
    VariantDetail._defaults(this);
  }

  VariantDetailBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _sku = $v.sku;
      _color = $v.color;
      _hex = $v.hex;
      _imageUrl = $v.imageUrl;
      _price = $v.price?.toBuilder();
      _availability = $v.availability.toBuilder();
      _purchasable = $v.purchasable;
      _maxQuantity = $v.maxQuantity;
      _surfaceMaskUrl = $v.surfaceMaskUrl;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VariantDetail other) {
    _$v = other as _$VariantDetail;
  }

  @override
  void update(void Function(VariantDetailBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VariantDetail build() => _build();

  _$VariantDetail _build() {
    _$VariantDetail _$result;
    try {
      _$result = _$v ??
          _$VariantDetail._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'VariantDetail', 'id'),
            sku: BuiltValueNullFieldError.checkNotNull(
                sku, r'VariantDetail', 'sku'),
            color: BuiltValueNullFieldError.checkNotNull(
                color, r'VariantDetail', 'color'),
            hex: hex,
            imageUrl: imageUrl,
            price: _price?.build(),
            availability: availability.build(),
            purchasable: BuiltValueNullFieldError.checkNotNull(
                purchasable, r'VariantDetail', 'purchasable'),
            maxQuantity: BuiltValueNullFieldError.checkNotNull(
                maxQuantity, r'VariantDetail', 'maxQuantity'),
            surfaceMaskUrl: surfaceMaskUrl,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'price';
        _price?.build();
        _$failedField = 'availability';
        availability.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'VariantDetail', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
