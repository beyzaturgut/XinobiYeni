// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'announcement_list.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AnnouncementList extends AnnouncementList {
  @override
  final BuiltList<AnnouncementItem> items;

  factory _$AnnouncementList(
          [void Function(AnnouncementListBuilder)? updates]) =>
      (AnnouncementListBuilder()..update(updates))._build();

  _$AnnouncementList._({required this.items}) : super._();
  @override
  AnnouncementList rebuild(void Function(AnnouncementListBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AnnouncementListBuilder toBuilder() =>
      AnnouncementListBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AnnouncementList && items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AnnouncementList')
          ..add('items', items))
        .toString();
  }
}

class AnnouncementListBuilder
    implements Builder<AnnouncementList, AnnouncementListBuilder> {
  _$AnnouncementList? _$v;

  ListBuilder<AnnouncementItem>? _items;
  ListBuilder<AnnouncementItem> get items =>
      _$this._items ??= ListBuilder<AnnouncementItem>();
  set items(ListBuilder<AnnouncementItem>? items) => _$this._items = items;

  AnnouncementListBuilder() {
    AnnouncementList._defaults(this);
  }

  AnnouncementListBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AnnouncementList other) {
    _$v = other as _$AnnouncementList;
  }

  @override
  void update(void Function(AnnouncementListBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AnnouncementList build() => _build();

  _$AnnouncementList _build() {
    _$AnnouncementList _$result;
    try {
      _$result = _$v ??
          _$AnnouncementList._(
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AnnouncementList', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
