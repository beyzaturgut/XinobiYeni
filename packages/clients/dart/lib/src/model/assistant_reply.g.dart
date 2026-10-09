// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_reply.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantReply extends AssistantReply {
  @override
  final String conversationId;
  @override
  final AssistantMessage reply;
  @override
  final int remaining;

  factory _$AssistantReply([void Function(AssistantReplyBuilder)? updates]) =>
      (AssistantReplyBuilder()..update(updates))._build();

  _$AssistantReply._(
      {required this.conversationId,
      required this.reply,
      required this.remaining})
      : super._();
  @override
  AssistantReply rebuild(void Function(AssistantReplyBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantReplyBuilder toBuilder() => AssistantReplyBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantReply &&
        conversationId == other.conversationId &&
        reply == other.reply &&
        remaining == other.remaining;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, conversationId.hashCode);
    _$hash = $jc(_$hash, reply.hashCode);
    _$hash = $jc(_$hash, remaining.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantReply')
          ..add('conversationId', conversationId)
          ..add('reply', reply)
          ..add('remaining', remaining))
        .toString();
  }
}

class AssistantReplyBuilder
    implements Builder<AssistantReply, AssistantReplyBuilder> {
  _$AssistantReply? _$v;

  String? _conversationId;
  String? get conversationId => _$this._conversationId;
  set conversationId(String? conversationId) =>
      _$this._conversationId = conversationId;

  AssistantMessageBuilder? _reply;
  AssistantMessageBuilder get reply =>
      _$this._reply ??= AssistantMessageBuilder();
  set reply(AssistantMessageBuilder? reply) => _$this._reply = reply;

  int? _remaining;
  int? get remaining => _$this._remaining;
  set remaining(int? remaining) => _$this._remaining = remaining;

  AssistantReplyBuilder() {
    AssistantReply._defaults(this);
  }

  AssistantReplyBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _conversationId = $v.conversationId;
      _reply = $v.reply.toBuilder();
      _remaining = $v.remaining;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantReply other) {
    _$v = other as _$AssistantReply;
  }

  @override
  void update(void Function(AssistantReplyBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantReply build() => _build();

  _$AssistantReply _build() {
    _$AssistantReply _$result;
    try {
      _$result = _$v ??
          _$AssistantReply._(
            conversationId: BuiltValueNullFieldError.checkNotNull(
                conversationId, r'AssistantReply', 'conversationId'),
            reply: reply.build(),
            remaining: BuiltValueNullFieldError.checkNotNull(
                remaining, r'AssistantReply', 'remaining'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'reply';
        reply.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AssistantReply', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
