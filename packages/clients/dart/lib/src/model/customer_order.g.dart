// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_order.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerOrder extends CustomerOrder {
  @override
  final String id;
  @override
  final String number;
  @override
  final DateTime createdAt;
  @override
  final String status;
  @override
  final CustomerAddress address;
  @override
  final BuiltList<CustomerOrderLine> lines;
  @override
  final Money total;

  factory _$CustomerOrder([void Function(CustomerOrderBuilder)? updates]) =>
      (CustomerOrderBuilder()..update(updates))._build();

  _$CustomerOrder._(
      {required this.id,
      required this.number,
      required this.createdAt,
      required this.status,
      required this.address,
      required this.lines,
      required this.total})
      : super._();
  @override
  CustomerOrder rebuild(void Function(CustomerOrderBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CustomerOrderBuilder toBuilder() => CustomerOrderBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerOrder &&
        id == other.id &&
        number == other.number &&
        createdAt == other.createdAt &&
        status == other.status &&
        address == other.address &&
        lines == other.lines &&
        total == other.total;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, number.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, lines.hashCode);
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerOrder')
          ..add('id', id)
          ..add('number', number)
          ..add('createdAt', createdAt)
          ..add('status', status)
          ..add('address', address)
          ..add('lines', lines)
          ..add('total', total))
        .toString();
  }
}

class CustomerOrderBuilder
    implements Builder<CustomerOrder, CustomerOrderBuilder> {
  _$CustomerOrder? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _number;
  String? get number => _$this._number;
  set number(String? number) => _$this._number = number;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  CustomerAddressBuilder? _address;
  CustomerAddressBuilder get address =>
      _$this._address ??= CustomerAddressBuilder();
  set address(CustomerAddressBuilder? address) => _$this._address = address;

  ListBuilder<CustomerOrderLine>? _lines;
  ListBuilder<CustomerOrderLine> get lines =>
      _$this._lines ??= ListBuilder<CustomerOrderLine>();
  set lines(ListBuilder<CustomerOrderLine>? lines) => _$this._lines = lines;

  MoneyBuilder? _total;
  MoneyBuilder get total => _$this._total ??= MoneyBuilder();
  set total(MoneyBuilder? total) => _$this._total = total;

  CustomerOrderBuilder() {
    CustomerOrder._defaults(this);
  }

  CustomerOrderBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _number = $v.number;
      _createdAt = $v.createdAt;
      _status = $v.status;
      _address = $v.address.toBuilder();
      _lines = $v.lines.toBuilder();
      _total = $v.total.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerOrder other) {
    _$v = other as _$CustomerOrder;
  }

  @override
  void update(void Function(CustomerOrderBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerOrder build() => _build();

  _$CustomerOrder _build() {
    _$CustomerOrder _$result;
    try {
      _$result = _$v ??
          _$CustomerOrder._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'CustomerOrder', 'id'),
            number: BuiltValueNullFieldError.checkNotNull(
                number, r'CustomerOrder', 'number'),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'CustomerOrder', 'createdAt'),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'CustomerOrder', 'status'),
            address: address.build(),
            lines: lines.build(),
            total: total.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'address';
        address.build();
        _$failedField = 'lines';
        lines.build();
        _$failedField = 'total';
        total.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'CustomerOrder', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
