// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'my_design_configuration.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MyDesignConfiguration extends MyDesignConfiguration {
  @override
  final String id;
  @override
  final String designId;
  @override
  final String productId;
  @override
  final String variantId;
  @override
  final int revision;
  @override
  final int schemaVersion;
  @override
  final DesignPlacement placement;
  @override
  final bool favorite;
  @override
  final String sourceSha256;
  @override
  final DateTime createdAt;
  @override
  final PrintSetupSnapshot? printSetup;

  factory _$MyDesignConfiguration(
          [void Function(MyDesignConfigurationBuilder)? updates]) =>
      (MyDesignConfigurationBuilder()..update(updates))._build();

  _$MyDesignConfiguration._(
      {required this.id,
      required this.designId,
      required this.productId,
      required this.variantId,
      required this.revision,
      required this.schemaVersion,
      required this.placement,
      required this.favorite,
      required this.sourceSha256,
      required this.createdAt,
      this.printSetup})
      : super._();
  @override
  MyDesignConfiguration rebuild(
          void Function(MyDesignConfigurationBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MyDesignConfigurationBuilder toBuilder() =>
      MyDesignConfigurationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MyDesignConfiguration &&
        id == other.id &&
        designId == other.designId &&
        productId == other.productId &&
        variantId == other.variantId &&
        revision == other.revision &&
        schemaVersion == other.schemaVersion &&
        placement == other.placement &&
        favorite == other.favorite &&
        sourceSha256 == other.sourceSha256 &&
        createdAt == other.createdAt &&
        printSetup == other.printSetup;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, designId.hashCode);
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, revision.hashCode);
    _$hash = $jc(_$hash, schemaVersion.hashCode);
    _$hash = $jc(_$hash, placement.hashCode);
    _$hash = $jc(_$hash, favorite.hashCode);
    _$hash = $jc(_$hash, sourceSha256.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, printSetup.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MyDesignConfiguration')
          ..add('id', id)
          ..add('designId', designId)
          ..add('productId', productId)
          ..add('variantId', variantId)
          ..add('revision', revision)
          ..add('schemaVersion', schemaVersion)
          ..add('placement', placement)
          ..add('favorite', favorite)
          ..add('sourceSha256', sourceSha256)
          ..add('createdAt', createdAt)
          ..add('printSetup', printSetup))
        .toString();
  }
}

class MyDesignConfigurationBuilder
    implements Builder<MyDesignConfiguration, MyDesignConfigurationBuilder> {
  _$MyDesignConfiguration? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _designId;
  String? get designId => _$this._designId;
  set designId(String? designId) => _$this._designId = designId;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  String? _variantId;
  String? get variantId => _$this._variantId;
  set variantId(String? variantId) => _$this._variantId = variantId;

  int? _revision;
  int? get revision => _$this._revision;
  set revision(int? revision) => _$this._revision = revision;

  int? _schemaVersion;
  int? get schemaVersion => _$this._schemaVersion;
  set schemaVersion(int? schemaVersion) =>
      _$this._schemaVersion = schemaVersion;

  DesignPlacementBuilder? _placement;
  DesignPlacementBuilder get placement =>
      _$this._placement ??= DesignPlacementBuilder();
  set placement(DesignPlacementBuilder? placement) =>
      _$this._placement = placement;

  bool? _favorite;
  bool? get favorite => _$this._favorite;
  set favorite(bool? favorite) => _$this._favorite = favorite;

  String? _sourceSha256;
  String? get sourceSha256 => _$this._sourceSha256;
  set sourceSha256(String? sourceSha256) => _$this._sourceSha256 = sourceSha256;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  PrintSetupSnapshotBuilder? _printSetup;
  PrintSetupSnapshotBuilder get printSetup =>
      _$this._printSetup ??= PrintSetupSnapshotBuilder();
  set printSetup(PrintSetupSnapshotBuilder? printSetup) =>
      _$this._printSetup = printSetup;

  MyDesignConfigurationBuilder() {
    MyDesignConfiguration._defaults(this);
  }

  MyDesignConfigurationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _designId = $v.designId;
      _productId = $v.productId;
      _variantId = $v.variantId;
      _revision = $v.revision;
      _schemaVersion = $v.schemaVersion;
      _placement = $v.placement.toBuilder();
      _favorite = $v.favorite;
      _sourceSha256 = $v.sourceSha256;
      _createdAt = $v.createdAt;
      _printSetup = $v.printSetup?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MyDesignConfiguration other) {
    _$v = other as _$MyDesignConfiguration;
  }

  @override
  void update(void Function(MyDesignConfigurationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MyDesignConfiguration build() => _build();

  _$MyDesignConfiguration _build() {
    _$MyDesignConfiguration _$result;
    try {
      _$result = _$v ??
          _$MyDesignConfiguration._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'MyDesignConfiguration', 'id'),
            designId: BuiltValueNullFieldError.checkNotNull(
                designId, r'MyDesignConfiguration', 'designId'),
            productId: BuiltValueNullFieldError.checkNotNull(
                productId, r'MyDesignConfiguration', 'productId'),
            variantId: BuiltValueNullFieldError.checkNotNull(
                variantId, r'MyDesignConfiguration', 'variantId'),
            revision: BuiltValueNullFieldError.checkNotNull(
                revision, r'MyDesignConfiguration', 'revision'),
            schemaVersion: BuiltValueNullFieldError.checkNotNull(
                schemaVersion, r'MyDesignConfiguration', 'schemaVersion'),
            placement: placement.build(),
            favorite: BuiltValueNullFieldError.checkNotNull(
                favorite, r'MyDesignConfiguration', 'favorite'),
            sourceSha256: BuiltValueNullFieldError.checkNotNull(
                sourceSha256, r'MyDesignConfiguration', 'sourceSha256'),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'MyDesignConfiguration', 'createdAt'),
            printSetup: _printSetup?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'placement';
        placement.build();

        _$failedField = 'printSetup';
        _printSetup?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'MyDesignConfiguration', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
