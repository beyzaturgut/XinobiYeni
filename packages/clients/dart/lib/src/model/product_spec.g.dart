// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'product_spec.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ProductSpec extends ProductSpec {
  @override
  final String name;
  @override
  final String value;

  factory _$ProductSpec([void Function(ProductSpecBuilder)? updates]) =>
      (ProductSpecBuilder()..update(updates))._build();

  _$ProductSpec._({required this.name, required this.value}) : super._();
  @override
  ProductSpec rebuild(void Function(ProductSpecBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ProductSpecBuilder toBuilder() => ProductSpecBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProductSpec && name == other.name && value == other.value;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, value.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ProductSpec')
          ..add('name', name)
          ..add('value', value))
        .toString();
  }
}

class ProductSpecBuilder implements Builder<ProductSpec, ProductSpecBuilder> {
  _$ProductSpec? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _value;
  String? get value => _$this._value;
  set value(String? value) => _$this._value = value;

  ProductSpecBuilder() {
    ProductSpec._defaults(this);
  }

  ProductSpecBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _value = $v.value;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ProductSpec other) {
    _$v = other as _$ProductSpec;
  }

  @override
  void update(void Function(ProductSpecBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProductSpec build() => _build();

  _$ProductSpec _build() {
    final _$result = _$v ??
        _$ProductSpec._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'ProductSpec', 'name'),
          value: BuiltValueNullFieldError.checkNotNull(
              value, r'ProductSpec', 'value'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
