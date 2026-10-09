// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_handoff.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantHandoff extends AssistantHandoff {
  @override
  final String channel;
  @override
  final String? url;
  @override
  final String message;

  factory _$AssistantHandoff(
          [void Function(AssistantHandoffBuilder)? updates]) =>
      (AssistantHandoffBuilder()..update(updates))._build();

  _$AssistantHandoff._({required this.channel, this.url, required this.message})
      : super._();
  @override
  AssistantHandoff rebuild(void Function(AssistantHandoffBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantHandoffBuilder toBuilder() =>
      AssistantHandoffBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantHandoff &&
        channel == other.channel &&
        url == other.url &&
        message == other.message;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, channel.hashCode);
    _$hash = $jc(_$hash, url.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantHandoff')
          ..add('channel', channel)
          ..add('url', url)
          ..add('message', message))
        .toString();
  }
}

class AssistantHandoffBuilder
    implements Builder<AssistantHandoff, AssistantHandoffBuilder> {
  _$AssistantHandoff? _$v;

  String? _channel;
  String? get channel => _$this._channel;
  set channel(String? channel) => _$this._channel = channel;

  String? _url;
  String? get url => _$this._url;
  set url(String? url) => _$this._url = url;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  AssistantHandoffBuilder() {
    AssistantHandoff._defaults(this);
  }

  AssistantHandoffBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _channel = $v.channel;
      _url = $v.url;
      _message = $v.message;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantHandoff other) {
    _$v = other as _$AssistantHandoff;
  }

  @override
  void update(void Function(AssistantHandoffBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantHandoff build() => _build();

  _$AssistantHandoff _build() {
    final _$result = _$v ??
        _$AssistantHandoff._(
          channel: BuiltValueNullFieldError.checkNotNull(
              channel, r'AssistantHandoff', 'channel'),
          url: url,
          message: BuiltValueNullFieldError.checkNotNull(
              message, r'AssistantHandoff', 'message'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
