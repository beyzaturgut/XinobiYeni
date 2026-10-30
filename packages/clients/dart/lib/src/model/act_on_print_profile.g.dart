// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'act_on_print_profile.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ActOnPrintProfile extends ActOnPrintProfile {
  @override
  final int expectedRevision;
  @override
  final String evidenceReference;
  @override
  final String note;

  factory _$ActOnPrintProfile(
          [void Function(ActOnPrintProfileBuilder)? updates]) =>
      (ActOnPrintProfileBuilder()..update(updates))._build();

  _$ActOnPrintProfile._(
      {required this.expectedRevision,
      required this.evidenceReference,
      required this.note})
      : super._();
  @override
  ActOnPrintProfile rebuild(void Function(ActOnPrintProfileBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ActOnPrintProfileBuilder toBuilder() =>
      ActOnPrintProfileBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ActOnPrintProfile &&
        expectedRevision == other.expectedRevision &&
        evidenceReference == other.evidenceReference &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedRevision.hashCode);
    _$hash = $jc(_$hash, evidenceReference.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ActOnPrintProfile')
          ..add('expectedRevision', expectedRevision)
          ..add('evidenceReference', evidenceReference)
          ..add('note', note))
        .toString();
  }
}

class ActOnPrintProfileBuilder
    implements Builder<ActOnPrintProfile, ActOnPrintProfileBuilder> {
  _$ActOnPrintProfile? _$v;

  int? _expectedRevision;
  int? get expectedRevision => _$this._expectedRevision;
  set expectedRevision(int? expectedRevision) =>
      _$this._expectedRevision = expectedRevision;

  String? _evidenceReference;
  String? get evidenceReference => _$this._evidenceReference;
  set evidenceReference(String? evidenceReference) =>
      _$this._evidenceReference = evidenceReference;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  ActOnPrintProfileBuilder() {
    ActOnPrintProfile._defaults(this);
  }

  ActOnPrintProfileBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedRevision = $v.expectedRevision;
      _evidenceReference = $v.evidenceReference;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ActOnPrintProfile other) {
    _$v = other as _$ActOnPrintProfile;
  }

  @override
  void update(void Function(ActOnPrintProfileBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ActOnPrintProfile build() => _build();

  _$ActOnPrintProfile _build() {
    final _$result = _$v ??
        _$ActOnPrintProfile._(
          expectedRevision: BuiltValueNullFieldError.checkNotNull(
              expectedRevision, r'ActOnPrintProfile', 'expectedRevision'),
          evidenceReference: BuiltValueNullFieldError.checkNotNull(
              evidenceReference, r'ActOnPrintProfile', 'evidenceReference'),
          note: BuiltValueNullFieldError.checkNotNull(
              note, r'ActOnPrintProfile', 'note'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
