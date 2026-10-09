// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inbox_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$InboxItem extends InboxItem {
  @override
  final String id;
  @override
  final String kind;
  @override
  final String title;
  @override
  final String body;
  @override
  final String? link;
  @override
  final DateTime createdAt;
  @override
  final bool read;

  factory _$InboxItem([void Function(InboxItemBuilder)? updates]) =>
      (InboxItemBuilder()..update(updates))._build();

  _$InboxItem._(
      {required this.id,
      required this.kind,
      required this.title,
      required this.body,
      this.link,
      required this.createdAt,
      required this.read})
      : super._();
  @override
  InboxItem rebuild(void Function(InboxItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  InboxItemBuilder toBuilder() => InboxItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is InboxItem &&
        id == other.id &&
        kind == other.kind &&
        title == other.title &&
        body == other.body &&
        link == other.link &&
        createdAt == other.createdAt &&
        read == other.read;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, body.hashCode);
    _$hash = $jc(_$hash, link.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, read.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'InboxItem')
          ..add('id', id)
          ..add('kind', kind)
          ..add('title', title)
          ..add('body', body)
          ..add('link', link)
          ..add('createdAt', createdAt)
          ..add('read', read))
        .toString();
  }
}

class InboxItemBuilder implements Builder<InboxItem, InboxItemBuilder> {
  _$InboxItem? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _kind;
  String? get kind => _$this._kind;
  set kind(String? kind) => _$this._kind = kind;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  String? _body;
  String? get body => _$this._body;
  set body(String? body) => _$this._body = body;

  String? _link;
  String? get link => _$this._link;
  set link(String? link) => _$this._link = link;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  bool? _read;
  bool? get read => _$this._read;
  set read(bool? read) => _$this._read = read;

  InboxItemBuilder() {
    InboxItem._defaults(this);
  }

  InboxItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _kind = $v.kind;
      _title = $v.title;
      _body = $v.body;
      _link = $v.link;
      _createdAt = $v.createdAt;
      _read = $v.read;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(InboxItem other) {
    _$v = other as _$InboxItem;
  }

  @override
  void update(void Function(InboxItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  InboxItem build() => _build();

  _$InboxItem _build() {
    final _$result = _$v ??
        _$InboxItem._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'InboxItem', 'id'),
          kind:
              BuiltValueNullFieldError.checkNotNull(kind, r'InboxItem', 'kind'),
          title: BuiltValueNullFieldError.checkNotNull(
              title, r'InboxItem', 'title'),
          body:
              BuiltValueNullFieldError.checkNotNull(body, r'InboxItem', 'body'),
          link: link,
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'InboxItem', 'createdAt'),
          read:
              BuiltValueNullFieldError.checkNotNull(read, r'InboxItem', 'read'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
