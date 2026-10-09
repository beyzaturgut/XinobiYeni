// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_action.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantAction extends AssistantAction {
  @override
  final String kind;
  @override
  final String label;
  @override
  final BuiltList<String>? productIds;
  @override
  final String? url;

  factory _$AssistantAction([void Function(AssistantActionBuilder)? updates]) =>
      (AssistantActionBuilder()..update(updates))._build();

  _$AssistantAction._(
      {required this.kind, required this.label, this.productIds, this.url})
      : super._();
  @override
  AssistantAction rebuild(void Function(AssistantActionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantActionBuilder toBuilder() => AssistantActionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantAction &&
        kind == other.kind &&
        label == other.label &&
        productIds == other.productIds &&
        url == other.url;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, label.hashCode);
    _$hash = $jc(_$hash, productIds.hashCode);
    _$hash = $jc(_$hash, url.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantAction')
          ..add('kind', kind)
          ..add('label', label)
          ..add('productIds', productIds)
          ..add('url', url))
        .toString();
  }
}

class AssistantActionBuilder
    implements Builder<AssistantAction, AssistantActionBuilder> {
  _$AssistantAction? _$v;

  String? _kind;
  String? get kind => _$this._kind;
  set kind(String? kind) => _$this._kind = kind;

  String? _label;
  String? get label => _$this._label;
  set label(String? label) => _$this._label = label;

  ListBuilder<String>? _productIds;
  ListBuilder<String> get productIds =>
      _$this._productIds ??= ListBuilder<String>();
  set productIds(ListBuilder<String>? productIds) =>
      _$this._productIds = productIds;

  String? _url;
  String? get url => _$this._url;
  set url(String? url) => _$this._url = url;

  AssistantActionBuilder() {
    AssistantAction._defaults(this);
  }

  AssistantActionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _kind = $v.kind;
      _label = $v.label;
      _productIds = $v.productIds?.toBuilder();
      _url = $v.url;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantAction other) {
    _$v = other as _$AssistantAction;
  }

  @override
  void update(void Function(AssistantActionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantAction build() => _build();

  _$AssistantAction _build() {
    _$AssistantAction _$result;
    try {
      _$result = _$v ??
          _$AssistantAction._(
            kind: BuiltValueNullFieldError.checkNotNull(
                kind, r'AssistantAction', 'kind'),
            label: BuiltValueNullFieldError.checkNotNull(
                label, r'AssistantAction', 'label'),
            productIds: _productIds?.build(),
            url: url,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'productIds';
        _productIds?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AssistantAction', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
