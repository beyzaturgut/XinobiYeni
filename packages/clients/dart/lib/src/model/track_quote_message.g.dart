// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'track_quote_message.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$TrackQuoteMessage extends TrackQuoteMessage {
  @override
  final String email;
  @override
  final String text;

  factory _$TrackQuoteMessage(
          [void Function(TrackQuoteMessageBuilder)? updates]) =>
      (TrackQuoteMessageBuilder()..update(updates))._build();

  _$TrackQuoteMessage._({required this.email, required this.text}) : super._();
  @override
  TrackQuoteMessage rebuild(void Function(TrackQuoteMessageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TrackQuoteMessageBuilder toBuilder() =>
      TrackQuoteMessageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TrackQuoteMessage &&
        email == other.email &&
        text == other.text;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, text.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TrackQuoteMessage')
          ..add('email', email)
          ..add('text', text))
        .toString();
  }
}

class TrackQuoteMessageBuilder
    implements Builder<TrackQuoteMessage, TrackQuoteMessageBuilder> {
  _$TrackQuoteMessage? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _text;
  String? get text => _$this._text;
  set text(String? text) => _$this._text = text;

  TrackQuoteMessageBuilder() {
    TrackQuoteMessage._defaults(this);
  }

  TrackQuoteMessageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _text = $v.text;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TrackQuoteMessage other) {
    _$v = other as _$TrackQuoteMessage;
  }

  @override
  void update(void Function(TrackQuoteMessageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TrackQuoteMessage build() => _build();

  _$TrackQuoteMessage _build() {
    final _$result = _$v ??
        _$TrackQuoteMessage._(
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'TrackQuoteMessage', 'email'),
          text: BuiltValueNullFieldError.checkNotNull(
              text, r'TrackQuoteMessage', 'text'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
