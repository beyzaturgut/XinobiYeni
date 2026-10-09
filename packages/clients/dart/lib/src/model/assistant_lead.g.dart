// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_lead.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantLead extends AssistantLead {
  @override
  final String id;
  @override
  final String conversationId;
  @override
  final String name;
  @override
  final String email;
  @override
  final String? phone;
  @override
  final String topic;
  @override
  final DateTime createdAt;
  @override
  final String status;
  @override
  final String? note;

  factory _$AssistantLead([void Function(AssistantLeadBuilder)? updates]) =>
      (AssistantLeadBuilder()..update(updates))._build();

  _$AssistantLead._(
      {required this.id,
      required this.conversationId,
      required this.name,
      required this.email,
      this.phone,
      required this.topic,
      required this.createdAt,
      required this.status,
      this.note})
      : super._();
  @override
  AssistantLead rebuild(void Function(AssistantLeadBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantLeadBuilder toBuilder() => AssistantLeadBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantLead &&
        id == other.id &&
        conversationId == other.conversationId &&
        name == other.name &&
        email == other.email &&
        phone == other.phone &&
        topic == other.topic &&
        createdAt == other.createdAt &&
        status == other.status &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, conversationId.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jc(_$hash, topic.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantLead')
          ..add('id', id)
          ..add('conversationId', conversationId)
          ..add('name', name)
          ..add('email', email)
          ..add('phone', phone)
          ..add('topic', topic)
          ..add('createdAt', createdAt)
          ..add('status', status)
          ..add('note', note))
        .toString();
  }
}

class AssistantLeadBuilder
    implements Builder<AssistantLead, AssistantLeadBuilder> {
  _$AssistantLead? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _conversationId;
  String? get conversationId => _$this._conversationId;
  set conversationId(String? conversationId) =>
      _$this._conversationId = conversationId;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _phone;
  String? get phone => _$this._phone;
  set phone(String? phone) => _$this._phone = phone;

  String? _topic;
  String? get topic => _$this._topic;
  set topic(String? topic) => _$this._topic = topic;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  AssistantLeadBuilder() {
    AssistantLead._defaults(this);
  }

  AssistantLeadBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _conversationId = $v.conversationId;
      _name = $v.name;
      _email = $v.email;
      _phone = $v.phone;
      _topic = $v.topic;
      _createdAt = $v.createdAt;
      _status = $v.status;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantLead other) {
    _$v = other as _$AssistantLead;
  }

  @override
  void update(void Function(AssistantLeadBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantLead build() => _build();

  _$AssistantLead _build() {
    final _$result = _$v ??
        _$AssistantLead._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'AssistantLead', 'id'),
          conversationId: BuiltValueNullFieldError.checkNotNull(
              conversationId, r'AssistantLead', 'conversationId'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'AssistantLead', 'name'),
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'AssistantLead', 'email'),
          phone: phone,
          topic: BuiltValueNullFieldError.checkNotNull(
              topic, r'AssistantLead', 'topic'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'AssistantLead', 'createdAt'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'AssistantLead', 'status'),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
