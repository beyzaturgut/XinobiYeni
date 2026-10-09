// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote_message.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$QuoteMessage extends QuoteMessage {
  @override
  final String from;
  @override
  final String text;
  @override
  final DateTime at;

  factory _$QuoteMessage([void Function(QuoteMessageBuilder)? updates]) =>
      (QuoteMessageBuilder()..update(updates))._build();

  _$QuoteMessage._({required this.from, required this.text, required this.at})
      : super._();
  @override
  QuoteMessage rebuild(void Function(QuoteMessageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  QuoteMessageBuilder toBuilder() => QuoteMessageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuoteMessage &&
        from == other.from &&
        text == other.text &&
        at == other.at;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, from.hashCode);
    _$hash = $jc(_$hash, text.hashCode);
    _$hash = $jc(_$hash, at.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuoteMessage')
          ..add('from', from)
          ..add('text', text)
          ..add('at', at))
        .toString();
  }
}

class QuoteMessageBuilder
    implements Builder<QuoteMessage, QuoteMessageBuilder> {
  _$QuoteMessage? _$v;

  String? _from;
  String? get from => _$this._from;
  set from(String? from) => _$this._from = from;

  String? _text;
  String? get text => _$this._text;
  set text(String? text) => _$this._text = text;

  DateTime? _at;
  DateTime? get at => _$this._at;
  set at(DateTime? at) => _$this._at = at;

  QuoteMessageBuilder() {
    QuoteMessage._defaults(this);
  }

  QuoteMessageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _from = $v.from;
      _text = $v.text;
      _at = $v.at;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(QuoteMessage other) {
    _$v = other as _$QuoteMessage;
  }

  @override
  void update(void Function(QuoteMessageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuoteMessage build() => _build();

  _$QuoteMessage _build() {
    final _$result = _$v ??
        _$QuoteMessage._(
          from: BuiltValueNullFieldError.checkNotNull(
              from, r'QuoteMessage', 'from'),
          text: BuiltValueNullFieldError.checkNotNull(
              text, r'QuoteMessage', 'text'),
          at: BuiltValueNullFieldError.checkNotNull(at, r'QuoteMessage', 'at'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
