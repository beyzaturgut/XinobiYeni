// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote_decision.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$QuoteDecision extends QuoteDecision {
  @override
  final String email;
  @override
  final String decision;
  @override
  final String? note;

  factory _$QuoteDecision([void Function(QuoteDecisionBuilder)? updates]) =>
      (QuoteDecisionBuilder()..update(updates))._build();

  _$QuoteDecision._({required this.email, required this.decision, this.note})
      : super._();
  @override
  QuoteDecision rebuild(void Function(QuoteDecisionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  QuoteDecisionBuilder toBuilder() => QuoteDecisionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuoteDecision &&
        email == other.email &&
        decision == other.decision &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, decision.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuoteDecision')
          ..add('email', email)
          ..add('decision', decision)
          ..add('note', note))
        .toString();
  }
}

class QuoteDecisionBuilder
    implements Builder<QuoteDecision, QuoteDecisionBuilder> {
  _$QuoteDecision? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _decision;
  String? get decision => _$this._decision;
  set decision(String? decision) => _$this._decision = decision;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  QuoteDecisionBuilder() {
    QuoteDecision._defaults(this);
  }

  QuoteDecisionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _decision = $v.decision;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(QuoteDecision other) {
    _$v = other as _$QuoteDecision;
  }

  @override
  void update(void Function(QuoteDecisionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuoteDecision build() => _build();

  _$QuoteDecision _build() {
    final _$result = _$v ??
        _$QuoteDecision._(
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'QuoteDecision', 'email'),
          decision: BuiltValueNullFieldError.checkNotNull(
              decision, r'QuoteDecision', 'decision'),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
