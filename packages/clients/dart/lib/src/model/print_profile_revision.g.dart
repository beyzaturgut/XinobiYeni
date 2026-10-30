// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'print_profile_revision.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PrintProfileRevision extends PrintProfileRevision {
  @override
  final String id;
  @override
  final int revision;
  @override
  final String status;
  @override
  final String sku;
  @override
  final PrintProfileDefinition definition;
  @override
  final String actorId;
  @override
  final DateTime createdAt;
  @override
  final String? evidenceReference;
  @override
  final String? decisionNote;

  factory _$PrintProfileRevision(
          [void Function(PrintProfileRevisionBuilder)? updates]) =>
      (PrintProfileRevisionBuilder()..update(updates))._build();

  _$PrintProfileRevision._(
      {required this.id,
      required this.revision,
      required this.status,
      required this.sku,
      required this.definition,
      required this.actorId,
      required this.createdAt,
      this.evidenceReference,
      this.decisionNote})
      : super._();
  @override
  PrintProfileRevision rebuild(
          void Function(PrintProfileRevisionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PrintProfileRevisionBuilder toBuilder() =>
      PrintProfileRevisionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PrintProfileRevision &&
        id == other.id &&
        revision == other.revision &&
        status == other.status &&
        sku == other.sku &&
        definition == other.definition &&
        actorId == other.actorId &&
        createdAt == other.createdAt &&
        evidenceReference == other.evidenceReference &&
        decisionNote == other.decisionNote;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, revision.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, sku.hashCode);
    _$hash = $jc(_$hash, definition.hashCode);
    _$hash = $jc(_$hash, actorId.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, evidenceReference.hashCode);
    _$hash = $jc(_$hash, decisionNote.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PrintProfileRevision')
          ..add('id', id)
          ..add('revision', revision)
          ..add('status', status)
          ..add('sku', sku)
          ..add('definition', definition)
          ..add('actorId', actorId)
          ..add('createdAt', createdAt)
          ..add('evidenceReference', evidenceReference)
          ..add('decisionNote', decisionNote))
        .toString();
  }
}

class PrintProfileRevisionBuilder
    implements Builder<PrintProfileRevision, PrintProfileRevisionBuilder> {
  _$PrintProfileRevision? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  int? _revision;
  int? get revision => _$this._revision;
  set revision(int? revision) => _$this._revision = revision;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  String? _sku;
  String? get sku => _$this._sku;
  set sku(String? sku) => _$this._sku = sku;

  PrintProfileDefinitionBuilder? _definition;
  PrintProfileDefinitionBuilder get definition =>
      _$this._definition ??= PrintProfileDefinitionBuilder();
  set definition(PrintProfileDefinitionBuilder? definition) =>
      _$this._definition = definition;

  String? _actorId;
  String? get actorId => _$this._actorId;
  set actorId(String? actorId) => _$this._actorId = actorId;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  String? _evidenceReference;
  String? get evidenceReference => _$this._evidenceReference;
  set evidenceReference(String? evidenceReference) =>
      _$this._evidenceReference = evidenceReference;

  String? _decisionNote;
  String? get decisionNote => _$this._decisionNote;
  set decisionNote(String? decisionNote) => _$this._decisionNote = decisionNote;

  PrintProfileRevisionBuilder() {
    PrintProfileRevision._defaults(this);
  }

  PrintProfileRevisionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _revision = $v.revision;
      _status = $v.status;
      _sku = $v.sku;
      _definition = $v.definition.toBuilder();
      _actorId = $v.actorId;
      _createdAt = $v.createdAt;
      _evidenceReference = $v.evidenceReference;
      _decisionNote = $v.decisionNote;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PrintProfileRevision other) {
    _$v = other as _$PrintProfileRevision;
  }

  @override
  void update(void Function(PrintProfileRevisionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PrintProfileRevision build() => _build();

  _$PrintProfileRevision _build() {
    _$PrintProfileRevision _$result;
    try {
      _$result = _$v ??
          _$PrintProfileRevision._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'PrintProfileRevision', 'id'),
            revision: BuiltValueNullFieldError.checkNotNull(
                revision, r'PrintProfileRevision', 'revision'),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'PrintProfileRevision', 'status'),
            sku: BuiltValueNullFieldError.checkNotNull(
                sku, r'PrintProfileRevision', 'sku'),
            definition: definition.build(),
            actorId: BuiltValueNullFieldError.checkNotNull(
                actorId, r'PrintProfileRevision', 'actorId'),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'PrintProfileRevision', 'createdAt'),
            evidenceReference: evidenceReference,
            decisionNote: decisionNote,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'definition';
        definition.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'PrintProfileRevision', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
