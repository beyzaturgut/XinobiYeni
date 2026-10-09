// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_event.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderEvent extends OrderEvent {
  @override
  final String status;
  @override
  final DateTime at;
  @override
  final String actor;
  @override
  final String? note;

  factory _$OrderEvent([void Function(OrderEventBuilder)? updates]) =>
      (OrderEventBuilder()..update(updates))._build();

  _$OrderEvent._(
      {required this.status, required this.at, required this.actor, this.note})
      : super._();
  @override
  OrderEvent rebuild(void Function(OrderEventBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderEventBuilder toBuilder() => OrderEventBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderEvent &&
        status == other.status &&
        at == other.at &&
        actor == other.actor &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, at.hashCode);
    _$hash = $jc(_$hash, actor.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderEvent')
          ..add('status', status)
          ..add('at', at)
          ..add('actor', actor)
          ..add('note', note))
        .toString();
  }
}

class OrderEventBuilder implements Builder<OrderEvent, OrderEventBuilder> {
  _$OrderEvent? _$v;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  DateTime? _at;
  DateTime? get at => _$this._at;
  set at(DateTime? at) => _$this._at = at;

  String? _actor;
  String? get actor => _$this._actor;
  set actor(String? actor) => _$this._actor = actor;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  OrderEventBuilder() {
    OrderEvent._defaults(this);
  }

  OrderEventBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _at = $v.at;
      _actor = $v.actor;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderEvent other) {
    _$v = other as _$OrderEvent;
  }

  @override
  void update(void Function(OrderEventBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderEvent build() => _build();

  _$OrderEvent _build() {
    final _$result = _$v ??
        _$OrderEvent._(
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'OrderEvent', 'status'),
          at: BuiltValueNullFieldError.checkNotNull(at, r'OrderEvent', 'at'),
          actor: BuiltValueNullFieldError.checkNotNull(
              actor, r'OrderEvent', 'actor'),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
