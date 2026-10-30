// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'measure_print_placement.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MeasurePrintPlacement extends MeasurePrintPlacement {
  @override
  final int sourceWidth;
  @override
  final int sourceHeight;
  @override
  final String surfaceVersion;
  @override
  final double x;
  @override
  final double y;
  @override
  final double artworkWidthPx;
  @override
  final double artworkHeightPx;
  @override
  final double rotation;
  @override
  final int artworkPixelWidth;
  @override
  final int artworkPixelHeight;

  factory _$MeasurePrintPlacement(
          [void Function(MeasurePrintPlacementBuilder)? updates]) =>
      (MeasurePrintPlacementBuilder()..update(updates))._build();

  _$MeasurePrintPlacement._(
      {required this.sourceWidth,
      required this.sourceHeight,
      required this.surfaceVersion,
      required this.x,
      required this.y,
      required this.artworkWidthPx,
      required this.artworkHeightPx,
      required this.rotation,
      required this.artworkPixelWidth,
      required this.artworkPixelHeight})
      : super._();
  @override
  MeasurePrintPlacement rebuild(
          void Function(MeasurePrintPlacementBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MeasurePrintPlacementBuilder toBuilder() =>
      MeasurePrintPlacementBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MeasurePrintPlacement &&
        sourceWidth == other.sourceWidth &&
        sourceHeight == other.sourceHeight &&
        surfaceVersion == other.surfaceVersion &&
        x == other.x &&
        y == other.y &&
        artworkWidthPx == other.artworkWidthPx &&
        artworkHeightPx == other.artworkHeightPx &&
        rotation == other.rotation &&
        artworkPixelWidth == other.artworkPixelWidth &&
        artworkPixelHeight == other.artworkPixelHeight;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, sourceWidth.hashCode);
    _$hash = $jc(_$hash, sourceHeight.hashCode);
    _$hash = $jc(_$hash, surfaceVersion.hashCode);
    _$hash = $jc(_$hash, x.hashCode);
    _$hash = $jc(_$hash, y.hashCode);
    _$hash = $jc(_$hash, artworkWidthPx.hashCode);
    _$hash = $jc(_$hash, artworkHeightPx.hashCode);
    _$hash = $jc(_$hash, rotation.hashCode);
    _$hash = $jc(_$hash, artworkPixelWidth.hashCode);
    _$hash = $jc(_$hash, artworkPixelHeight.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MeasurePrintPlacement')
          ..add('sourceWidth', sourceWidth)
          ..add('sourceHeight', sourceHeight)
          ..add('surfaceVersion', surfaceVersion)
          ..add('x', x)
          ..add('y', y)
          ..add('artworkWidthPx', artworkWidthPx)
          ..add('artworkHeightPx', artworkHeightPx)
          ..add('rotation', rotation)
          ..add('artworkPixelWidth', artworkPixelWidth)
          ..add('artworkPixelHeight', artworkPixelHeight))
        .toString();
  }
}

class MeasurePrintPlacementBuilder
    implements Builder<MeasurePrintPlacement, MeasurePrintPlacementBuilder> {
  _$MeasurePrintPlacement? _$v;

  int? _sourceWidth;
  int? get sourceWidth => _$this._sourceWidth;
  set sourceWidth(int? sourceWidth) => _$this._sourceWidth = sourceWidth;

  int? _sourceHeight;
  int? get sourceHeight => _$this._sourceHeight;
  set sourceHeight(int? sourceHeight) => _$this._sourceHeight = sourceHeight;

  String? _surfaceVersion;
  String? get surfaceVersion => _$this._surfaceVersion;
  set surfaceVersion(String? surfaceVersion) =>
      _$this._surfaceVersion = surfaceVersion;

  double? _x;
  double? get x => _$this._x;
  set x(double? x) => _$this._x = x;

  double? _y;
  double? get y => _$this._y;
  set y(double? y) => _$this._y = y;

  double? _artworkWidthPx;
  double? get artworkWidthPx => _$this._artworkWidthPx;
  set artworkWidthPx(double? artworkWidthPx) =>
      _$this._artworkWidthPx = artworkWidthPx;

  double? _artworkHeightPx;
  double? get artworkHeightPx => _$this._artworkHeightPx;
  set artworkHeightPx(double? artworkHeightPx) =>
      _$this._artworkHeightPx = artworkHeightPx;

  double? _rotation;
  double? get rotation => _$this._rotation;
  set rotation(double? rotation) => _$this._rotation = rotation;

  int? _artworkPixelWidth;
  int? get artworkPixelWidth => _$this._artworkPixelWidth;
  set artworkPixelWidth(int? artworkPixelWidth) =>
      _$this._artworkPixelWidth = artworkPixelWidth;

  int? _artworkPixelHeight;
  int? get artworkPixelHeight => _$this._artworkPixelHeight;
  set artworkPixelHeight(int? artworkPixelHeight) =>
      _$this._artworkPixelHeight = artworkPixelHeight;

  MeasurePrintPlacementBuilder() {
    MeasurePrintPlacement._defaults(this);
  }

  MeasurePrintPlacementBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _sourceWidth = $v.sourceWidth;
      _sourceHeight = $v.sourceHeight;
      _surfaceVersion = $v.surfaceVersion;
      _x = $v.x;
      _y = $v.y;
      _artworkWidthPx = $v.artworkWidthPx;
      _artworkHeightPx = $v.artworkHeightPx;
      _rotation = $v.rotation;
      _artworkPixelWidth = $v.artworkPixelWidth;
      _artworkPixelHeight = $v.artworkPixelHeight;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MeasurePrintPlacement other) {
    _$v = other as _$MeasurePrintPlacement;
  }

  @override
  void update(void Function(MeasurePrintPlacementBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MeasurePrintPlacement build() => _build();

  _$MeasurePrintPlacement _build() {
    final _$result = _$v ??
        _$MeasurePrintPlacement._(
          sourceWidth: BuiltValueNullFieldError.checkNotNull(
              sourceWidth, r'MeasurePrintPlacement', 'sourceWidth'),
          sourceHeight: BuiltValueNullFieldError.checkNotNull(
              sourceHeight, r'MeasurePrintPlacement', 'sourceHeight'),
          surfaceVersion: BuiltValueNullFieldError.checkNotNull(
              surfaceVersion, r'MeasurePrintPlacement', 'surfaceVersion'),
          x: BuiltValueNullFieldError.checkNotNull(
              x, r'MeasurePrintPlacement', 'x'),
          y: BuiltValueNullFieldError.checkNotNull(
              y, r'MeasurePrintPlacement', 'y'),
          artworkWidthPx: BuiltValueNullFieldError.checkNotNull(
              artworkWidthPx, r'MeasurePrintPlacement', 'artworkWidthPx'),
          artworkHeightPx: BuiltValueNullFieldError.checkNotNull(
              artworkHeightPx, r'MeasurePrintPlacement', 'artworkHeightPx'),
          rotation: BuiltValueNullFieldError.checkNotNull(
              rotation, r'MeasurePrintPlacement', 'rotation'),
          artworkPixelWidth: BuiltValueNullFieldError.checkNotNull(
              artworkPixelWidth, r'MeasurePrintPlacement', 'artworkPixelWidth'),
          artworkPixelHeight: BuiltValueNullFieldError.checkNotNull(
              artworkPixelHeight,
              r'MeasurePrintPlacement',
              'artworkPixelHeight'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
