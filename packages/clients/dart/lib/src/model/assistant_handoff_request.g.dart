// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_handoff_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantHandoffRequest extends AssistantHandoffRequest {
  @override
  final String clientId;

  factory _$AssistantHandoffRequest(
          [void Function(AssistantHandoffRequestBuilder)? updates]) =>
      (AssistantHandoffRequestBuilder()..update(updates))._build();

  _$AssistantHandoffRequest._({required this.clientId}) : super._();
  @override
  AssistantHandoffRequest rebuild(
          void Function(AssistantHandoffRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantHandoffRequestBuilder toBuilder() =>
      AssistantHandoffRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantHandoffRequest && clientId == other.clientId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, clientId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantHandoffRequest')
          ..add('clientId', clientId))
        .toString();
  }
}

class AssistantHandoffRequestBuilder
    implements
        Builder<AssistantHandoffRequest, AssistantHandoffRequestBuilder> {
  _$AssistantHandoffRequest? _$v;

  String? _clientId;
  String? get clientId => _$this._clientId;
  set clientId(String? clientId) => _$this._clientId = clientId;

  AssistantHandoffRequestBuilder() {
    AssistantHandoffRequest._defaults(this);
  }

  AssistantHandoffRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _clientId = $v.clientId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantHandoffRequest other) {
    _$v = other as _$AssistantHandoffRequest;
  }

  @override
  void update(void Function(AssistantHandoffRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantHandoffRequest build() => _build();

  _$AssistantHandoffRequest _build() {
    final _$result = _$v ??
        _$AssistantHandoffRequest._(
          clientId: BuiltValueNullFieldError.checkNotNull(
              clientId, r'AssistantHandoffRequest', 'clientId'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
