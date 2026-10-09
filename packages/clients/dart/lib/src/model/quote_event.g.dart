// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote_event.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$QuoteEvent extends QuoteEvent {
  @override
  final String status;
  @override
  final DateTime at;
  @override
  final String actor;
  @override
  final String? note;

  factory _$QuoteEvent([void Function(QuoteEventBuilder)? updates]) =>
      (QuoteEventBuilder()..update(updates))._build();

  _$QuoteEvent._(
      {required this.status, required this.at, required this.actor, this.note})
      : super._();
  @override
  QuoteEvent rebuild(void Function(QuoteEventBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  QuoteEventBuilder toBuilder() => QuoteEventBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuoteEvent &&
        status == other.status &&
        at == other.at &&
        actor == other.actor &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, at.hashCode);
    _$hash = $jc(_$hash, actor.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuoteEvent')
          ..add('status', status)
          ..add('at', at)
          ..add('actor', actor)
          ..add('note', note))
        .toString();
  }
}

class QuoteEventBuilder implements Builder<QuoteEvent, QuoteEventBuilder> {
  _$QuoteEvent? _$v;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  DateTime? _at;
  DateTime? get at => _$this._at;
  set at(DateTime? at) => _$this._at = at;

  String? _actor;
  String? get actor => _$this._actor;
  set actor(String? actor) => _$this._actor = actor;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  QuoteEventBuilder() {
    QuoteEvent._defaults(this);
  }

  QuoteEventBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _at = $v.at;
      _actor = $v.actor;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(QuoteEvent other) {
    _$v = other as _$QuoteEvent;
  }

  @override
  void update(void Function(QuoteEventBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuoteEvent build() => _build();

  _$QuoteEvent _build() {
    final _$result = _$v ??
        _$QuoteEvent._(
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'QuoteEvent', 'status'),
          at: BuiltValueNullFieldError.checkNotNull(at, r'QuoteEvent', 'at'),
          actor: BuiltValueNullFieldError.checkNotNull(
              actor, r'QuoteEvent', 'actor'),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
