// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_message_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantMessageRequest extends AssistantMessageRequest {
  @override
  final String? conversationId;
  @override
  final String clientId;
  @override
  final String message;
  @override
  final String? channel;

  factory _$AssistantMessageRequest(
          [void Function(AssistantMessageRequestBuilder)? updates]) =>
      (AssistantMessageRequestBuilder()..update(updates))._build();

  _$AssistantMessageRequest._(
      {this.conversationId,
      required this.clientId,
      required this.message,
      this.channel})
      : super._();
  @override
  AssistantMessageRequest rebuild(
          void Function(AssistantMessageRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantMessageRequestBuilder toBuilder() =>
      AssistantMessageRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantMessageRequest &&
        conversationId == other.conversationId &&
        clientId == other.clientId &&
        message == other.message &&
        channel == other.channel;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, conversationId.hashCode);
    _$hash = $jc(_$hash, clientId.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jc(_$hash, channel.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantMessageRequest')
          ..add('conversationId', conversationId)
          ..add('clientId', clientId)
          ..add('message', message)
          ..add('channel', channel))
        .toString();
  }
}

class AssistantMessageRequestBuilder
    implements
        Builder<AssistantMessageRequest, AssistantMessageRequestBuilder> {
  _$AssistantMessageRequest? _$v;

  String? _conversationId;
  String? get conversationId => _$this._conversationId;
  set conversationId(String? conversationId) =>
      _$this._conversationId = conversationId;

  String? _clientId;
  String? get clientId => _$this._clientId;
  set clientId(String? clientId) => _$this._clientId = clientId;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  String? _channel;
  String? get channel => _$this._channel;
  set channel(String? channel) => _$this._channel = channel;

  AssistantMessageRequestBuilder() {
    AssistantMessageRequest._defaults(this);
  }

  AssistantMessageRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _conversationId = $v.conversationId;
      _clientId = $v.clientId;
      _message = $v.message;
      _channel = $v.channel;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantMessageRequest other) {
    _$v = other as _$AssistantMessageRequest;
  }

  @override
  void update(void Function(AssistantMessageRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantMessageRequest build() => _build();

  _$AssistantMessageRequest _build() {
    final _$result = _$v ??
        _$AssistantMessageRequest._(
          conversationId: conversationId,
          clientId: BuiltValueNullFieldError.checkNotNull(
              clientId, r'AssistantMessageRequest', 'clientId'),
          message: BuiltValueNullFieldError.checkNotNull(
              message, r'AssistantMessageRequest', 'message'),
          channel: channel,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
