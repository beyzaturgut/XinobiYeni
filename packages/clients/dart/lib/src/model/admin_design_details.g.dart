// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_design_details.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminDesignDetails extends AdminDesignDetails {
  @override
  final String id;
  @override
  final String kind;
  @override
  final String productId;
  @override
  final String productName;
  @override
  final String? variantId;
  @override
  final String? color;
  @override
  final DateTime createdAt;
  @override
  final String mime;

  factory _$AdminDesignDetails(
          [void Function(AdminDesignDetailsBuilder)? updates]) =>
      (AdminDesignDetailsBuilder()..update(updates))._build();

  _$AdminDesignDetails._(
      {required this.id,
      required this.kind,
      required this.productId,
      required this.productName,
      this.variantId,
      this.color,
      required this.createdAt,
      required this.mime})
      : super._();
  @override
  AdminDesignDetails rebuild(
          void Function(AdminDesignDetailsBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminDesignDetailsBuilder toBuilder() =>
      AdminDesignDetailsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminDesignDetails &&
        id == other.id &&
        kind == other.kind &&
        productId == other.productId &&
        productName == other.productName &&
        variantId == other.variantId &&
        color == other.color &&
        createdAt == other.createdAt &&
        mime == other.mime;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, productName.hashCode);
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, color.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, mime.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminDesignDetails')
          ..add('id', id)
          ..add('kind', kind)
          ..add('productId', productId)
          ..add('productName', productName)
          ..add('variantId', variantId)
          ..add('color', color)
          ..add('createdAt', createdAt)
          ..add('mime', mime))
        .toString();
  }
}

class AdminDesignDetailsBuilder
    implements Builder<AdminDesignDetails, AdminDesignDetailsBuilder> {
  _$AdminDesignDetails? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _kind;
  String? get kind => _$this._kind;
  set kind(String? kind) => _$this._kind = kind;

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

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  String? _mime;
  String? get mime => _$this._mime;
  set mime(String? mime) => _$this._mime = mime;

  AdminDesignDetailsBuilder() {
    AdminDesignDetails._defaults(this);
  }

  AdminDesignDetailsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _kind = $v.kind;
      _productId = $v.productId;
      _productName = $v.productName;
      _variantId = $v.variantId;
      _color = $v.color;
      _createdAt = $v.createdAt;
      _mime = $v.mime;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminDesignDetails other) {
    _$v = other as _$AdminDesignDetails;
  }

  @override
  void update(void Function(AdminDesignDetailsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminDesignDetails build() => _build();

  _$AdminDesignDetails _build() {
    final _$result = _$v ??
        _$AdminDesignDetails._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'AdminDesignDetails', 'id'),
          kind: BuiltValueNullFieldError.checkNotNull(
              kind, r'AdminDesignDetails', 'kind'),
          productId: BuiltValueNullFieldError.checkNotNull(
              productId, r'AdminDesignDetails', 'productId'),
          productName: BuiltValueNullFieldError.checkNotNull(
              productName, r'AdminDesignDetails', 'productName'),
          variantId: variantId,
          color: color,
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'AdminDesignDetails', 'createdAt'),
          mime: BuiltValueNullFieldError.checkNotNull(
              mime, r'AdminDesignDetails', 'mime'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
