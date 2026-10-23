// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'body_placement.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$BodyPlacement extends BodyPlacement {
  @override
  final double? x;
  @override
  final double? y;
  @override
  final double? scale;
  @override
  final double? rotation;

  factory _$BodyPlacement([void Function(BodyPlacementBuilder)? updates]) =>
      (BodyPlacementBuilder()..update(updates))._build();

  _$BodyPlacement._({this.x, this.y, this.scale, this.rotation}) : super._();
  @override
  BodyPlacement rebuild(void Function(BodyPlacementBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  BodyPlacementBuilder toBuilder() => BodyPlacementBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is BodyPlacement &&
        x == other.x &&
        y == other.y &&
        scale == other.scale &&
        rotation == other.rotation;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, x.hashCode);
    _$hash = $jc(_$hash, y.hashCode);
    _$hash = $jc(_$hash, scale.hashCode);
    _$hash = $jc(_$hash, rotation.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'BodyPlacement')
          ..add('x', x)
          ..add('y', y)
          ..add('scale', scale)
          ..add('rotation', rotation))
        .toString();
  }
}

class BodyPlacementBuilder
    implements Builder<BodyPlacement, BodyPlacementBuilder> {
  _$BodyPlacement? _$v;

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

  BodyPlacementBuilder() {
    BodyPlacement._defaults(this);
  }

  BodyPlacementBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _x = $v.x;
      _y = $v.y;
      _scale = $v.scale;
      _rotation = $v.rotation;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(BodyPlacement other) {
    _$v = other as _$BodyPlacement;
  }

  @override
  void update(void Function(BodyPlacementBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  BodyPlacement build() => _build();

  _$BodyPlacement _build() {
    final _$result = _$v ??
        _$BodyPlacement._(
          x: x,
          y: y,
          scale: scale,
          rotation: rotation,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
