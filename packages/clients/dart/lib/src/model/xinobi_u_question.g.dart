// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'xinobi_u_question.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$XinobiUQuestion extends XinobiUQuestion {
  @override
  final String id;
  @override
  final String axis;
  @override
  final String axisLabel;
  @override
  final String text;
  @override
  final BuiltList<XinobiUOption> options;

  factory _$XinobiUQuestion([void Function(XinobiUQuestionBuilder)? updates]) =>
      (XinobiUQuestionBuilder()..update(updates))._build();

  _$XinobiUQuestion._(
      {required this.id,
      required this.axis,
      required this.axisLabel,
      required this.text,
      required this.options})
      : super._();
  @override
  XinobiUQuestion rebuild(void Function(XinobiUQuestionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  XinobiUQuestionBuilder toBuilder() => XinobiUQuestionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is XinobiUQuestion &&
        id == other.id &&
        axis == other.axis &&
        axisLabel == other.axisLabel &&
        text == other.text &&
        options == other.options;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, axis.hashCode);
    _$hash = $jc(_$hash, axisLabel.hashCode);
    _$hash = $jc(_$hash, text.hashCode);
    _$hash = $jc(_$hash, options.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'XinobiUQuestion')
          ..add('id', id)
          ..add('axis', axis)
          ..add('axisLabel', axisLabel)
          ..add('text', text)
          ..add('options', options))
        .toString();
  }
}

class XinobiUQuestionBuilder
    implements Builder<XinobiUQuestion, XinobiUQuestionBuilder> {
  _$XinobiUQuestion? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _axis;
  String? get axis => _$this._axis;
  set axis(String? axis) => _$this._axis = axis;

  String? _axisLabel;
  String? get axisLabel => _$this._axisLabel;
  set axisLabel(String? axisLabel) => _$this._axisLabel = axisLabel;

  String? _text;
  String? get text => _$this._text;
  set text(String? text) => _$this._text = text;

  ListBuilder<XinobiUOption>? _options;
  ListBuilder<XinobiUOption> get options =>
      _$this._options ??= ListBuilder<XinobiUOption>();
  set options(ListBuilder<XinobiUOption>? options) => _$this._options = options;

  XinobiUQuestionBuilder() {
    XinobiUQuestion._defaults(this);
  }

  XinobiUQuestionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _axis = $v.axis;
      _axisLabel = $v.axisLabel;
      _text = $v.text;
      _options = $v.options.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(XinobiUQuestion other) {
    _$v = other as _$XinobiUQuestion;
  }

  @override
  void update(void Function(XinobiUQuestionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  XinobiUQuestion build() => _build();

  _$XinobiUQuestion _build() {
    _$XinobiUQuestion _$result;
    try {
      _$result = _$v ??
          _$XinobiUQuestion._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'XinobiUQuestion', 'id'),
            axis: BuiltValueNullFieldError.checkNotNull(
                axis, r'XinobiUQuestion', 'axis'),
            axisLabel: BuiltValueNullFieldError.checkNotNull(
                axisLabel, r'XinobiUQuestion', 'axisLabel'),
            text: BuiltValueNullFieldError.checkNotNull(
                text, r'XinobiUQuestion', 'text'),
            options: options.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'options';
        options.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'XinobiUQuestion', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
