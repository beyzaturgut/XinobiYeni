// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_lead_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantLeadRequest extends AssistantLeadRequest {
  @override
  final String clientId;
  @override
  final String name;
  @override
  final String email;
  @override
  final String? phone;
  @override
  final String topic;
  @override
  final bool consent;

  factory _$AssistantLeadRequest(
          [void Function(AssistantLeadRequestBuilder)? updates]) =>
      (AssistantLeadRequestBuilder()..update(updates))._build();

  _$AssistantLeadRequest._(
      {required this.clientId,
      required this.name,
      required this.email,
      this.phone,
      required this.topic,
      required this.consent})
      : super._();
  @override
  AssistantLeadRequest rebuild(
          void Function(AssistantLeadRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantLeadRequestBuilder toBuilder() =>
      AssistantLeadRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantLeadRequest &&
        clientId == other.clientId &&
        name == other.name &&
        email == other.email &&
        phone == other.phone &&
        topic == other.topic &&
        consent == other.consent;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, clientId.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jc(_$hash, topic.hashCode);
    _$hash = $jc(_$hash, consent.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantLeadRequest')
          ..add('clientId', clientId)
          ..add('name', name)
          ..add('email', email)
          ..add('phone', phone)
          ..add('topic', topic)
          ..add('consent', consent))
        .toString();
  }
}

class AssistantLeadRequestBuilder
    implements Builder<AssistantLeadRequest, AssistantLeadRequestBuilder> {
  _$AssistantLeadRequest? _$v;

  String? _clientId;
  String? get clientId => _$this._clientId;
  set clientId(String? clientId) => _$this._clientId = clientId;

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

  bool? _consent;
  bool? get consent => _$this._consent;
  set consent(bool? consent) => _$this._consent = consent;

  AssistantLeadRequestBuilder() {
    AssistantLeadRequest._defaults(this);
  }

  AssistantLeadRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _clientId = $v.clientId;
      _name = $v.name;
      _email = $v.email;
      _phone = $v.phone;
      _topic = $v.topic;
      _consent = $v.consent;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantLeadRequest other) {
    _$v = other as _$AssistantLeadRequest;
  }

  @override
  void update(void Function(AssistantLeadRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantLeadRequest build() => _build();

  _$AssistantLeadRequest _build() {
    final _$result = _$v ??
        _$AssistantLeadRequest._(
          clientId: BuiltValueNullFieldError.checkNotNull(
              clientId, r'AssistantLeadRequest', 'clientId'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'AssistantLeadRequest', 'name'),
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'AssistantLeadRequest', 'email'),
          phone: phone,
          topic: BuiltValueNullFieldError.checkNotNull(
              topic, r'AssistantLeadRequest', 'topic'),
          consent: BuiltValueNullFieldError.checkNotNull(
              consent, r'AssistantLeadRequest', 'consent'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
