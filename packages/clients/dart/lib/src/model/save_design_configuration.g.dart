// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'save_design_configuration.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SaveDesignConfiguration extends SaveDesignConfiguration {
  @override
  final String variantId;
  @override
  final DesignPlacement placement;
  @override
  final String? configurationId;
  @override
  final int? expectedRevision;
  @override
  final bool? favorite;
  @override
  final SingleSourceBinding? surfaceBinding;

  factory _$SaveDesignConfiguration(
          [void Function(SaveDesignConfigurationBuilder)? updates]) =>
      (SaveDesignConfigurationBuilder()..update(updates))._build();

  _$SaveDesignConfiguration._(
      {required this.variantId,
      required this.placement,
      this.configurationId,
      this.expectedRevision,
      this.favorite,
      this.surfaceBinding})
      : super._();
  @override
  SaveDesignConfiguration rebuild(
          void Function(SaveDesignConfigurationBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SaveDesignConfigurationBuilder toBuilder() =>
      SaveDesignConfigurationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SaveDesignConfiguration &&
        variantId == other.variantId &&
        placement == other.placement &&
        configurationId == other.configurationId &&
        expectedRevision == other.expectedRevision &&
        favorite == other.favorite &&
        surfaceBinding == other.surfaceBinding;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, placement.hashCode);
    _$hash = $jc(_$hash, configurationId.hashCode);
    _$hash = $jc(_$hash, expectedRevision.hashCode);
    _$hash = $jc(_$hash, favorite.hashCode);
    _$hash = $jc(_$hash, surfaceBinding.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SaveDesignConfiguration')
          ..add('variantId', variantId)
          ..add('placement', placement)
          ..add('configurationId', configurationId)
          ..add('expectedRevision', expectedRevision)
          ..add('favorite', favorite)
          ..add('surfaceBinding', surfaceBinding))
        .toString();
  }
}

class SaveDesignConfigurationBuilder
    implements
        Builder<SaveDesignConfiguration, SaveDesignConfigurationBuilder> {
  _$SaveDesignConfiguration? _$v;

  String? _variantId;
  String? get variantId => _$this._variantId;
  set variantId(String? variantId) => _$this._variantId = variantId;

  DesignPlacementBuilder? _placement;
  DesignPlacementBuilder get placement =>
      _$this._placement ??= DesignPlacementBuilder();
  set placement(DesignPlacementBuilder? placement) =>
      _$this._placement = placement;

  String? _configurationId;
  String? get configurationId => _$this._configurationId;
  set configurationId(String? configurationId) =>
      _$this._configurationId = configurationId;

  int? _expectedRevision;
  int? get expectedRevision => _$this._expectedRevision;
  set expectedRevision(int? expectedRevision) =>
      _$this._expectedRevision = expectedRevision;

  bool? _favorite;
  bool? get favorite => _$this._favorite;
  set favorite(bool? favorite) => _$this._favorite = favorite;

  SingleSourceBindingBuilder? _surfaceBinding;
  SingleSourceBindingBuilder get surfaceBinding =>
      _$this._surfaceBinding ??= SingleSourceBindingBuilder();
  set surfaceBinding(SingleSourceBindingBuilder? surfaceBinding) =>
      _$this._surfaceBinding = surfaceBinding;

  SaveDesignConfigurationBuilder() {
    SaveDesignConfiguration._defaults(this);
  }

  SaveDesignConfigurationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _variantId = $v.variantId;
      _placement = $v.placement.toBuilder();
      _configurationId = $v.configurationId;
      _expectedRevision = $v.expectedRevision;
      _favorite = $v.favorite;
      _surfaceBinding = $v.surfaceBinding?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SaveDesignConfiguration other) {
    _$v = other as _$SaveDesignConfiguration;
  }

  @override
  void update(void Function(SaveDesignConfigurationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SaveDesignConfiguration build() => _build();

  _$SaveDesignConfiguration _build() {
    _$SaveDesignConfiguration _$result;
    try {
      _$result = _$v ??
          _$SaveDesignConfiguration._(
            variantId: BuiltValueNullFieldError.checkNotNull(
                variantId, r'SaveDesignConfiguration', 'variantId'),
            placement: placement.build(),
            configurationId: configurationId,
            expectedRevision: expectedRevision,
            favorite: favorite,
            surfaceBinding: _surfaceBinding?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'placement';
        placement.build();

        _$failedField = 'surfaceBinding';
        _surfaceBinding?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SaveDesignConfiguration', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
