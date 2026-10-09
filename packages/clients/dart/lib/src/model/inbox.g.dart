// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'inbox.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Inbox extends Inbox {
  @override
  final BuiltList<InboxItem> items;
  @override
  final int unread;

  factory _$Inbox([void Function(InboxBuilder)? updates]) =>
      (InboxBuilder()..update(updates))._build();

  _$Inbox._({required this.items, required this.unread}) : super._();
  @override
  Inbox rebuild(void Function(InboxBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  InboxBuilder toBuilder() => InboxBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Inbox && items == other.items && unread == other.unread;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, unread.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Inbox')
          ..add('items', items)
          ..add('unread', unread))
        .toString();
  }
}

class InboxBuilder implements Builder<Inbox, InboxBuilder> {
  _$Inbox? _$v;

  ListBuilder<InboxItem>? _items;
  ListBuilder<InboxItem> get items =>
      _$this._items ??= ListBuilder<InboxItem>();
  set items(ListBuilder<InboxItem>? items) => _$this._items = items;

  int? _unread;
  int? get unread => _$this._unread;
  set unread(int? unread) => _$this._unread = unread;

  InboxBuilder() {
    Inbox._defaults(this);
  }

  InboxBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _unread = $v.unread;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Inbox other) {
    _$v = other as _$Inbox;
  }

  @override
  void update(void Function(InboxBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Inbox build() => _build();

  _$Inbox _build() {
    _$Inbox _$result;
    try {
      _$result = _$v ??
          _$Inbox._(
            items: items.build(),
            unread: BuiltValueNullFieldError.checkNotNull(
                unread, r'Inbox', 'unread'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(r'Inbox', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
