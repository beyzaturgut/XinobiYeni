// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_message.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantMessage extends AssistantMessage {
  @override
  final String id;
  @override
  final String role;
  @override
  final String text;
  @override
  final BuiltList<AssistantProduct> products;
  @override
  final BuiltList<AssistantAction> actions;
  @override
  final DateTime at;
  @override
  final String? source_;

  factory _$AssistantMessage(
          [void Function(AssistantMessageBuilder)? updates]) =>
      (AssistantMessageBuilder()..update(updates))._build();

  _$AssistantMessage._(
      {required this.id,
      required this.role,
      required this.text,
      required this.products,
      required this.actions,
      required this.at,
      this.source_})
      : super._();
  @override
  AssistantMessage rebuild(void Function(AssistantMessageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantMessageBuilder toBuilder() =>
      AssistantMessageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantMessage &&
        id == other.id &&
        role == other.role &&
        text == other.text &&
        products == other.products &&
        actions == other.actions &&
        at == other.at &&
        source_ == other.source_;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, text.hashCode);
    _$hash = $jc(_$hash, products.hashCode);
    _$hash = $jc(_$hash, actions.hashCode);
    _$hash = $jc(_$hash, at.hashCode);
    _$hash = $jc(_$hash, source_.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantMessage')
          ..add('id', id)
          ..add('role', role)
          ..add('text', text)
          ..add('products', products)
          ..add('actions', actions)
          ..add('at', at)
          ..add('source_', source_))
        .toString();
  }
}

class AssistantMessageBuilder
    implements Builder<AssistantMessage, AssistantMessageBuilder> {
  _$AssistantMessage? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _role;
  String? get role => _$this._role;
  set role(String? role) => _$this._role = role;

  String? _text;
  String? get text => _$this._text;
  set text(String? text) => _$this._text = text;

  ListBuilder<AssistantProduct>? _products;
  ListBuilder<AssistantProduct> get products =>
      _$this._products ??= ListBuilder<AssistantProduct>();
  set products(ListBuilder<AssistantProduct>? products) =>
      _$this._products = products;

  ListBuilder<AssistantAction>? _actions;
  ListBuilder<AssistantAction> get actions =>
      _$this._actions ??= ListBuilder<AssistantAction>();
  set actions(ListBuilder<AssistantAction>? actions) =>
      _$this._actions = actions;

  DateTime? _at;
  DateTime? get at => _$this._at;
  set at(DateTime? at) => _$this._at = at;

  String? _source_;
  String? get source_ => _$this._source_;
  set source_(String? source_) => _$this._source_ = source_;

  AssistantMessageBuilder() {
    AssistantMessage._defaults(this);
  }

  AssistantMessageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _role = $v.role;
      _text = $v.text;
      _products = $v.products.toBuilder();
      _actions = $v.actions.toBuilder();
      _at = $v.at;
      _source_ = $v.source_;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantMessage other) {
    _$v = other as _$AssistantMessage;
  }

  @override
  void update(void Function(AssistantMessageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantMessage build() => _build();

  _$AssistantMessage _build() {
    _$AssistantMessage _$result;
    try {
      _$result = _$v ??
          _$AssistantMessage._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'AssistantMessage', 'id'),
            role: BuiltValueNullFieldError.checkNotNull(
                role, r'AssistantMessage', 'role'),
            text: BuiltValueNullFieldError.checkNotNull(
                text, r'AssistantMessage', 'text'),
            products: products.build(),
            actions: actions.build(),
            at: BuiltValueNullFieldError.checkNotNull(
                at, r'AssistantMessage', 'at'),
            source_: source_,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'products';
        products.build();
        _$failedField = 'actions';
        actions.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AssistantMessage', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
