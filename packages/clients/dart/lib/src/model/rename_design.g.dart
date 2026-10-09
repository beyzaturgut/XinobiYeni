// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'rename_design.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$RenameDesign extends RenameDesign {
  @override
  final String name;

  factory _$RenameDesign([void Function(RenameDesignBuilder)? updates]) =>
      (RenameDesignBuilder()..update(updates))._build();

  _$RenameDesign._({required this.name}) : super._();
  @override
  RenameDesign rebuild(void Function(RenameDesignBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RenameDesignBuilder toBuilder() => RenameDesignBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RenameDesign && name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RenameDesign')..add('name', name))
        .toString();
  }
}

class RenameDesignBuilder
    implements Builder<RenameDesign, RenameDesignBuilder> {
  _$RenameDesign? _$v;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  RenameDesignBuilder() {
    RenameDesign._defaults(this);
  }

  RenameDesignBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RenameDesign other) {
    _$v = other as _$RenameDesign;
  }

  @override
  void update(void Function(RenameDesignBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RenameDesign build() => _build();

  _$RenameDesign _build() {
    final _$result = _$v ??
        _$RenameDesign._(
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'RenameDesign', 'name'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
