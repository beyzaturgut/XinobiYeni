// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'xinobi_u_answer.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$XinobiUAnswer extends XinobiUAnswer {
  @override
  final String questionId;
  @override
  final String optionId;

  factory _$XinobiUAnswer([void Function(XinobiUAnswerBuilder)? updates]) =>
      (XinobiUAnswerBuilder()..update(updates))._build();

  _$XinobiUAnswer._({required this.questionId, required this.optionId})
      : super._();
  @override
  XinobiUAnswer rebuild(void Function(XinobiUAnswerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  XinobiUAnswerBuilder toBuilder() => XinobiUAnswerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is XinobiUAnswer &&
        questionId == other.questionId &&
        optionId == other.optionId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, questionId.hashCode);
    _$hash = $jc(_$hash, optionId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'XinobiUAnswer')
          ..add('questionId', questionId)
          ..add('optionId', optionId))
        .toString();
  }
}

class XinobiUAnswerBuilder
    implements Builder<XinobiUAnswer, XinobiUAnswerBuilder> {
  _$XinobiUAnswer? _$v;

  String? _questionId;
  String? get questionId => _$this._questionId;
  set questionId(String? questionId) => _$this._questionId = questionId;

  String? _optionId;
  String? get optionId => _$this._optionId;
  set optionId(String? optionId) => _$this._optionId = optionId;

  XinobiUAnswerBuilder() {
    XinobiUAnswer._defaults(this);
  }

  XinobiUAnswerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _questionId = $v.questionId;
      _optionId = $v.optionId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(XinobiUAnswer other) {
    _$v = other as _$XinobiUAnswer;
  }

  @override
  void update(void Function(XinobiUAnswerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  XinobiUAnswer build() => _build();

  _$XinobiUAnswer _build() {
    final _$result = _$v ??
        _$XinobiUAnswer._(
          questionId: BuiltValueNullFieldError.checkNotNull(
              questionId, r'XinobiUAnswer', 'questionId'),
          optionId: BuiltValueNullFieldError.checkNotNull(
              optionId, r'XinobiUAnswer', 'optionId'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
