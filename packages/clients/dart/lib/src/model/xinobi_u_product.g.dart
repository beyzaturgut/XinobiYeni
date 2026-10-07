// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'xinobi_u_product.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$XinobiUProduct extends XinobiUProduct {
  @override
  final String id;
  @override
  final String name;
  @override
  final String category;

  factory _$XinobiUProduct([void Function(XinobiUProductBuilder)? updates]) =>
      (XinobiUProductBuilder()..update(updates))._build();

  _$XinobiUProduct._(
      {required this.id, required this.name, required this.category})
      : super._();
  @override
  XinobiUProduct rebuild(void Function(XinobiUProductBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  XinobiUProductBuilder toBuilder() => XinobiUProductBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is XinobiUProduct &&
        id == other.id &&
        name == other.name &&
        category == other.category;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, category.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'XinobiUProduct')
          ..add('id', id)
          ..add('name', name)
          ..add('category', category))
        .toString();
  }
}

class XinobiUProductBuilder
    implements Builder<XinobiUProduct, XinobiUProductBuilder> {
  _$XinobiUProduct? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _category;
  String? get category => _$this._category;
  set category(String? category) => _$this._category = category;

  XinobiUProductBuilder() {
    XinobiUProduct._defaults(this);
  }

  XinobiUProductBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _category = $v.category;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(XinobiUProduct other) {
    _$v = other as _$XinobiUProduct;
  }

  @override
  void update(void Function(XinobiUProductBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  XinobiUProduct build() => _build();

  _$XinobiUProduct _build() {
    final _$result = _$v ??
        _$XinobiUProduct._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'XinobiUProduct', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'XinobiUProduct', 'name'),
          category: BuiltValueNullFieldError.checkNotNull(
              category, r'XinobiUProduct', 'category'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
