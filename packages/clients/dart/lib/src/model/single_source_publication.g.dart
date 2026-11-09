// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'single_source_publication.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SingleSourcePublication extends SingleSourcePublication {
  @override
  final int schemaVersion;
  @override
  final String scope;
  @override
  final String productReference;
  @override
  final String surfaceId;
  @override
  final int sourceRevision;
  @override
  final SingleSourceRenderingInputs inputs;

  factory _$SingleSourcePublication(
          [void Function(SingleSourcePublicationBuilder)? updates]) =>
      (SingleSourcePublicationBuilder()..update(updates))._build();

  _$SingleSourcePublication._(
      {required this.schemaVersion,
      required this.scope,
      required this.productReference,
      required this.surfaceId,
      required this.sourceRevision,
      required this.inputs})
      : super._();
  @override
  SingleSourcePublication rebuild(
          void Function(SingleSourcePublicationBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SingleSourcePublicationBuilder toBuilder() =>
      SingleSourcePublicationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SingleSourcePublication &&
        schemaVersion == other.schemaVersion &&
        scope == other.scope &&
        productReference == other.productReference &&
        surfaceId == other.surfaceId &&
        sourceRevision == other.sourceRevision &&
        inputs == other.inputs;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, schemaVersion.hashCode);
    _$hash = $jc(_$hash, scope.hashCode);
    _$hash = $jc(_$hash, productReference.hashCode);
    _$hash = $jc(_$hash, surfaceId.hashCode);
    _$hash = $jc(_$hash, sourceRevision.hashCode);
    _$hash = $jc(_$hash, inputs.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SingleSourcePublication')
          ..add('schemaVersion', schemaVersion)
          ..add('scope', scope)
          ..add('productReference', productReference)
          ..add('surfaceId', surfaceId)
          ..add('sourceRevision', sourceRevision)
          ..add('inputs', inputs))
        .toString();
  }
}

class SingleSourcePublicationBuilder
    implements
        Builder<SingleSourcePublication, SingleSourcePublicationBuilder> {
  _$SingleSourcePublication? _$v;

  int? _schemaVersion;
  int? get schemaVersion => _$this._schemaVersion;
  set schemaVersion(int? schemaVersion) =>
      _$this._schemaVersion = schemaVersion;

  String? _scope;
  String? get scope => _$this._scope;
  set scope(String? scope) => _$this._scope = scope;

  String? _productReference;
  String? get productReference => _$this._productReference;
  set productReference(String? productReference) =>
      _$this._productReference = productReference;

  String? _surfaceId;
  String? get surfaceId => _$this._surfaceId;
  set surfaceId(String? surfaceId) => _$this._surfaceId = surfaceId;

  int? _sourceRevision;
  int? get sourceRevision => _$this._sourceRevision;
  set sourceRevision(int? sourceRevision) =>
      _$this._sourceRevision = sourceRevision;

  SingleSourceRenderingInputsBuilder? _inputs;
  SingleSourceRenderingInputsBuilder get inputs =>
      _$this._inputs ??= SingleSourceRenderingInputsBuilder();
  set inputs(SingleSourceRenderingInputsBuilder? inputs) =>
      _$this._inputs = inputs;

  SingleSourcePublicationBuilder() {
    SingleSourcePublication._defaults(this);
  }

  SingleSourcePublicationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _schemaVersion = $v.schemaVersion;
      _scope = $v.scope;
      _productReference = $v.productReference;
      _surfaceId = $v.surfaceId;
      _sourceRevision = $v.sourceRevision;
      _inputs = $v.inputs.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SingleSourcePublication other) {
    _$v = other as _$SingleSourcePublication;
  }

  @override
  void update(void Function(SingleSourcePublicationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SingleSourcePublication build() => _build();

  _$SingleSourcePublication _build() {
    _$SingleSourcePublication _$result;
    try {
      _$result = _$v ??
          _$SingleSourcePublication._(
            schemaVersion: BuiltValueNullFieldError.checkNotNull(
                schemaVersion, r'SingleSourcePublication', 'schemaVersion'),
            scope: BuiltValueNullFieldError.checkNotNull(
                scope, r'SingleSourcePublication', 'scope'),
            productReference: BuiltValueNullFieldError.checkNotNull(
                productReference,
                r'SingleSourcePublication',
                'productReference'),
            surfaceId: BuiltValueNullFieldError.checkNotNull(
                surfaceId, r'SingleSourcePublication', 'surfaceId'),
            sourceRevision: BuiltValueNullFieldError.checkNotNull(
                sourceRevision, r'SingleSourcePublication', 'sourceRevision'),
            inputs: inputs.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'inputs';
        inputs.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SingleSourcePublication', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
