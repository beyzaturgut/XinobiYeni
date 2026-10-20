// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_customer_details.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminCustomerDetails extends AdminCustomerDetails {
  @override
  final AdminCustomerRow customer;
  @override
  final int addressCount;
  @override
  final int favoriteCount;

  factory _$AdminCustomerDetails(
          [void Function(AdminCustomerDetailsBuilder)? updates]) =>
      (AdminCustomerDetailsBuilder()..update(updates))._build();

  _$AdminCustomerDetails._(
      {required this.customer,
      required this.addressCount,
      required this.favoriteCount})
      : super._();
  @override
  AdminCustomerDetails rebuild(
          void Function(AdminCustomerDetailsBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminCustomerDetailsBuilder toBuilder() =>
      AdminCustomerDetailsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminCustomerDetails &&
        customer == other.customer &&
        addressCount == other.addressCount &&
        favoriteCount == other.favoriteCount;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, customer.hashCode);
    _$hash = $jc(_$hash, addressCount.hashCode);
    _$hash = $jc(_$hash, favoriteCount.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminCustomerDetails')
          ..add('customer', customer)
          ..add('addressCount', addressCount)
          ..add('favoriteCount', favoriteCount))
        .toString();
  }
}

class AdminCustomerDetailsBuilder
    implements Builder<AdminCustomerDetails, AdminCustomerDetailsBuilder> {
  _$AdminCustomerDetails? _$v;

  AdminCustomerRowBuilder? _customer;
  AdminCustomerRowBuilder get customer =>
      _$this._customer ??= AdminCustomerRowBuilder();
  set customer(AdminCustomerRowBuilder? customer) =>
      _$this._customer = customer;

  int? _addressCount;
  int? get addressCount => _$this._addressCount;
  set addressCount(int? addressCount) => _$this._addressCount = addressCount;

  int? _favoriteCount;
  int? get favoriteCount => _$this._favoriteCount;
  set favoriteCount(int? favoriteCount) =>
      _$this._favoriteCount = favoriteCount;

  AdminCustomerDetailsBuilder() {
    AdminCustomerDetails._defaults(this);
  }

  AdminCustomerDetailsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _customer = $v.customer.toBuilder();
      _addressCount = $v.addressCount;
      _favoriteCount = $v.favoriteCount;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminCustomerDetails other) {
    _$v = other as _$AdminCustomerDetails;
  }

  @override
  void update(void Function(AdminCustomerDetailsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminCustomerDetails build() => _build();

  _$AdminCustomerDetails _build() {
    _$AdminCustomerDetails _$result;
    try {
      _$result = _$v ??
          _$AdminCustomerDetails._(
            customer: customer.build(),
            addressCount: BuiltValueNullFieldError.checkNotNull(
                addressCount, r'AdminCustomerDetails', 'addressCount'),
            favoriteCount: BuiltValueNullFieldError.checkNotNull(
                favoriteCount, r'AdminCustomerDetails', 'favoriteCount'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'customer';
        customer.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AdminCustomerDetails', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
