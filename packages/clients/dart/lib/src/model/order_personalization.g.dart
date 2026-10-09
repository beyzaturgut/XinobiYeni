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

  factory _$OrderPersonalization(
          [void Function(OrderPersonalizationBuilder)? updates]) =>
      (OrderPersonalizationBuilder()..update(updates))._build();

  _$OrderPersonalization._(
      {required this.designId,
      required this.kind,
      required this.name,
      required this.mime,
      this.imageUrl})
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
        imageUrl == other.imageUrl;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, designId.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, mime.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
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
          ..add('imageUrl', imageUrl))
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
    final _$result = _$v ??
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
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
