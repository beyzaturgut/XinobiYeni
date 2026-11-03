// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_surat_shipment.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateSuratShipment extends CreateSuratShipment {
  @override
  final int parcelCount;
  @override
  final double parcelDesi;
  @override
  final double parcelKg;
  @override
  final int paymentType;

  factory _$CreateSuratShipment(
          [void Function(CreateSuratShipmentBuilder)? updates]) =>
      (CreateSuratShipmentBuilder()..update(updates))._build();

  _$CreateSuratShipment._(
      {required this.parcelCount,
      required this.parcelDesi,
      required this.parcelKg,
      required this.paymentType})
      : super._();
  @override
  CreateSuratShipment rebuild(
          void Function(CreateSuratShipmentBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CreateSuratShipmentBuilder toBuilder() =>
      CreateSuratShipmentBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateSuratShipment &&
        parcelCount == other.parcelCount &&
        parcelDesi == other.parcelDesi &&
        parcelKg == other.parcelKg &&
        paymentType == other.paymentType;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, parcelCount.hashCode);
    _$hash = $jc(_$hash, parcelDesi.hashCode);
    _$hash = $jc(_$hash, parcelKg.hashCode);
    _$hash = $jc(_$hash, paymentType.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreateSuratShipment')
          ..add('parcelCount', parcelCount)
          ..add('parcelDesi', parcelDesi)
          ..add('parcelKg', parcelKg)
          ..add('paymentType', paymentType))
        .toString();
  }
}

class CreateSuratShipmentBuilder
    implements Builder<CreateSuratShipment, CreateSuratShipmentBuilder> {
  _$CreateSuratShipment? _$v;

  int? _parcelCount;
  int? get parcelCount => _$this._parcelCount;
  set parcelCount(int? parcelCount) => _$this._parcelCount = parcelCount;

  double? _parcelDesi;
  double? get parcelDesi => _$this._parcelDesi;
  set parcelDesi(double? parcelDesi) => _$this._parcelDesi = parcelDesi;

  double? _parcelKg;
  double? get parcelKg => _$this._parcelKg;
  set parcelKg(double? parcelKg) => _$this._parcelKg = parcelKg;

  int? _paymentType;
  int? get paymentType => _$this._paymentType;
  set paymentType(int? paymentType) => _$this._paymentType = paymentType;

  CreateSuratShipmentBuilder() {
    CreateSuratShipment._defaults(this);
  }

  CreateSuratShipmentBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _parcelCount = $v.parcelCount;
      _parcelDesi = $v.parcelDesi;
      _parcelKg = $v.parcelKg;
      _paymentType = $v.paymentType;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreateSuratShipment other) {
    _$v = other as _$CreateSuratShipment;
  }

  @override
  void update(void Function(CreateSuratShipmentBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateSuratShipment build() => _build();

  _$CreateSuratShipment _build() {
    final _$result = _$v ??
        _$CreateSuratShipment._(
          parcelCount: BuiltValueNullFieldError.checkNotNull(
              parcelCount, r'CreateSuratShipment', 'parcelCount'),
          parcelDesi: BuiltValueNullFieldError.checkNotNull(
              parcelDesi, r'CreateSuratShipment', 'parcelDesi'),
          parcelKg: BuiltValueNullFieldError.checkNotNull(
              parcelKg, r'CreateSuratShipment', 'parcelKg'),
          paymentType: BuiltValueNullFieldError.checkNotNull(
              paymentType, r'CreateSuratShipment', 'paymentType'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
