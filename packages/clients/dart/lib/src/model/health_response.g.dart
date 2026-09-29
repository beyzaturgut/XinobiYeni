// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'health_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$HealthResponse extends HealthResponse {
  @override
  final String service;
  @override
  final String status;
  @override
  final DateTime timestampUtc;
  @override
  final String requestId;

  factory _$HealthResponse([void Function(HealthResponseBuilder)? updates]) =>
      (HealthResponseBuilder()..update(updates))._build();

  _$HealthResponse._(
      {required this.service,
      required this.status,
      required this.timestampUtc,
      required this.requestId})
      : super._();
  @override
  HealthResponse rebuild(void Function(HealthResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  HealthResponseBuilder toBuilder() => HealthResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is HealthResponse &&
        service == other.service &&
        status == other.status &&
        timestampUtc == other.timestampUtc &&
        requestId == other.requestId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, service.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, timestampUtc.hashCode);
    _$hash = $jc(_$hash, requestId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'HealthResponse')
          ..add('service', service)
          ..add('status', status)
          ..add('timestampUtc', timestampUtc)
          ..add('requestId', requestId))
        .toString();
  }
}

class HealthResponseBuilder
    implements Builder<HealthResponse, HealthResponseBuilder> {
  _$HealthResponse? _$v;

  String? _service;
  String? get service => _$this._service;
  set service(String? service) => _$this._service = service;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  DateTime? _timestampUtc;
  DateTime? get timestampUtc => _$this._timestampUtc;
  set timestampUtc(DateTime? timestampUtc) =>
      _$this._timestampUtc = timestampUtc;

  String? _requestId;
  String? get requestId => _$this._requestId;
  set requestId(String? requestId) => _$this._requestId = requestId;

  HealthResponseBuilder() {
    HealthResponse._defaults(this);
  }

  HealthResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _service = $v.service;
      _status = $v.status;
      _timestampUtc = $v.timestampUtc;
      _requestId = $v.requestId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(HealthResponse other) {
    _$v = other as _$HealthResponse;
  }

  @override
  void update(void Function(HealthResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  HealthResponse build() => _build();

  _$HealthResponse _build() {
    final _$result = _$v ??
        _$HealthResponse._(
          service: BuiltValueNullFieldError.checkNotNull(
              service, r'HealthResponse', 'service'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'HealthResponse', 'status'),
          timestampUtc: BuiltValueNullFieldError.checkNotNull(
              timestampUtc, r'HealthResponse', 'timestampUtc'),
          requestId: BuiltValueNullFieldError.checkNotNull(
              requestId, r'HealthResponse', 'requestId'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
