// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'permission_catalog_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PermissionCatalogResponse extends PermissionCatalogResponse {
  @override
  final BuiltList<String> resources;
  @override
  final BuiltList<String> permissions;

  factory _$PermissionCatalogResponse(
          [void Function(PermissionCatalogResponseBuilder)? updates]) =>
      (PermissionCatalogResponseBuilder()..update(updates))._build();

  _$PermissionCatalogResponse._(
      {required this.resources, required this.permissions})
      : super._();
  @override
  PermissionCatalogResponse rebuild(
          void Function(PermissionCatalogResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PermissionCatalogResponseBuilder toBuilder() =>
      PermissionCatalogResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PermissionCatalogResponse &&
        resources == other.resources &&
        permissions == other.permissions;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, resources.hashCode);
    _$hash = $jc(_$hash, permissions.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PermissionCatalogResponse')
          ..add('resources', resources)
          ..add('permissions', permissions))
        .toString();
  }
}

class PermissionCatalogResponseBuilder
    implements
        Builder<PermissionCatalogResponse, PermissionCatalogResponseBuilder> {
  _$PermissionCatalogResponse? _$v;

  ListBuilder<String>? _resources;
  ListBuilder<String> get resources =>
      _$this._resources ??= ListBuilder<String>();
  set resources(ListBuilder<String>? resources) =>
      _$this._resources = resources;

  ListBuilder<String>? _permissions;
  ListBuilder<String> get permissions =>
      _$this._permissions ??= ListBuilder<String>();
  set permissions(ListBuilder<String>? permissions) =>
      _$this._permissions = permissions;

  PermissionCatalogResponseBuilder() {
    PermissionCatalogResponse._defaults(this);
  }

  PermissionCatalogResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _resources = $v.resources.toBuilder();
      _permissions = $v.permissions.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PermissionCatalogResponse other) {
    _$v = other as _$PermissionCatalogResponse;
  }

  @override
  void update(void Function(PermissionCatalogResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PermissionCatalogResponse build() => _build();

  _$PermissionCatalogResponse _build() {
    _$PermissionCatalogResponse _$result;
    try {
      _$result = _$v ??
          _$PermissionCatalogResponse._(
            resources: resources.build(),
            permissions: permissions.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'resources';
        resources.build();
        _$failedField = 'permissions';
        permissions.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'PermissionCatalogResponse', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
