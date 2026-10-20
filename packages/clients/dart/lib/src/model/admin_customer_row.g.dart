// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_customer_row.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminCustomerRow extends AdminCustomerRow {
  @override
  final String id;
  @override
  final String name;
  @override
  final String email;
  @override
  final String? phone;
  @override
  final String status;
  @override
  final DateTime createdAt;
  @override
  final int orderCount;
  @override
  final DateTime? lastOrderAt;

  factory _$AdminCustomerRow(
          [void Function(AdminCustomerRowBuilder)? updates]) =>
      (AdminCustomerRowBuilder()..update(updates))._build();

  _$AdminCustomerRow._(
      {required this.id,
      required this.name,
      required this.email,
      this.phone,
      required this.status,
      required this.createdAt,
      required this.orderCount,
      this.lastOrderAt})
      : super._();
  @override
  AdminCustomerRow rebuild(void Function(AdminCustomerRowBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminCustomerRowBuilder toBuilder() =>
      AdminCustomerRowBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminCustomerRow &&
        id == other.id &&
        name == other.name &&
        email == other.email &&
        phone == other.phone &&
        status == other.status &&
        createdAt == other.createdAt &&
        orderCount == other.orderCount &&
        lastOrderAt == other.lastOrderAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, orderCount.hashCode);
    _$hash = $jc(_$hash, lastOrderAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminCustomerRow')
          ..add('id', id)
          ..add('name', name)
          ..add('email', email)
          ..add('phone', phone)
          ..add('status', status)
          ..add('createdAt', createdAt)
          ..add('orderCount', orderCount)
          ..add('lastOrderAt', lastOrderAt))
        .toString();
  }
}

class AdminCustomerRowBuilder
    implements Builder<AdminCustomerRow, AdminCustomerRowBuilder> {
  _$AdminCustomerRow? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _phone;
  String? get phone => _$this._phone;
  set phone(String? phone) => _$this._phone = phone;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  int? _orderCount;
  int? get orderCount => _$this._orderCount;
  set orderCount(int? orderCount) => _$this._orderCount = orderCount;

  DateTime? _lastOrderAt;
  DateTime? get lastOrderAt => _$this._lastOrderAt;
  set lastOrderAt(DateTime? lastOrderAt) => _$this._lastOrderAt = lastOrderAt;

  AdminCustomerRowBuilder() {
    AdminCustomerRow._defaults(this);
  }

  AdminCustomerRowBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _email = $v.email;
      _phone = $v.phone;
      _status = $v.status;
      _createdAt = $v.createdAt;
      _orderCount = $v.orderCount;
      _lastOrderAt = $v.lastOrderAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminCustomerRow other) {
    _$v = other as _$AdminCustomerRow;
  }

  @override
  void update(void Function(AdminCustomerRowBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminCustomerRow build() => _build();

  _$AdminCustomerRow _build() {
    final _$result = _$v ??
        _$AdminCustomerRow._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'AdminCustomerRow', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'AdminCustomerRow', 'name'),
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'AdminCustomerRow', 'email'),
          phone: phone,
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'AdminCustomerRow', 'status'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'AdminCustomerRow', 'createdAt'),
          orderCount: BuiltValueNullFieldError.checkNotNull(
              orderCount, r'AdminCustomerRow', 'orderCount'),
          lastOrderAt: lastOrderAt,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
