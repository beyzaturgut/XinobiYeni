// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_conversation_view.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantConversationView extends AssistantConversationView {
  @override
  final String id;
  @override
  final BuiltList<AssistantMessage> messages;
  @override
  final bool leadSent;
  @override
  final bool handedOff;

  factory _$AssistantConversationView(
          [void Function(AssistantConversationViewBuilder)? updates]) =>
      (AssistantConversationViewBuilder()..update(updates))._build();

  _$AssistantConversationView._(
      {required this.id,
      required this.messages,
      required this.leadSent,
      required this.handedOff})
      : super._();
  @override
  AssistantConversationView rebuild(
          void Function(AssistantConversationViewBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantConversationViewBuilder toBuilder() =>
      AssistantConversationViewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantConversationView &&
        id == other.id &&
        messages == other.messages &&
        leadSent == other.leadSent &&
        handedOff == other.handedOff;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, messages.hashCode);
    _$hash = $jc(_$hash, leadSent.hashCode);
    _$hash = $jc(_$hash, handedOff.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantConversationView')
          ..add('id', id)
          ..add('messages', messages)
          ..add('leadSent', leadSent)
          ..add('handedOff', handedOff))
        .toString();
  }
}

class AssistantConversationViewBuilder
    implements
        Builder<AssistantConversationView, AssistantConversationViewBuilder> {
  _$AssistantConversationView? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  ListBuilder<AssistantMessage>? _messages;
  ListBuilder<AssistantMessage> get messages =>
      _$this._messages ??= ListBuilder<AssistantMessage>();
  set messages(ListBuilder<AssistantMessage>? messages) =>
      _$this._messages = messages;

  bool? _leadSent;
  bool? get leadSent => _$this._leadSent;
  set leadSent(bool? leadSent) => _$this._leadSent = leadSent;

  bool? _handedOff;
  bool? get handedOff => _$this._handedOff;
  set handedOff(bool? handedOff) => _$this._handedOff = handedOff;

  AssistantConversationViewBuilder() {
    AssistantConversationView._defaults(this);
  }

  AssistantConversationViewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _messages = $v.messages.toBuilder();
      _leadSent = $v.leadSent;
      _handedOff = $v.handedOff;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantConversationView other) {
    _$v = other as _$AssistantConversationView;
  }

  @override
  void update(void Function(AssistantConversationViewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantConversationView build() => _build();

  _$AssistantConversationView _build() {
    _$AssistantConversationView _$result;
    try {
      _$result = _$v ??
          _$AssistantConversationView._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'AssistantConversationView', 'id'),
            messages: messages.build(),
            leadSent: BuiltValueNullFieldError.checkNotNull(
                leadSent, r'AssistantConversationView', 'leadSent'),
            handedOff: BuiltValueNullFieldError.checkNotNull(
                handedOff, r'AssistantConversationView', 'handedOff'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'messages';
        messages.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AssistantConversationView', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
