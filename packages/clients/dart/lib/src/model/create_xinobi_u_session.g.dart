// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_xinobi_u_session.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateXinobiUSession extends CreateXinobiUSession {
  @override
  final String productId;
  @override
  final String? variantId;
  @override
  final String clientId;

  factory _$CreateXinobiUSession(
          [void Function(CreateXinobiUSessionBuilder)? updates]) =>
      (CreateXinobiUSessionBuilder()..update(updates))._build();

  _$CreateXinobiUSession._(
      {required this.productId, this.variantId, required this.clientId})
      : super._();
  @override
  CreateXinobiUSession rebuild(
          void Function(CreateXinobiUSessionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CreateXinobiUSessionBuilder toBuilder() =>
      CreateXinobiUSessionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateXinobiUSession &&
        productId == other.productId &&
        variantId == other.variantId &&
        clientId == other.clientId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, variantId.hashCode);
    _$hash = $jc(_$hash, clientId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreateXinobiUSession')
          ..add('productId', productId)
          ..add('variantId', variantId)
          ..add('clientId', clientId))
        .toString();
  }
}

class CreateXinobiUSessionBuilder
    implements Builder<CreateXinobiUSession, CreateXinobiUSessionBuilder> {
  _$CreateXinobiUSession? _$v;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  String? _variantId;
  String? get variantId => _$this._variantId;
  set variantId(String? variantId) => _$this._variantId = variantId;

  String? _clientId;
  String? get clientId => _$this._clientId;
  set clientId(String? clientId) => _$this._clientId = clientId;

  CreateXinobiUSessionBuilder() {
    CreateXinobiUSession._defaults(this);
  }

  CreateXinobiUSessionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _variantId = $v.variantId;
      _clientId = $v.clientId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreateXinobiUSession other) {
    _$v = other as _$CreateXinobiUSession;
  }

  @override
  void update(void Function(CreateXinobiUSessionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateXinobiUSession build() => _build();

  _$CreateXinobiUSession _build() {
    final _$result = _$v ??
        _$CreateXinobiUSession._(
          productId: BuiltValueNullFieldError.checkNotNull(
              productId, r'CreateXinobiUSession', 'productId'),
          variantId: variantId,
          clientId: BuiltValueNullFieldError.checkNotNull(
              clientId, r'CreateXinobiUSession', 'clientId'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
