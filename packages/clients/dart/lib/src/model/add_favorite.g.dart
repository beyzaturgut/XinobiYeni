// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'add_favorite.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AddFavorite extends AddFavorite {
  @override
  final String productId;

  factory _$AddFavorite([void Function(AddFavoriteBuilder)? updates]) =>
      (AddFavoriteBuilder()..update(updates))._build();

  _$AddFavorite._({required this.productId}) : super._();
  @override
  AddFavorite rebuild(void Function(AddFavoriteBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AddFavoriteBuilder toBuilder() => AddFavoriteBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AddFavorite && productId == other.productId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AddFavorite')
          ..add('productId', productId))
        .toString();
  }
}

class AddFavoriteBuilder implements Builder<AddFavorite, AddFavoriteBuilder> {
  _$AddFavorite? _$v;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  AddFavoriteBuilder() {
    AddFavorite._defaults(this);
  }

  AddFavoriteBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AddFavorite other) {
    _$v = other as _$AddFavorite;
  }

  @override
  void update(void Function(AddFavoriteBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AddFavorite build() => _build();

  _$AddFavorite _build() {
    final _$result = _$v ??
        _$AddFavorite._(
          productId: BuiltValueNullFieldError.checkNotNull(
              productId, r'AddFavorite', 'productId'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
