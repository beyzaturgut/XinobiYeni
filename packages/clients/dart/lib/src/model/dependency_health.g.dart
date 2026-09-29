// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dependency_health.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DependencyHealth extends DependencyHealth {
  @override
  final String name;
  @override
  final bool isReady;
  @override
  final String code;

  factory _$DependencyHealth(
          [void Function(DependencyHealthBuilder)? updates]) =>
      (DependencyHealthBuilder()..update(updates))._build();

  _$DependencyHealth._(
      {required this.name, required this.isReady, required this.code})
      : super._();
  @override
  DependencyHealth rebuild(void Function(DependencyHealthBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DependencyHealthBuilder toBuilder() =>
      DependencyHealthBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DependencyHealth &&
        name == other.name &&
        isReady == other.isReady &&
        code == other.code;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, isReady.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DependencyHealth')
          ..add('name', name)
          ..add('isReady', isReady)
          ..add('code', code))
        .toString();
  }
}

class DependencyHealthBuilder
    implements Builder<DependencyHealth, DependencyHealthBuilder> {
  _$DependencyHealth? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  bool? _isReady;
  bool? get isReady => _$this._isReady;
  set isReady(bool? isReady) => _$this._isReady = isReady;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  DependencyHealthBuilder() {
    DependencyHealth._defaults(this);
  }

  DependencyHealthBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _isReady = $v.isReady;
      _code = $v.code;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DependencyHealth other) {
    _$v = other as _$DependencyHealth;
  }

  @override
  void update(void Function(DependencyHealthBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DependencyHealth build() => _build();

  _$DependencyHealth _build() {
    final _$result = _$v ??
        _$DependencyHealth._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'DependencyHealth', 'name'),
          isReady: BuiltValueNullFieldError.checkNotNull(
              isReady, r'DependencyHealth', 'isReady'),
          code: BuiltValueNullFieldError.checkNotNull(
              code, r'DependencyHealth', 'code'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
