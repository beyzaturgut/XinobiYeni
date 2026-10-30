// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'print_profile_snapshot.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PrintProfileSnapshot extends PrintProfileSnapshot {
  @override
  final String id;
  @override
  final int revision;
  @override
  final String sku;
  @override
  final PrintProfileDefinition definition;
  @override
  final String sha256;

  factory _$PrintProfileSnapshot(
          [void Function(PrintProfileSnapshotBuilder)? updates]) =>
      (PrintProfileSnapshotBuilder()..update(updates))._build();

  _$PrintProfileSnapshot._(
      {required this.id,
      required this.revision,
      required this.sku,
      required this.definition,
      required this.sha256})
      : super._();
  @override
  PrintProfileSnapshot rebuild(
          void Function(PrintProfileSnapshotBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PrintProfileSnapshotBuilder toBuilder() =>
      PrintProfileSnapshotBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PrintProfileSnapshot &&
        id == other.id &&
        revision == other.revision &&
        sku == other.sku &&
        definition == other.definition &&
        sha256 == other.sha256;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, revision.hashCode);
    _$hash = $jc(_$hash, sku.hashCode);
    _$hash = $jc(_$hash, definition.hashCode);
    _$hash = $jc(_$hash, sha256.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PrintProfileSnapshot')
          ..add('id', id)
          ..add('revision', revision)
          ..add('sku', sku)
          ..add('definition', definition)
          ..add('sha256', sha256))
        .toString();
  }
}

class PrintProfileSnapshotBuilder
    implements Builder<PrintProfileSnapshot, PrintProfileSnapshotBuilder> {
  _$PrintProfileSnapshot? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  int? _revision;
  int? get revision => _$this._revision;
  set revision(int? revision) => _$this._revision = revision;

  String? _sku;
  String? get sku => _$this._sku;
  set sku(String? sku) => _$this._sku = sku;

  PrintProfileDefinitionBuilder? _definition;
  PrintProfileDefinitionBuilder get definition =>
      _$this._definition ??= PrintProfileDefinitionBuilder();
  set definition(PrintProfileDefinitionBuilder? definition) =>
      _$this._definition = definition;

  String? _sha256;
  String? get sha256 => _$this._sha256;
  set sha256(String? sha256) => _$this._sha256 = sha256;

  PrintProfileSnapshotBuilder() {
    PrintProfileSnapshot._defaults(this);
  }

  PrintProfileSnapshotBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _revision = $v.revision;
      _sku = $v.sku;
      _definition = $v.definition.toBuilder();
      _sha256 = $v.sha256;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PrintProfileSnapshot other) {
    _$v = other as _$PrintProfileSnapshot;
  }

  @override
  void update(void Function(PrintProfileSnapshotBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PrintProfileSnapshot build() => _build();

  _$PrintProfileSnapshot _build() {
    _$PrintProfileSnapshot _$result;
    try {
      _$result = _$v ??
          _$PrintProfileSnapshot._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'PrintProfileSnapshot', 'id'),
            revision: BuiltValueNullFieldError.checkNotNull(
                revision, r'PrintProfileSnapshot', 'revision'),
            sku: BuiltValueNullFieldError.checkNotNull(
                sku, r'PrintProfileSnapshot', 'sku'),
            definition: definition.build(),
            sha256: BuiltValueNullFieldError.checkNotNull(
                sha256, r'PrintProfileSnapshot', 'sha256'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'definition';
        definition.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'PrintProfileSnapshot', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
