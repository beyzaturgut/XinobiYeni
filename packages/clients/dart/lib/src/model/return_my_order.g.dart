// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'return_my_order.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReturnMyOrder extends ReturnMyOrder {
  @override
  final String reason;
  @override
  final String? description;
  @override
  final BuiltList<OrderRequestLine> lines;

  factory _$ReturnMyOrder([void Function(ReturnMyOrderBuilder)? updates]) =>
      (ReturnMyOrderBuilder()..update(updates))._build();

  _$ReturnMyOrder._(
      {required this.reason, this.description, required this.lines})
      : super._();
  @override
  ReturnMyOrder rebuild(void Function(ReturnMyOrderBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ReturnMyOrderBuilder toBuilder() => ReturnMyOrderBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReturnMyOrder &&
        reason == other.reason &&
        description == other.description &&
        lines == other.lines;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jc(_$hash, lines.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReturnMyOrder')
          ..add('reason', reason)
          ..add('description', description)
          ..add('lines', lines))
        .toString();
  }
}

class ReturnMyOrderBuilder
    implements Builder<ReturnMyOrder, ReturnMyOrderBuilder> {
  _$ReturnMyOrder? _$v;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  ListBuilder<OrderRequestLine>? _lines;
  ListBuilder<OrderRequestLine> get lines =>
      _$this._lines ??= ListBuilder<OrderRequestLine>();
  set lines(ListBuilder<OrderRequestLine>? lines) => _$this._lines = lines;

  ReturnMyOrderBuilder() {
    ReturnMyOrder._defaults(this);
  }

  ReturnMyOrderBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reason = $v.reason;
      _description = $v.description;
      _lines = $v.lines.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReturnMyOrder other) {
    _$v = other as _$ReturnMyOrder;
  }

  @override
  void update(void Function(ReturnMyOrderBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReturnMyOrder build() => _build();

  _$ReturnMyOrder _build() {
    _$ReturnMyOrder _$result;
    try {
      _$result = _$v ??
          _$ReturnMyOrder._(
            reason: BuiltValueNullFieldError.checkNotNull(
                reason, r'ReturnMyOrder', 'reason'),
            description: description,
            lines: lines.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'lines';
        lines.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ReturnMyOrder', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
