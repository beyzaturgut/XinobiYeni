// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'xinobi_u_generation_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$XinobiUGenerationRequest extends XinobiUGenerationRequest {
  @override
  final BuiltList<XinobiUAnswer> answers;

  factory _$XinobiUGenerationRequest(
          [void Function(XinobiUGenerationRequestBuilder)? updates]) =>
      (XinobiUGenerationRequestBuilder()..update(updates))._build();

  _$XinobiUGenerationRequest._({required this.answers}) : super._();
  @override
  XinobiUGenerationRequest rebuild(
          void Function(XinobiUGenerationRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  XinobiUGenerationRequestBuilder toBuilder() =>
      XinobiUGenerationRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is XinobiUGenerationRequest && answers == other.answers;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, answers.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'XinobiUGenerationRequest')
          ..add('answers', answers))
        .toString();
  }
}

class XinobiUGenerationRequestBuilder
    implements
        Builder<XinobiUGenerationRequest, XinobiUGenerationRequestBuilder> {
  _$XinobiUGenerationRequest? _$v;

  ListBuilder<XinobiUAnswer>? _answers;
  ListBuilder<XinobiUAnswer> get answers =>
      _$this._answers ??= ListBuilder<XinobiUAnswer>();
  set answers(ListBuilder<XinobiUAnswer>? answers) => _$this._answers = answers;

  XinobiUGenerationRequestBuilder() {
    XinobiUGenerationRequest._defaults(this);
  }

  XinobiUGenerationRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _answers = $v.answers.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(XinobiUGenerationRequest other) {
    _$v = other as _$XinobiUGenerationRequest;
  }

  @override
  void update(void Function(XinobiUGenerationRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  XinobiUGenerationRequest build() => _build();

  _$XinobiUGenerationRequest _build() {
    _$XinobiUGenerationRequest _$result;
    try {
      _$result = _$v ??
          _$XinobiUGenerationRequest._(
            answers: answers.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'answers';
        answers.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'XinobiUGenerationRequest', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
