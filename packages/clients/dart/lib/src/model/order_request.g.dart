// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_request.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderRequest extends OrderRequest {
  @override
  final String id;
  @override
  final String type;
  @override
  final String status;
  @override
  final String reason;
  @override
  final String? description;
  @override
  final BuiltList<OrderRequestLine> lines;
  @override
  final DateTime createdAt;
  @override
  final DateTime? decidedAt;
  @override
  final String? resolution;

  factory _$OrderRequest([void Function(OrderRequestBuilder)? updates]) =>
      (OrderRequestBuilder()..update(updates))._build();

  _$OrderRequest._(
      {required this.id,
      required this.type,
      required this.status,
      required this.reason,
      this.description,
      required this.lines,
      required this.createdAt,
      this.decidedAt,
      this.resolution})
      : super._();
  @override
  OrderRequest rebuild(void Function(OrderRequestBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderRequestBuilder toBuilder() => OrderRequestBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderRequest &&
        id == other.id &&
        type == other.type &&
        status == other.status &&
        reason == other.reason &&
        description == other.description &&
        lines == other.lines &&
        createdAt == other.createdAt &&
        decidedAt == other.decidedAt &&
        resolution == other.resolution;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, lines.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, decidedAt.hashCode);
    _$hash = $jc(_$hash, resolution.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderRequest')
          ..add('id', id)
          ..add('type', type)
          ..add('status', status)
          ..add('reason', reason)
          ..add('description', description)
          ..add('lines', lines)
          ..add('createdAt', createdAt)
          ..add('decidedAt', decidedAt)
          ..add('resolution', resolution))
        .toString();
  }
}

class OrderRequestBuilder
    implements Builder<OrderRequest, OrderRequestBuilder> {
  _$OrderRequest? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _type;
  String? get type => _$this._type;
  set type(String? type) => _$this._type = type;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  ListBuilder<OrderRequestLine>? _lines;
  ListBuilder<OrderRequestLine> get lines =>
      _$this._lines ??= ListBuilder<OrderRequestLine>();
  set lines(ListBuilder<OrderRequestLine>? lines) => _$this._lines = lines;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _decidedAt;
  DateTime? get decidedAt => _$this._decidedAt;
  set decidedAt(DateTime? decidedAt) => _$this._decidedAt = decidedAt;

  String? _resolution;
  String? get resolution => _$this._resolution;
  set resolution(String? resolution) => _$this._resolution = resolution;

  OrderRequestBuilder() {
    OrderRequest._defaults(this);
  }

  OrderRequestBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _type = $v.type;
      _status = $v.status;
      _reason = $v.reason;
      _description = $v.description;
      _lines = $v.lines.toBuilder();
      _createdAt = $v.createdAt;
      _decidedAt = $v.decidedAt;
      _resolution = $v.resolution;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderRequest other) {
    _$v = other as _$OrderRequest;
  }

  @override
  void update(void Function(OrderRequestBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderRequest build() => _build();

  _$OrderRequest _build() {
    _$OrderRequest _$result;
    try {
      _$result = _$v ??
          _$OrderRequest._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'OrderRequest', 'id'),
            type: BuiltValueNullFieldError.checkNotNull(
                type, r'OrderRequest', 'type'),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'OrderRequest', 'status'),
            reason: BuiltValueNullFieldError.checkNotNull(
                reason, r'OrderRequest', 'reason'),
            description: description,
            lines: lines.build(),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'OrderRequest', 'createdAt'),
            decidedAt: decidedAt,
            resolution: resolution,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'lines';
        lines.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'OrderRequest', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
