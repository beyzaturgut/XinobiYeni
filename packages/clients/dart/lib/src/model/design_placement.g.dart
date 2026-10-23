// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'design_placement.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DesignPlacement extends DesignPlacement {
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
  final double scale;
  @override
  final double rotation;
  @override
  final double curvatureStrength;
  @override
  final BuiltMap<String, BodyPlacement>? bodyAdjustments;
  @override
  final String? mode;
  @override
  final bool? fillMask;

  factory _$DesignPlacement([void Function(DesignPlacementBuilder)? updates]) =>
      (DesignPlacementBuilder()..update(updates))._build();

  _$DesignPlacement._(
      {required this.sourceWidth,
      required this.sourceHeight,
      required this.surfaceVersion,
      required this.x,
      required this.y,
      required this.scale,
      required this.rotation,
      required this.curvatureStrength,
      this.bodyAdjustments,
      this.mode,
      this.fillMask})
      : super._();
  @override
  DesignPlacement rebuild(void Function(DesignPlacementBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DesignPlacementBuilder toBuilder() => DesignPlacementBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DesignPlacement &&
        sourceWidth == other.sourceWidth &&
        sourceHeight == other.sourceHeight &&
        surfaceVersion == other.surfaceVersion &&
        x == other.x &&
        y == other.y &&
        scale == other.scale &&
        rotation == other.rotation &&
        curvatureStrength == other.curvatureStrength &&
        bodyAdjustments == other.bodyAdjustments &&
        mode == other.mode &&
        fillMask == other.fillMask;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, sourceWidth.hashCode);
    _$hash = $jc(_$hash, sourceHeight.hashCode);
    _$hash = $jc(_$hash, surfaceVersion.hashCode);
    _$hash = $jc(_$hash, x.hashCode);
    _$hash = $jc(_$hash, y.hashCode);
    _$hash = $jc(_$hash, scale.hashCode);
    _$hash = $jc(_$hash, rotation.hashCode);
    _$hash = $jc(_$hash, curvatureStrength.hashCode);
    _$hash = $jc(_$hash, bodyAdjustments.hashCode);
    _$hash = $jc(_$hash, mode.hashCode);
    _$hash = $jc(_$hash, fillMask.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DesignPlacement')
          ..add('sourceWidth', sourceWidth)
          ..add('sourceHeight', sourceHeight)
          ..add('surfaceVersion', surfaceVersion)
          ..add('x', x)
          ..add('y', y)
          ..add('scale', scale)
          ..add('rotation', rotation)
          ..add('curvatureStrength', curvatureStrength)
          ..add('bodyAdjustments', bodyAdjustments)
          ..add('mode', mode)
          ..add('fillMask', fillMask))
        .toString();
  }
}

class DesignPlacementBuilder
    implements Builder<DesignPlacement, DesignPlacementBuilder> {
  _$DesignPlacement? _$v;

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

  double? _scale;
  double? get scale => _$this._scale;
  set scale(double? scale) => _$this._scale = scale;

  double? _rotation;
  double? get rotation => _$this._rotation;
  set rotation(double? rotation) => _$this._rotation = rotation;

  double? _curvatureStrength;
  double? get curvatureStrength => _$this._curvatureStrength;
  set curvatureStrength(double? curvatureStrength) =>
      _$this._curvatureStrength = curvatureStrength;

  MapBuilder<String, BodyPlacement>? _bodyAdjustments;
  MapBuilder<String, BodyPlacement> get bodyAdjustments =>
      _$this._bodyAdjustments ??= MapBuilder<String, BodyPlacement>();
  set bodyAdjustments(MapBuilder<String, BodyPlacement>? bodyAdjustments) =>
      _$this._bodyAdjustments = bodyAdjustments;

  String? _mode;
  String? get mode => _$this._mode;
  set mode(String? mode) => _$this._mode = mode;

  bool? _fillMask;
  bool? get fillMask => _$this._fillMask;
  set fillMask(bool? fillMask) => _$this._fillMask = fillMask;

  DesignPlacementBuilder() {
    DesignPlacement._defaults(this);
  }

  DesignPlacementBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _sourceWidth = $v.sourceWidth;
      _sourceHeight = $v.sourceHeight;
      _surfaceVersion = $v.surfaceVersion;
      _x = $v.x;
      _y = $v.y;
      _scale = $v.scale;
      _rotation = $v.rotation;
      _curvatureStrength = $v.curvatureStrength;
      _bodyAdjustments = $v.bodyAdjustments?.toBuilder();
      _mode = $v.mode;
      _fillMask = $v.fillMask;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DesignPlacement other) {
    _$v = other as _$DesignPlacement;
  }

  @override
  void update(void Function(DesignPlacementBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DesignPlacement build() => _build();

  _$DesignPlacement _build() {
    _$DesignPlacement _$result;
    try {
      _$result = _$v ??
          _$DesignPlacement._(
            sourceWidth: BuiltValueNullFieldError.checkNotNull(
                sourceWidth, r'DesignPlacement', 'sourceWidth'),
            sourceHeight: BuiltValueNullFieldError.checkNotNull(
                sourceHeight, r'DesignPlacement', 'sourceHeight'),
            surfaceVersion: BuiltValueNullFieldError.checkNotNull(
                surfaceVersion, r'DesignPlacement', 'surfaceVersion'),
            x: BuiltValueNullFieldError.checkNotNull(
                x, r'DesignPlacement', 'x'),
            y: BuiltValueNullFieldError.checkNotNull(
                y, r'DesignPlacement', 'y'),
            scale: BuiltValueNullFieldError.checkNotNull(
                scale, r'DesignPlacement', 'scale'),
            rotation: BuiltValueNullFieldError.checkNotNull(
                rotation, r'DesignPlacement', 'rotation'),
            curvatureStrength: BuiltValueNullFieldError.checkNotNull(
                curvatureStrength, r'DesignPlacement', 'curvatureStrength'),
            bodyAdjustments: _bodyAdjustments?.build(),
            mode: mode,
            fillMask: fillMask,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'bodyAdjustments';
        _bodyAdjustments?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'DesignPlacement', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
