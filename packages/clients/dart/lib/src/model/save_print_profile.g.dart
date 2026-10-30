// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'save_print_profile.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SavePrintProfile extends SavePrintProfile {
  @override
  final String? id;
  @override
  final int? expectedRevision;
  @override
  final PrintProfileDefinition definition;

  factory _$SavePrintProfile(
          [void Function(SavePrintProfileBuilder)? updates]) =>
      (SavePrintProfileBuilder()..update(updates))._build();

  _$SavePrintProfile._(
      {this.id, this.expectedRevision, required this.definition})
      : super._();
  @override
  SavePrintProfile rebuild(void Function(SavePrintProfileBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SavePrintProfileBuilder toBuilder() =>
      SavePrintProfileBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SavePrintProfile &&
        id == other.id &&
        expectedRevision == other.expectedRevision &&
        definition == other.definition;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, expectedRevision.hashCode);
    _$hash = $jc(_$hash, definition.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SavePrintProfile')
          ..add('id', id)
          ..add('expectedRevision', expectedRevision)
          ..add('definition', definition))
        .toString();
  }
}

class SavePrintProfileBuilder
    implements Builder<SavePrintProfile, SavePrintProfileBuilder> {
  _$SavePrintProfile? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  int? _expectedRevision;
  int? get expectedRevision => _$this._expectedRevision;
  set expectedRevision(int? expectedRevision) =>
      _$this._expectedRevision = expectedRevision;

  PrintProfileDefinitionBuilder? _definition;
  PrintProfileDefinitionBuilder get definition =>
      _$this._definition ??= PrintProfileDefinitionBuilder();
  set definition(PrintProfileDefinitionBuilder? definition) =>
      _$this._definition = definition;

  SavePrintProfileBuilder() {
    SavePrintProfile._defaults(this);
  }

  SavePrintProfileBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _expectedRevision = $v.expectedRevision;
      _definition = $v.definition.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SavePrintProfile other) {
    _$v = other as _$SavePrintProfile;
  }

  @override
  void update(void Function(SavePrintProfileBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SavePrintProfile build() => _build();

  _$SavePrintProfile _build() {
    _$SavePrintProfile _$result;
    try {
      _$result = _$v ??
          _$SavePrintProfile._(
            id: id,
            expectedRevision: expectedRevision,
            definition: definition.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'definition';
        definition.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SavePrintProfile', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
