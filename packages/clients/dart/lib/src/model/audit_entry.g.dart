// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'audit_entry.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AuditEntry extends AuditEntry {
  @override
  final int id;
  @override
  final String? actorUserId;
  @override
  final String action;
  @override
  final String entityType;
  @override
  final String entityId;
  @override
  final String? safeDiff;
  @override
  final String? traceId;
  @override
  final DateTime occurredAt;

  factory _$AuditEntry([void Function(AuditEntryBuilder)? updates]) =>
      (AuditEntryBuilder()..update(updates))._build();

  _$AuditEntry._(
      {required this.id,
      this.actorUserId,
      required this.action,
      required this.entityType,
      required this.entityId,
      this.safeDiff,
      this.traceId,
      required this.occurredAt})
      : super._();
  @override
  AuditEntry rebuild(void Function(AuditEntryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AuditEntryBuilder toBuilder() => AuditEntryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AuditEntry &&
        id == other.id &&
        actorUserId == other.actorUserId &&
        action == other.action &&
        entityType == other.entityType &&
        entityId == other.entityId &&
        safeDiff == other.safeDiff &&
        traceId == other.traceId &&
        occurredAt == other.occurredAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, actorUserId.hashCode);
    _$hash = $jc(_$hash, action.hashCode);
    _$hash = $jc(_$hash, entityType.hashCode);
    _$hash = $jc(_$hash, entityId.hashCode);
    _$hash = $jc(_$hash, safeDiff.hashCode);
    _$hash = $jc(_$hash, traceId.hashCode);
    _$hash = $jc(_$hash, occurredAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AuditEntry')
          ..add('id', id)
          ..add('actorUserId', actorUserId)
          ..add('action', action)
          ..add('entityType', entityType)
          ..add('entityId', entityId)
          ..add('safeDiff', safeDiff)
          ..add('traceId', traceId)
          ..add('occurredAt', occurredAt))
        .toString();
  }
}

class AuditEntryBuilder implements Builder<AuditEntry, AuditEntryBuilder> {
  _$AuditEntry? _$v;

  int? _id;
  int? get id => _$this._id;
  set id(int? id) => _$this._id = id;

  String? _actorUserId;
  String? get actorUserId => _$this._actorUserId;
  set actorUserId(String? actorUserId) => _$this._actorUserId = actorUserId;

  String? _action;
  String? get action => _$this._action;
  set action(String? action) => _$this._action = action;

  String? _entityType;
  String? get entityType => _$this._entityType;
  set entityType(String? entityType) => _$this._entityType = entityType;

  String? _entityId;
  String? get entityId => _$this._entityId;
  set entityId(String? entityId) => _$this._entityId = entityId;

  String? _safeDiff;
  String? get safeDiff => _$this._safeDiff;
  set safeDiff(String? safeDiff) => _$this._safeDiff = safeDiff;

  String? _traceId;
  String? get traceId => _$this._traceId;
  set traceId(String? traceId) => _$this._traceId = traceId;

  DateTime? _occurredAt;
  DateTime? get occurredAt => _$this._occurredAt;
  set occurredAt(DateTime? occurredAt) => _$this._occurredAt = occurredAt;

  AuditEntryBuilder() {
    AuditEntry._defaults(this);
  }

  AuditEntryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _actorUserId = $v.actorUserId;
      _action = $v.action;
      _entityType = $v.entityType;
      _entityId = $v.entityId;
      _safeDiff = $v.safeDiff;
      _traceId = $v.traceId;
      _occurredAt = $v.occurredAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AuditEntry other) {
    _$v = other as _$AuditEntry;
  }

  @override
  void update(void Function(AuditEntryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AuditEntry build() => _build();

  _$AuditEntry _build() {
    final _$result = _$v ??
        _$AuditEntry._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'AuditEntry', 'id'),
          actorUserId: actorUserId,
          action: BuiltValueNullFieldError.checkNotNull(
              action, r'AuditEntry', 'action'),
          entityType: BuiltValueNullFieldError.checkNotNull(
              entityType, r'AuditEntry', 'entityType'),
          entityId: BuiltValueNullFieldError.checkNotNull(
              entityId, r'AuditEntry', 'entityId'),
          safeDiff: safeDiff,
          traceId: traceId,
          occurredAt: BuiltValueNullFieldError.checkNotNull(
              occurredAt, r'AuditEntry', 'occurredAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
