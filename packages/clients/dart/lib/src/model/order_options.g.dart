// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_options.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderOptions extends OrderOptions {
  @override
  final BuiltList<String> cancelReasons;
  @override
  final BuiltList<String> returnReasons;
  @override
  final BuiltList<String> carriers;
  @override
  final int returnWindowDays;

  factory _$OrderOptions([void Function(OrderOptionsBuilder)? updates]) =>
      (OrderOptionsBuilder()..update(updates))._build();

  _$OrderOptions._(
      {required this.cancelReasons,
      required this.returnReasons,
      required this.carriers,
      required this.returnWindowDays})
      : super._();
  @override
  OrderOptions rebuild(void Function(OrderOptionsBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderOptionsBuilder toBuilder() => OrderOptionsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderOptions &&
        cancelReasons == other.cancelReasons &&
        returnReasons == other.returnReasons &&
        carriers == other.carriers &&
        returnWindowDays == other.returnWindowDays;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, cancelReasons.hashCode);
    _$hash = $jc(_$hash, returnReasons.hashCode);
    _$hash = $jc(_$hash, carriers.hashCode);
    _$hash = $jc(_$hash, returnWindowDays.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderOptions')
          ..add('cancelReasons', cancelReasons)
          ..add('returnReasons', returnReasons)
          ..add('carriers', carriers)
          ..add('returnWindowDays', returnWindowDays))
        .toString();
  }
}

class OrderOptionsBuilder
    implements Builder<OrderOptions, OrderOptionsBuilder> {
  _$OrderOptions? _$v;

  ListBuilder<String>? _cancelReasons;
  ListBuilder<String> get cancelReasons =>
      _$this._cancelReasons ??= ListBuilder<String>();
  set cancelReasons(ListBuilder<String>? cancelReasons) =>
      _$this._cancelReasons = cancelReasons;

  ListBuilder<String>? _returnReasons;
  ListBuilder<String> get returnReasons =>
      _$this._returnReasons ??= ListBuilder<String>();
  set returnReasons(ListBuilder<String>? returnReasons) =>
      _$this._returnReasons = returnReasons;

  ListBuilder<String>? _carriers;
  ListBuilder<String> get carriers =>
      _$this._carriers ??= ListBuilder<String>();
  set carriers(ListBuilder<String>? carriers) => _$this._carriers = carriers;

  int? _returnWindowDays;
  int? get returnWindowDays => _$this._returnWindowDays;
  set returnWindowDays(int? returnWindowDays) =>
      _$this._returnWindowDays = returnWindowDays;

  OrderOptionsBuilder() {
    OrderOptions._defaults(this);
  }

  OrderOptionsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _cancelReasons = $v.cancelReasons.toBuilder();
      _returnReasons = $v.returnReasons.toBuilder();
      _carriers = $v.carriers.toBuilder();
      _returnWindowDays = $v.returnWindowDays;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderOptions other) {
    _$v = other as _$OrderOptions;
  }

  @override
  void update(void Function(OrderOptionsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderOptions build() => _build();

  _$OrderOptions _build() {
    _$OrderOptions _$result;
    try {
      _$result = _$v ??
          _$OrderOptions._(
            cancelReasons: cancelReasons.build(),
            returnReasons: returnReasons.build(),
            carriers: carriers.build(),
            returnWindowDays: BuiltValueNullFieldError.checkNotNull(
                returnWindowDays, r'OrderOptions', 'returnWindowDays'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'cancelReasons';
        cancelReasons.build();
        _$failedField = 'returnReasons';
        returnReasons.build();
        _$failedField = 'carriers';
        carriers.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'OrderOptions', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
