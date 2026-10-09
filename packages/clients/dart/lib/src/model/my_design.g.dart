// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'my_design.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MyDesign extends MyDesign {
  @override
  final String id;
  @override
  final String kind;
  @override
  final String name;
  @override
  final String productId;
  @override
  final String productName;
  @override
  final String? variantId;
  @override
  final String? color;
  @override
  final BuiltList<String> profile;
  @override
  final String imageUrl;
  @override
  final DateTime createdAt;

  factory _$MyDesign([void Function(MyDesignBuilder)? updates]) =>
      (MyDesignBuilder()..update(updates))._build();

  _$MyDesign._(
      {required this.id,
      required this.kind,
      required this.name,
      required this.productId,
      required this.productName,
      this.variantId,
      this.color,
      required this.profile,
      required this.imageUrl,
      required this.createdAt})
      : super._();
  @override
  MyDesign rebuild(void Function(MyDesignBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MyDesignBuilder toBuilder() => MyDesignBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MyDesign &&
        id == other.id &&
        kind == other.kind &&
        name == other.name &&
        productId == other.productId &&
        productName == other.productName &&
        variantId == other.variantId &&
        color == other.color &&
        profile == other.profile &&
        imageUrl == other.imageUrl &&
        createdAt == other.createdAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, productName.hashCode);
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, color.hashCode);
    _$hash = $jc(_$hash, profile.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MyDesign')
          ..add('id', id)
          ..add('kind', kind)
          ..add('name', name)
          ..add('productId', productId)
          ..add('productName', productName)
          ..add('variantId', variantId)
          ..add('color', color)
          ..add('profile', profile)
          ..add('imageUrl', imageUrl)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class MyDesignBuilder implements Builder<MyDesign, MyDesignBuilder> {
  _$MyDesign? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _kind;
  String? get kind => _$this._kind;
  set kind(String? kind) => _$this._kind = kind;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  String? _productName;
  String? get productName => _$this._productName;
  set productName(String? productName) => _$this._productName = productName;

  String? _variantId;
  String? get variantId => _$this._variantId;
  set variantId(String? variantId) => _$this._variantId = variantId;

  String? _color;
  String? get color => _$this._color;
  set color(String? color) => _$this._color = color;

  ListBuilder<String>? _profile;
  ListBuilder<String> get profile => _$this._profile ??= ListBuilder<String>();
  set profile(ListBuilder<String>? profile) => _$this._profile = profile;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  MyDesignBuilder() {
    MyDesign._defaults(this);
  }

  MyDesignBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _kind = $v.kind;
      _name = $v.name;
      _productId = $v.productId;
      _productName = $v.productName;
      _variantId = $v.variantId;
      _color = $v.color;
      _profile = $v.profile.toBuilder();
      _imageUrl = $v.imageUrl;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MyDesign other) {
    _$v = other as _$MyDesign;
  }

  @override
  void update(void Function(MyDesignBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MyDesign build() => _build();

  _$MyDesign _build() {
    _$MyDesign _$result;
    try {
      _$result = _$v ??
          _$MyDesign._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'MyDesign', 'id'),
            kind: BuiltValueNullFieldError.checkNotNull(
                kind, r'MyDesign', 'kind'),
            name: BuiltValueNullFieldError.checkNotNull(
                name, r'MyDesign', 'name'),
            productId: BuiltValueNullFieldError.checkNotNull(
                productId, r'MyDesign', 'productId'),
            productName: BuiltValueNullFieldError.checkNotNull(
                productName, r'MyDesign', 'productName'),
            variantId: variantId,
            color: color,
            profile: profile.build(),
            imageUrl: BuiltValueNullFieldError.checkNotNull(
                imageUrl, r'MyDesign', 'imageUrl'),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'MyDesign', 'createdAt'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'profile';
        profile.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'MyDesign', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
