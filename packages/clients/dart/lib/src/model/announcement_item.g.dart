// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'announcement_item.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AnnouncementItem extends AnnouncementItem {
  @override
  final String id;
  @override
  final String title;
  @override
  final String body;
  @override
  final String kind;
  @override
  final DateTime publishedAt;

  factory _$AnnouncementItem(
          [void Function(AnnouncementItemBuilder)? updates]) =>
      (AnnouncementItemBuilder()..update(updates))._build();

  _$AnnouncementItem._(
      {required this.id,
      required this.title,
      required this.body,
      required this.kind,
      required this.publishedAt})
      : super._();
  @override
  AnnouncementItem rebuild(void Function(AnnouncementItemBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AnnouncementItemBuilder toBuilder() =>
      AnnouncementItemBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AnnouncementItem &&
        id == other.id &&
        title == other.title &&
        body == other.body &&
        kind == other.kind &&
        publishedAt == other.publishedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, body.hashCode);
    _$hash = $jc(_$hash, kind.hashCode);
    _$hash = $jc(_$hash, publishedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AnnouncementItem')
          ..add('id', id)
          ..add('title', title)
          ..add('body', body)
          ..add('kind', kind)
          ..add('publishedAt', publishedAt))
        .toString();
  }
}

class AnnouncementItemBuilder
    implements Builder<AnnouncementItem, AnnouncementItemBuilder> {
  _$AnnouncementItem? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  String? _body;
  String? get body => _$this._body;
  set body(String? body) => _$this._body = body;

  String? _kind;
  String? get kind => _$this._kind;
  set kind(String? kind) => _$this._kind = kind;

  DateTime? _publishedAt;
  DateTime? get publishedAt => _$this._publishedAt;
  set publishedAt(DateTime? publishedAt) => _$this._publishedAt = publishedAt;

  AnnouncementItemBuilder() {
    AnnouncementItem._defaults(this);
  }

  AnnouncementItemBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _title = $v.title;
      _body = $v.body;
      _kind = $v.kind;
      _publishedAt = $v.publishedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AnnouncementItem other) {
    _$v = other as _$AnnouncementItem;
  }

  @override
  void update(void Function(AnnouncementItemBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AnnouncementItem build() => _build();

  _$AnnouncementItem _build() {
    final _$result = _$v ??
        _$AnnouncementItem._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'AnnouncementItem', 'id'),
          title: BuiltValueNullFieldError.checkNotNull(
              title, r'AnnouncementItem', 'title'),
          body: BuiltValueNullFieldError.checkNotNull(
              body, r'AnnouncementItem', 'body'),
          kind: BuiltValueNullFieldError.checkNotNull(
              kind, r'AnnouncementItem', 'kind'),
          publishedAt: BuiltValueNullFieldError.checkNotNull(
              publishedAt, r'AnnouncementItem', 'publishedAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
