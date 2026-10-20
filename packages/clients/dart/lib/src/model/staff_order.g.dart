// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'staff_order.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$StaffOrder extends StaffOrder {
  @override
  final CustomerOrder order;
  @override
  final String accountId;
  @override
  final String customerName;
  @override
  final String customerEmail;
  @override
  final String? customerPhone;

  factory _$StaffOrder([void Function(StaffOrderBuilder)? updates]) =>
      (StaffOrderBuilder()..update(updates))._build();

  _$StaffOrder._(
      {required this.order,
      required this.accountId,
      required this.customerName,
      required this.customerEmail,
      this.customerPhone})
      : super._();
  @override
  StaffOrder rebuild(void Function(StaffOrderBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  StaffOrderBuilder toBuilder() => StaffOrderBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is StaffOrder &&
        order == other.order &&
        accountId == other.accountId &&
        customerName == other.customerName &&
        customerEmail == other.customerEmail &&
        customerPhone == other.customerPhone;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, order.hashCode);
    _$hash = $jc(_$hash, accountId.hashCode);
    _$hash = $jc(_$hash, customerName.hashCode);
    _$hash = $jc(_$hash, customerEmail.hashCode);
    _$hash = $jc(_$hash, customerPhone.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'StaffOrder')
          ..add('order', order)
          ..add('accountId', accountId)
          ..add('customerName', customerName)
          ..add('customerEmail', customerEmail)
          ..add('customerPhone', customerPhone))
        .toString();
  }
}

class StaffOrderBuilder implements Builder<StaffOrder, StaffOrderBuilder> {
  _$StaffOrder? _$v;

  CustomerOrderBuilder? _order;
  CustomerOrderBuilder get order => _$this._order ??= CustomerOrderBuilder();
  set order(CustomerOrderBuilder? order) => _$this._order = order;

  String? _accountId;
  String? get accountId => _$this._accountId;
  set accountId(String? accountId) => _$this._accountId = accountId;

  String? _customerName;
  String? get customerName => _$this._customerName;
  set customerName(String? customerName) => _$this._customerName = customerName;

  String? _customerEmail;
  String? get customerEmail => _$this._customerEmail;
  set customerEmail(String? customerEmail) =>
      _$this._customerEmail = customerEmail;

  String? _customerPhone;
  String? get customerPhone => _$this._customerPhone;
  set customerPhone(String? customerPhone) =>
      _$this._customerPhone = customerPhone;

  StaffOrderBuilder() {
    StaffOrder._defaults(this);
  }

  StaffOrderBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _order = $v.order.toBuilder();
      _accountId = $v.accountId;
      _customerName = $v.customerName;
      _customerEmail = $v.customerEmail;
      _customerPhone = $v.customerPhone;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(StaffOrder other) {
    _$v = other as _$StaffOrder;
  }

  @override
  void update(void Function(StaffOrderBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  StaffOrder build() => _build();

  _$StaffOrder _build() {
    _$StaffOrder _$result;
    try {
      _$result = _$v ??
          _$StaffOrder._(
            order: order.build(),
            accountId: BuiltValueNullFieldError.checkNotNull(
                accountId, r'StaffOrder', 'accountId'),
            customerName: BuiltValueNullFieldError.checkNotNull(
                customerName, r'StaffOrder', 'customerName'),
            customerEmail: BuiltValueNullFieldError.checkNotNull(
                customerEmail, r'StaffOrder', 'customerEmail'),
            customerPhone: customerPhone,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'order';
        order.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'StaffOrder', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
