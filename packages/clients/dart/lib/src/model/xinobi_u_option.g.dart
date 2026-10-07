// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'xinobi_u_option.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$XinobiUOption extends XinobiUOption {
  @override
  final String id;
  @override
  final String label;

  factory _$XinobiUOption([void Function(XinobiUOptionBuilder)? updates]) =>
      (XinobiUOptionBuilder()..update(updates))._build();

  _$XinobiUOption._({required this.id, required this.label}) : super._();
  @override
  XinobiUOption rebuild(void Function(XinobiUOptionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  XinobiUOptionBuilder toBuilder() => XinobiUOptionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is XinobiUOption && id == other.id && label == other.label;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'XinobiUOption')
          ..add('id', id)
          ..add('label', label))
        .toString();
  }
}

class XinobiUOptionBuilder
    implements Builder<XinobiUOption, XinobiUOptionBuilder> {
  _$XinobiUOption? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  XinobiUOptionBuilder() {
    XinobiUOption._defaults(this);
  }

  XinobiUOptionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _label = $v.label;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(XinobiUOption other) {
    _$v = other as _$XinobiUOption;
  }

  @override
  void update(void Function(XinobiUOptionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  XinobiUOption build() => _build();

  _$XinobiUOption _build() {
    final _$result = _$v ??
        _$XinobiUOption._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'XinobiUOption', 'id'),
          label: BuiltValueNullFieldError.checkNotNull(
              label, r'XinobiUOption', 'label'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
