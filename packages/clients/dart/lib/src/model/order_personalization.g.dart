// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_personalization.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderPersonalization extends OrderPersonalization {
  @override
  final String designId;
  @override
  final String kind;
  @override
  final String name;
  @override
  final String mime;
  @override
  final String? imageUrl;
  @override
  final int? schemaVersion;
  @override
  final DesignPlacement? placement;
  @override
  final String? configurationId;
  @override
  final int? configurationRevision;
  @override
  final String? sourceSha256;
  @override
  final String? sku;
  @override
  final PrintSetupSnapshot? printSetup;

  factory _$OrderPersonalization(
          [void Function(OrderPersonalizationBuilder)? updates]) =>
      (OrderPersonalizationBuilder()..update(updates))._build();

  _$OrderPersonalization._(
      {required this.designId,
      required this.kind,
      required this.name,
      required this.mime,
      this.imageUrl,
      this.schemaVersion,
      this.placement,
      this.configurationId,
      this.configurationRevision,
      this.sourceSha256,
      this.sku,
      this.printSetup})
      : super._();
  @override
  OrderPersonalization rebuild(
          void Function(OrderPersonalizationBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderPersonalizationBuilder toBuilder() =>
      OrderPersonalizationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderPersonalization &&
        designId == other.designId &&
        kind == other.kind &&
        name == other.name &&
        mime == other.mime &&
        imageUrl == other.imageUrl &&
        schemaVersion == other.schemaVersion &&
        placement == other.placement &&
        configurationId == other.configurationId &&
        configurationRevision == other.configurationRevision &&
        sourceSha256 == other.sourceSha256 &&
        sku == other.sku &&
        printSetup == other.printSetup;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, designId.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, mime.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jc(_$hash, schemaVersion.hashCode);
    _$hash = $jc(_$hash, placement.hashCode);
    _$hash = $jc(_$hash, configurationId.hashCode);
    _$hash = $jc(_$hash, configurationRevision.hashCode);
    _$hash = $jc(_$hash, sourceSha256.hashCode);
    _$hash = $jc(_$hash, sku.hashCode);
    _$hash = $jc(_$hash, printSetup.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderPersonalization')
          ..add('designId', designId)
          ..add('kind', kind)
          ..add('name', name)
          ..add('mime', mime)
          ..add('imageUrl', imageUrl)
          ..add('schemaVersion', schemaVersion)
          ..add('placement', placement)
          ..add('configurationId', configurationId)
          ..add('configurationRevision', configurationRevision)
          ..add('sourceSha256', sourceSha256)
          ..add('sku', sku)
          ..add('printSetup', printSetup))
        .toString();
  }
}

class OrderPersonalizationBuilder
    implements Builder<OrderPersonalization, OrderPersonalizationBuilder> {
  _$OrderPersonalization? _$v;

  String? _designId;
  String? get designId => _$this._designId;
  set designId(String? designId) => _$this._designId = designId;

  String? _kind;
  String? get kind => _$this._kind;
  set kind(String? kind) => _$this._kind = kind;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _mime;
  String? get mime => _$this._mime;
  set mime(String? mime) => _$this._mime = mime;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  int? _schemaVersion;
  int? get schemaVersion => _$this._schemaVersion;
  set schemaVersion(int? schemaVersion) =>
      _$this._schemaVersion = schemaVersion;

  DesignPlacementBuilder? _placement;
  DesignPlacementBuilder get placement =>
      _$this._placement ??= DesignPlacementBuilder();
  set placement(DesignPlacementBuilder? placement) =>
      _$this._placement = placement;

  String? _configurationId;
  String? get configurationId => _$this._configurationId;
  set configurationId(String? configurationId) =>
      _$this._configurationId = configurationId;

  int? _configurationRevision;
  int? get configurationRevision => _$this._configurationRevision;
  set configurationRevision(int? configurationRevision) =>
      _$this._configurationRevision = configurationRevision;

  String? _sourceSha256;
  String? get sourceSha256 => _$this._sourceSha256;
  set sourceSha256(String? sourceSha256) => _$this._sourceSha256 = sourceSha256;

  String? _sku;
  String? get sku => _$this._sku;
  set sku(String? sku) => _$this._sku = sku;

  PrintSetupSnapshotBuilder? _printSetup;
  PrintSetupSnapshotBuilder get printSetup =>
      _$this._printSetup ??= PrintSetupSnapshotBuilder();
  set printSetup(PrintSetupSnapshotBuilder? printSetup) =>
      _$this._printSetup = printSetup;

  OrderPersonalizationBuilder() {
    OrderPersonalization._defaults(this);
  }

  OrderPersonalizationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _designId = $v.designId;
      _kind = $v.kind;
      _name = $v.name;
      _mime = $v.mime;
      _imageUrl = $v.imageUrl;
      _schemaVersion = $v.schemaVersion;
      _placement = $v.placement?.toBuilder();
      _configurationId = $v.configurationId;
      _configurationRevision = $v.configurationRevision;
      _sourceSha256 = $v.sourceSha256;
      _sku = $v.sku;
      _printSetup = $v.printSetup?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderPersonalization other) {
    _$v = other as _$OrderPersonalization;
  }

  @override
  void update(void Function(OrderPersonalizationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderPersonalization build() => _build();

  _$OrderPersonalization _build() {
    _$OrderPersonalization _$result;
    try {
      _$result = _$v ??
          _$OrderPersonalization._(
            designId: BuiltValueNullFieldError.checkNotNull(
                designId, r'OrderPersonalization', 'designId'),
            kind: BuiltValueNullFieldError.checkNotNull(
                kind, r'OrderPersonalization', 'kind'),
            name: BuiltValueNullFieldError.checkNotNull(
                name, r'OrderPersonalization', 'name'),
            mime: BuiltValueNullFieldError.checkNotNull(
                mime, r'OrderPersonalization', 'mime'),
            imageUrl: imageUrl,
            schemaVersion: schemaVersion,
            placement: _placement?.build(),
            configurationId: configurationId,
            configurationRevision: configurationRevision,
            sourceSha256: sourceSha256,
            sku: sku,
            printSetup: _printSetup?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'placement';
        _placement?.build();

        _$failedField = 'printSetup';
        _printSetup?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'OrderPersonalization', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
