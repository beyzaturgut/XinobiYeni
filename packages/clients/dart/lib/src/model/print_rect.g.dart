// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'print_rect.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PrintRect extends PrintRect {
  @override
  final double x;
  @override
  final double y;
  @override
  final double width;
  @override
  final double height;

  factory _$PrintRect([void Function(PrintRectBuilder)? updates]) =>
      (PrintRectBuilder()..update(updates))._build();

  _$PrintRect._(
      {required this.x,
      required this.y,
      required this.width,
      required this.height})
      : super._();
  @override
  PrintRect rebuild(void Function(PrintRectBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PrintRectBuilder toBuilder() => PrintRectBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PrintRect &&
        x == other.x &&
        y == other.y &&
        width == other.width &&
        height == other.height;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, x.hashCode);
    _$hash = $jc(_$hash, y.hashCode);
    _$hash = $jc(_$hash, width.hashCode);
    _$hash = $jc(_$hash, height.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PrintRect')
          ..add('x', x)
          ..add('y', y)
          ..add('width', width)
          ..add('height', height))
        .toString();
  }
}

class PrintRectBuilder implements Builder<PrintRect, PrintRectBuilder> {
  _$PrintRect? _$v;

  double? _x;
  double? get x => _$this._x;
  set x(double? x) => _$this._x = x;

  double? _y;
  double? get y => _$this._y;
  set y(double? y) => _$this._y = y;

  double? _width;
  double? get width => _$this._width;
  set width(double? width) => _$this._width = width;

  double? _height;
  double? get height => _$this._height;
  set height(double? height) => _$this._height = height;

  PrintRectBuilder() {
    PrintRect._defaults(this);
  }

  PrintRectBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _x = $v.x;
      _y = $v.y;
      _width = $v.width;
      _height = $v.height;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PrintRect other) {
    _$v = other as _$PrintRect;
  }

  @override
  void update(void Function(PrintRectBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PrintRect build() => _build();

  _$PrintRect _build() {
    final _$result = _$v ??
        _$PrintRect._(
          x: BuiltValueNullFieldError.checkNotNull(x, r'PrintRect', 'x'),
          y: BuiltValueNullFieldError.checkNotNull(y, r'PrintRect', 'y'),
          width: BuiltValueNullFieldError.checkNotNull(
              width, r'PrintRect', 'width'),
          height: BuiltValueNullFieldError.checkNotNull(
              height, r'PrintRect', 'height'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
