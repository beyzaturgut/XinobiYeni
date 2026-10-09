// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'mark_notifications_read.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MarkNotificationsRead extends MarkNotificationsRead {
  @override
  final BuiltList<String>? ids;

  factory _$MarkNotificationsRead(
          [void Function(MarkNotificationsReadBuilder)? updates]) =>
      (MarkNotificationsReadBuilder()..update(updates))._build();

  _$MarkNotificationsRead._({this.ids}) : super._();
  @override
  MarkNotificationsRead rebuild(
          void Function(MarkNotificationsReadBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MarkNotificationsReadBuilder toBuilder() =>
      MarkNotificationsReadBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MarkNotificationsRead && ids == other.ids;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, ids.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MarkNotificationsRead')
          ..add('ids', ids))
        .toString();
  }
}

class MarkNotificationsReadBuilder
    implements Builder<MarkNotificationsRead, MarkNotificationsReadBuilder> {
  _$MarkNotificationsRead? _$v;

  ListBuilder<String>? _ids;
  ListBuilder<String> get ids => _$this._ids ??= ListBuilder<String>();
  set ids(ListBuilder<String>? ids) => _$this._ids = ids;

  MarkNotificationsReadBuilder() {
    MarkNotificationsRead._defaults(this);
  }

  MarkNotificationsReadBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _ids = $v.ids?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MarkNotificationsRead other) {
    _$v = other as _$MarkNotificationsRead;
  }

  @override
  void update(void Function(MarkNotificationsReadBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MarkNotificationsRead build() => _build();

  _$MarkNotificationsRead _build() {
    _$MarkNotificationsRead _$result;
    try {
      _$result = _$v ??
          _$MarkNotificationsRead._(
            ids: _ids?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'ids';
        _ids?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'MarkNotificationsRead', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
