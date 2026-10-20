// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_design_row.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminDesignRow extends AdminDesignRow {
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

  factory _$AdminDesignRow([void Function(AdminDesignRowBuilder)? updates]) =>
      (AdminDesignRowBuilder()..update(updates))._build();

  _$AdminDesignRow._(
      {required this.id,
      required this.kind,
      required this.productId,
      required this.productName,
      this.variantId,
      this.color,
      required this.createdAt})
      : super._();
  @override
  AdminDesignRow rebuild(void Function(AdminDesignRowBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminDesignRowBuilder toBuilder() => AdminDesignRowBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminDesignRow &&
        id == other.id &&
        kind == other.kind &&
        productId == other.productId &&
        productName == other.productName &&
        variantId == other.variantId &&
        color == other.color &&
        createdAt == other.createdAt;
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
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminDesignRow')
          ..add('id', id)
          ..add('kind', kind)
          ..add('productId', productId)
          ..add('productName', productName)
          ..add('variantId', variantId)
          ..add('color', color)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class AdminDesignRowBuilder
    implements Builder<AdminDesignRow, AdminDesignRowBuilder> {
  _$AdminDesignRow? _$v;

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

  AdminDesignRowBuilder() {
    AdminDesignRow._defaults(this);
  }

  AdminDesignRowBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _kind = $v.kind;
      _productId = $v.productId;
      _productName = $v.productName;
      _variantId = $v.variantId;
      _color = $v.color;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminDesignRow other) {
    _$v = other as _$AdminDesignRow;
  }

  @override
  void update(void Function(AdminDesignRowBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminDesignRow build() => _build();

  _$AdminDesignRow _build() {
    final _$result = _$v ??
        _$AdminDesignRow._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'AdminDesignRow', 'id'),
          kind: BuiltValueNullFieldError.checkNotNull(
              kind, r'AdminDesignRow', 'kind'),
          productId: BuiltValueNullFieldError.checkNotNull(
              productId, r'AdminDesignRow', 'productId'),
          productName: BuiltValueNullFieldError.checkNotNull(
              productName, r'AdminDesignRow', 'productName'),
          variantId: variantId,
          color: color,
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'AdminDesignRow', 'createdAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
