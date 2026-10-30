// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'print_measurement.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PrintMeasurement extends PrintMeasurement {
  @override
  final double centerXmm;
  @override
  final double centerYmm;
  @override
  final double widthMm;
  @override
  final double heightMm;
  @override
  final double dpiX;
  @override
  final double dpiY;
  @override
  final int requiredWidthPx;
  @override
  final int requiredHeightPx;
  @override
  final bool fitsSafeArea;
  @override
  final bool meetsDpi;
  @override
  final bool intersectsExclusion;
  @override
  final bool? productionReady;

  factory _$PrintMeasurement(
          [void Function(PrintMeasurementBuilder)? updates]) =>
      (PrintMeasurementBuilder()..update(updates))._build();

  _$PrintMeasurement._(
      {required this.centerXmm,
      required this.centerYmm,
      required this.widthMm,
      required this.heightMm,
      required this.dpiX,
      required this.dpiY,
      required this.requiredWidthPx,
      required this.requiredHeightPx,
      required this.fitsSafeArea,
      required this.meetsDpi,
      required this.intersectsExclusion,
      this.productionReady})
      : super._();
  @override
  PrintMeasurement rebuild(void Function(PrintMeasurementBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PrintMeasurementBuilder toBuilder() =>
      PrintMeasurementBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PrintMeasurement &&
        centerXmm == other.centerXmm &&
        centerYmm == other.centerYmm &&
        widthMm == other.widthMm &&
        heightMm == other.heightMm &&
        dpiX == other.dpiX &&
        dpiY == other.dpiY &&
        requiredWidthPx == other.requiredWidthPx &&
        requiredHeightPx == other.requiredHeightPx &&
        fitsSafeArea == other.fitsSafeArea &&
        meetsDpi == other.meetsDpi &&
        intersectsExclusion == other.intersectsExclusion &&
        productionReady == other.productionReady;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, centerXmm.hashCode);
    _$hash = $jc(_$hash, centerYmm.hashCode);
    _$hash = $jc(_$hash, widthMm.hashCode);
    _$hash = $jc(_$hash, heightMm.hashCode);
    _$hash = $jc(_$hash, dpiX.hashCode);
    _$hash = $jc(_$hash, dpiY.hashCode);
    _$hash = $jc(_$hash, requiredWidthPx.hashCode);
    _$hash = $jc(_$hash, requiredHeightPx.hashCode);
    _$hash = $jc(_$hash, fitsSafeArea.hashCode);
    _$hash = $jc(_$hash, meetsDpi.hashCode);
    _$hash = $jc(_$hash, intersectsExclusion.hashCode);
    _$hash = $jc(_$hash, productionReady.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PrintMeasurement')
          ..add('centerXmm', centerXmm)
          ..add('centerYmm', centerYmm)
          ..add('widthMm', widthMm)
          ..add('heightMm', heightMm)
          ..add('dpiX', dpiX)
          ..add('dpiY', dpiY)
          ..add('requiredWidthPx', requiredWidthPx)
          ..add('requiredHeightPx', requiredHeightPx)
          ..add('fitsSafeArea', fitsSafeArea)
          ..add('meetsDpi', meetsDpi)
          ..add('intersectsExclusion', intersectsExclusion)
          ..add('productionReady', productionReady))
        .toString();
  }
}

class PrintMeasurementBuilder
    implements Builder<PrintMeasurement, PrintMeasurementBuilder> {
  _$PrintMeasurement? _$v;

  double? _centerXmm;
  double? get centerXmm => _$this._centerXmm;
  set centerXmm(double? centerXmm) => _$this._centerXmm = centerXmm;

  double? _centerYmm;
  double? get centerYmm => _$this._centerYmm;
  set centerYmm(double? centerYmm) => _$this._centerYmm = centerYmm;

  double? _widthMm;
  double? get widthMm => _$this._widthMm;
  set widthMm(double? widthMm) => _$this._widthMm = widthMm;

  double? _heightMm;
  double? get heightMm => _$this._heightMm;
  set heightMm(double? heightMm) => _$this._heightMm = heightMm;

  double? _dpiX;
  double? get dpiX => _$this._dpiX;
  set dpiX(double? dpiX) => _$this._dpiX = dpiX;

  double? _dpiY;
  double? get dpiY => _$this._dpiY;
  set dpiY(double? dpiY) => _$this._dpiY = dpiY;

  int? _requiredWidthPx;
  int? get requiredWidthPx => _$this._requiredWidthPx;
  set requiredWidthPx(int? requiredWidthPx) =>
      _$this._requiredWidthPx = requiredWidthPx;

  int? _requiredHeightPx;
  int? get requiredHeightPx => _$this._requiredHeightPx;
  set requiredHeightPx(int? requiredHeightPx) =>
      _$this._requiredHeightPx = requiredHeightPx;

  bool? _fitsSafeArea;
  bool? get fitsSafeArea => _$this._fitsSafeArea;
  set fitsSafeArea(bool? fitsSafeArea) => _$this._fitsSafeArea = fitsSafeArea;

  bool? _meetsDpi;
  bool? get meetsDpi => _$this._meetsDpi;
  set meetsDpi(bool? meetsDpi) => _$this._meetsDpi = meetsDpi;

  bool? _intersectsExclusion;
  bool? get intersectsExclusion => _$this._intersectsExclusion;
  set intersectsExclusion(bool? intersectsExclusion) =>
      _$this._intersectsExclusion = intersectsExclusion;

  bool? _productionReady;
  bool? get productionReady => _$this._productionReady;
  set productionReady(bool? productionReady) =>
      _$this._productionReady = productionReady;

  PrintMeasurementBuilder() {
    PrintMeasurement._defaults(this);
  }

  PrintMeasurementBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _centerXmm = $v.centerXmm;
      _centerYmm = $v.centerYmm;
      _widthMm = $v.widthMm;
      _heightMm = $v.heightMm;
      _dpiX = $v.dpiX;
      _dpiY = $v.dpiY;
      _requiredWidthPx = $v.requiredWidthPx;
      _requiredHeightPx = $v.requiredHeightPx;
      _fitsSafeArea = $v.fitsSafeArea;
      _meetsDpi = $v.meetsDpi;
      _intersectsExclusion = $v.intersectsExclusion;
      _productionReady = $v.productionReady;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PrintMeasurement other) {
    _$v = other as _$PrintMeasurement;
  }

  @override
  void update(void Function(PrintMeasurementBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PrintMeasurement build() => _build();

  _$PrintMeasurement _build() {
    final _$result = _$v ??
        _$PrintMeasurement._(
          centerXmm: BuiltValueNullFieldError.checkNotNull(
              centerXmm, r'PrintMeasurement', 'centerXmm'),
          centerYmm: BuiltValueNullFieldError.checkNotNull(
              centerYmm, r'PrintMeasurement', 'centerYmm'),
          widthMm: BuiltValueNullFieldError.checkNotNull(
              widthMm, r'PrintMeasurement', 'widthMm'),
          heightMm: BuiltValueNullFieldError.checkNotNull(
              heightMm, r'PrintMeasurement', 'heightMm'),
          dpiX: BuiltValueNullFieldError.checkNotNull(
              dpiX, r'PrintMeasurement', 'dpiX'),
          dpiY: BuiltValueNullFieldError.checkNotNull(
              dpiY, r'PrintMeasurement', 'dpiY'),
          requiredWidthPx: BuiltValueNullFieldError.checkNotNull(
              requiredWidthPx, r'PrintMeasurement', 'requiredWidthPx'),
          requiredHeightPx: BuiltValueNullFieldError.checkNotNull(
              requiredHeightPx, r'PrintMeasurement', 'requiredHeightPx'),
          fitsSafeArea: BuiltValueNullFieldError.checkNotNull(
              fitsSafeArea, r'PrintMeasurement', 'fitsSafeArea'),
          meetsDpi: BuiltValueNullFieldError.checkNotNull(
              meetsDpi, r'PrintMeasurement', 'meetsDpi'),
          intersectsExclusion: BuiltValueNullFieldError.checkNotNull(
              intersectsExclusion, r'PrintMeasurement', 'intersectsExclusion'),
          productionReady: productionReady,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
