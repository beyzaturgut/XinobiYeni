// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminSummary extends AdminSummary {
  @override
  final DateTime? fromInclusive;
  @override
  final DateTime untilExclusive;
  @override
  final DateTime generatedAt;
  @override
  final String timeZone;
  @override
  final int orderCount;
  @override
  final int registeredCustomerCount;
  @override
  final BuiltList<OrderStatusCount> orderStatuses;

  factory _$AdminSummary([void Function(AdminSummaryBuilder)? updates]) =>
      (AdminSummaryBuilder()..update(updates))._build();

  _$AdminSummary._(
      {this.fromInclusive,
      required this.untilExclusive,
      required this.generatedAt,
      required this.timeZone,
      required this.orderCount,
      required this.registeredCustomerCount,
      required this.orderStatuses})
      : super._();
  @override
  AdminSummary rebuild(void Function(AdminSummaryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminSummaryBuilder toBuilder() => AdminSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminSummary &&
        fromInclusive == other.fromInclusive &&
        untilExclusive == other.untilExclusive &&
        generatedAt == other.generatedAt &&
        timeZone == other.timeZone &&
        orderCount == other.orderCount &&
        registeredCustomerCount == other.registeredCustomerCount &&
        orderStatuses == other.orderStatuses;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, fromInclusive.hashCode);
    _$hash = $jc(_$hash, untilExclusive.hashCode);
    _$hash = $jc(_$hash, generatedAt.hashCode);
    _$hash = $jc(_$hash, timeZone.hashCode);
    _$hash = $jc(_$hash, orderCount.hashCode);
    _$hash = $jc(_$hash, registeredCustomerCount.hashCode);
    _$hash = $jc(_$hash, orderStatuses.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminSummary')
          ..add('fromInclusive', fromInclusive)
          ..add('untilExclusive', untilExclusive)
          ..add('generatedAt', generatedAt)
          ..add('timeZone', timeZone)
          ..add('orderCount', orderCount)
          ..add('registeredCustomerCount', registeredCustomerCount)
          ..add('orderStatuses', orderStatuses))
        .toString();
  }
}

class AdminSummaryBuilder
    implements Builder<AdminSummary, AdminSummaryBuilder> {
  _$AdminSummary? _$v;

  DateTime? _fromInclusive;
  DateTime? get fromInclusive => _$this._fromInclusive;
  set fromInclusive(DateTime? fromInclusive) =>
      _$this._fromInclusive = fromInclusive;

  DateTime? _untilExclusive;
  DateTime? get untilExclusive => _$this._untilExclusive;
  set untilExclusive(DateTime? untilExclusive) =>
      _$this._untilExclusive = untilExclusive;

  DateTime? _generatedAt;
  DateTime? get generatedAt => _$this._generatedAt;
  set generatedAt(DateTime? generatedAt) => _$this._generatedAt = generatedAt;

  String? _timeZone;
  String? get timeZone => _$this._timeZone;
  set timeZone(String? timeZone) => _$this._timeZone = timeZone;

  int? _orderCount;
  int? get orderCount => _$this._orderCount;
  set orderCount(int? orderCount) => _$this._orderCount = orderCount;

  int? _registeredCustomerCount;
  int? get registeredCustomerCount => _$this._registeredCustomerCount;
  set registeredCustomerCount(int? registeredCustomerCount) =>
      _$this._registeredCustomerCount = registeredCustomerCount;

  ListBuilder<OrderStatusCount>? _orderStatuses;
  ListBuilder<OrderStatusCount> get orderStatuses =>
      _$this._orderStatuses ??= ListBuilder<OrderStatusCount>();
  set orderStatuses(ListBuilder<OrderStatusCount>? orderStatuses) =>
      _$this._orderStatuses = orderStatuses;

  AdminSummaryBuilder() {
    AdminSummary._defaults(this);
  }

  AdminSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _fromInclusive = $v.fromInclusive;
      _untilExclusive = $v.untilExclusive;
      _generatedAt = $v.generatedAt;
      _timeZone = $v.timeZone;
      _orderCount = $v.orderCount;
      _registeredCustomerCount = $v.registeredCustomerCount;
      _orderStatuses = $v.orderStatuses.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminSummary other) {
    _$v = other as _$AdminSummary;
  }

  @override
  void update(void Function(AdminSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminSummary build() => _build();

  _$AdminSummary _build() {
    _$AdminSummary _$result;
    try {
      _$result = _$v ??
          _$AdminSummary._(
            fromInclusive: fromInclusive,
            untilExclusive: BuiltValueNullFieldError.checkNotNull(
                untilExclusive, r'AdminSummary', 'untilExclusive'),
            generatedAt: BuiltValueNullFieldError.checkNotNull(
                generatedAt, r'AdminSummary', 'generatedAt'),
            timeZone: BuiltValueNullFieldError.checkNotNull(
                timeZone, r'AdminSummary', 'timeZone'),
            orderCount: BuiltValueNullFieldError.checkNotNull(
                orderCount, r'AdminSummary', 'orderCount'),
            registeredCustomerCount: BuiltValueNullFieldError.checkNotNull(
                registeredCustomerCount,
                r'AdminSummary',
                'registeredCustomerCount'),
            orderStatuses: orderStatuses.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'orderStatuses';
        orderStatuses.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AdminSummary', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
