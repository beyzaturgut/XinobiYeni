// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'single_source_purchase.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SingleSourcePurchase extends SingleSourcePurchase {
  @override
  final String status;
  @override
  final int profileRevision;
  @override
  final String? variantId;
  @override
  final String? sku;
  @override
  final int? priceMinor;
  @override
  final int? stock;
  @override
  final SingleSourceBinding? binding;

  factory _$SingleSourcePurchase(
          [void Function(SingleSourcePurchaseBuilder)? updates]) =>
      (SingleSourcePurchaseBuilder()..update(updates))._build();

  _$SingleSourcePurchase._(
      {required this.status,
      required this.profileRevision,
      this.variantId,
      this.sku,
      this.priceMinor,
      this.stock,
      this.binding})
      : super._();
  @override
  SingleSourcePurchase rebuild(
          void Function(SingleSourcePurchaseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SingleSourcePurchaseBuilder toBuilder() =>
      SingleSourcePurchaseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SingleSourcePurchase &&
        status == other.status &&
        profileRevision == other.profileRevision &&
        variantId == other.variantId &&
        sku == other.sku &&
        priceMinor == other.priceMinor &&
        stock == other.stock &&
        binding == other.binding;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, profileRevision.hashCode);
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, sku.hashCode);
    _$hash = $jc(_$hash, priceMinor.hashCode);
    _$hash = $jc(_$hash, stock.hashCode);
    _$hash = $jc(_$hash, binding.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SingleSourcePurchase')
          ..add('status', status)
          ..add('profileRevision', profileRevision)
          ..add('variantId', variantId)
          ..add('sku', sku)
          ..add('priceMinor', priceMinor)
          ..add('stock', stock)
          ..add('binding', binding))
        .toString();
  }
}

class SingleSourcePurchaseBuilder
    implements Builder<SingleSourcePurchase, SingleSourcePurchaseBuilder> {
  _$SingleSourcePurchase? _$v;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  int? _profileRevision;
  int? get profileRevision => _$this._profileRevision;
  set profileRevision(int? profileRevision) =>
      _$this._profileRevision = profileRevision;

  String? _variantId;
  String? get variantId => _$this._variantId;
  set variantId(String? variantId) => _$this._variantId = variantId;

  String? _sku;
  String? get sku => _$this._sku;
  set sku(String? sku) => _$this._sku = sku;

  int? _priceMinor;
  int? get priceMinor => _$this._priceMinor;
  set priceMinor(int? priceMinor) => _$this._priceMinor = priceMinor;

  int? _stock;
  int? get stock => _$this._stock;
  set stock(int? stock) => _$this._stock = stock;

  SingleSourceBindingBuilder? _binding;
  SingleSourceBindingBuilder get binding =>
      _$this._binding ??= SingleSourceBindingBuilder();
  set binding(SingleSourceBindingBuilder? binding) => _$this._binding = binding;

  SingleSourcePurchaseBuilder() {
    SingleSourcePurchase._defaults(this);
  }

  SingleSourcePurchaseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _profileRevision = $v.profileRevision;
      _variantId = $v.variantId;
      _sku = $v.sku;
      _priceMinor = $v.priceMinor;
      _stock = $v.stock;
      _binding = $v.binding?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SingleSourcePurchase other) {
    _$v = other as _$SingleSourcePurchase;
  }

  @override
  void update(void Function(SingleSourcePurchaseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SingleSourcePurchase build() => _build();

  _$SingleSourcePurchase _build() {
    _$SingleSourcePurchase _$result;
    try {
      _$result = _$v ??
          _$SingleSourcePurchase._(
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'SingleSourcePurchase', 'status'),
            profileRevision: BuiltValueNullFieldError.checkNotNull(
                profileRevision, r'SingleSourcePurchase', 'profileRevision'),
            variantId: variantId,
            sku: sku,
            priceMinor: priceMinor,
            stock: stock,
            binding: _binding?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'binding';
        _binding?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SingleSourcePurchase', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
