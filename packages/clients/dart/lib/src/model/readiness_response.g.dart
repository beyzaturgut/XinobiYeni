// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'readiness_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReadinessResponse extends ReadinessResponse {
  @override
  final String service;
  @override
  final String status;
  @override
  final DateTime timestampUtc;
  @override
  final String requestId;
  @override
  final BuiltList<DependencyHealth> checks;

  factory _$ReadinessResponse(
          [void Function(ReadinessResponseBuilder)? updates]) =>
      (ReadinessResponseBuilder()..update(updates))._build();

  _$ReadinessResponse._(
      {required this.service,
      required this.status,
      required this.timestampUtc,
      required this.requestId,
      required this.checks})
      : super._();
  @override
  ReadinessResponse rebuild(void Function(ReadinessResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ReadinessResponseBuilder toBuilder() =>
      ReadinessResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReadinessResponse &&
        service == other.service &&
        status == other.status &&
        timestampUtc == other.timestampUtc &&
        requestId == other.requestId &&
        checks == other.checks;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, service.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, timestampUtc.hashCode);
    _$hash = $jc(_$hash, requestId.hashCode);
    _$hash = $jc(_$hash, checks.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReadinessResponse')
          ..add('service', service)
          ..add('status', status)
          ..add('timestampUtc', timestampUtc)
          ..add('requestId', requestId)
          ..add('checks', checks))
        .toString();
  }
}

class ReadinessResponseBuilder
    implements Builder<ReadinessResponse, ReadinessResponseBuilder> {
  _$ReadinessResponse? _$v;

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

  ListBuilder<DependencyHealth>? _checks;
  ListBuilder<DependencyHealth> get checks =>
      _$this._checks ??= ListBuilder<DependencyHealth>();
  set checks(ListBuilder<DependencyHealth>? checks) => _$this._checks = checks;

  ReadinessResponseBuilder() {
    ReadinessResponse._defaults(this);
  }

  ReadinessResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _service = $v.service;
      _status = $v.status;
      _timestampUtc = $v.timestampUtc;
      _requestId = $v.requestId;
      _checks = $v.checks.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReadinessResponse other) {
    _$v = other as _$ReadinessResponse;
  }

  @override
  void update(void Function(ReadinessResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReadinessResponse build() => _build();

  _$ReadinessResponse _build() {
    _$ReadinessResponse _$result;
    try {
      _$result = _$v ??
          _$ReadinessResponse._(
            service: BuiltValueNullFieldError.checkNotNull(
                service, r'ReadinessResponse', 'service'),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'ReadinessResponse', 'status'),
            timestampUtc: BuiltValueNullFieldError.checkNotNull(
                timestampUtc, r'ReadinessResponse', 'timestampUtc'),
            requestId: BuiltValueNullFieldError.checkNotNull(
                requestId, r'ReadinessResponse', 'requestId'),
            checks: checks.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'checks';
        checks.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ReadinessResponse', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
