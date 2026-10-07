// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'xinobi_u_status.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$XinobiUStatus extends XinobiUStatus {
  @override
  final bool generationAvailable;
  @override
  final String questionBankVersion;
  @override
  final int questionCount;

  factory _$XinobiUStatus([void Function(XinobiUStatusBuilder)? updates]) =>
      (XinobiUStatusBuilder()..update(updates))._build();

  _$XinobiUStatus._(
      {required this.generationAvailable,
      required this.questionBankVersion,
      required this.questionCount})
      : super._();
  @override
  XinobiUStatus rebuild(void Function(XinobiUStatusBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  XinobiUStatusBuilder toBuilder() => XinobiUStatusBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is XinobiUStatus &&
        generationAvailable == other.generationAvailable &&
        questionBankVersion == other.questionBankVersion &&
        questionCount == other.questionCount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, generationAvailable.hashCode);
    _$hash = $jc(_$hash, questionBankVersion.hashCode);
    _$hash = $jc(_$hash, questionCount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'XinobiUStatus')
          ..add('generationAvailable', generationAvailable)
          ..add('questionBankVersion', questionBankVersion)
          ..add('questionCount', questionCount))
        .toString();
  }
}

class XinobiUStatusBuilder
    implements Builder<XinobiUStatus, XinobiUStatusBuilder> {
  _$XinobiUStatus? _$v;

  bool? _generationAvailable;
  bool? get generationAvailable => _$this._generationAvailable;
  set generationAvailable(bool? generationAvailable) =>
      _$this._generationAvailable = generationAvailable;

  String? _questionBankVersion;
  String? get questionBankVersion => _$this._questionBankVersion;
  set questionBankVersion(String? questionBankVersion) =>
      _$this._questionBankVersion = questionBankVersion;

  int? _questionCount;
  int? get questionCount => _$this._questionCount;
  set questionCount(int? questionCount) =>
      _$this._questionCount = questionCount;

  XinobiUStatusBuilder() {
    XinobiUStatus._defaults(this);
  }

  XinobiUStatusBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _generationAvailable = $v.generationAvailable;
      _questionBankVersion = $v.questionBankVersion;
      _questionCount = $v.questionCount;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(XinobiUStatus other) {
    _$v = other as _$XinobiUStatus;
  }

  @override
  void update(void Function(XinobiUStatusBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  XinobiUStatus build() => _build();

  _$XinobiUStatus _build() {
    final _$result = _$v ??
        _$XinobiUStatus._(
          generationAvailable: BuiltValueNullFieldError.checkNotNull(
              generationAvailable, r'XinobiUStatus', 'generationAvailable'),
          questionBankVersion: BuiltValueNullFieldError.checkNotNull(
              questionBankVersion, r'XinobiUStatus', 'questionBankVersion'),
          questionCount: BuiltValueNullFieldError.checkNotNull(
              questionCount, r'XinobiUStatus', 'questionCount'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
