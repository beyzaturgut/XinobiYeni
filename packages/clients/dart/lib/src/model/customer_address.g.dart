// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'customer_address.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CustomerAddress extends CustomerAddress {
  @override
  final String id;
  @override
  final String title;
  @override
  final String fullName;
  @override
  final String phone;
  @override
  final String city;
  @override
  final String district;
  @override
  final String line;
  @override
  final String? postalCode;
  @override
  final bool isDefault;

  factory _$CustomerAddress([void Function(CustomerAddressBuilder)? updates]) =>
      (CustomerAddressBuilder()..update(updates))._build();

  _$CustomerAddress._(
      {required this.id,
      required this.title,
      required this.fullName,
      required this.phone,
      required this.city,
      required this.district,
      required this.line,
      this.postalCode,
      required this.isDefault})
      : super._();
  @override
  CustomerAddress rebuild(void Function(CustomerAddressBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CustomerAddressBuilder toBuilder() => CustomerAddressBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CustomerAddress &&
        id == other.id &&
        title == other.title &&
        fullName == other.fullName &&
        phone == other.phone &&
        city == other.city &&
        district == other.district &&
        line == other.line &&
        postalCode == other.postalCode &&
        isDefault == other.isDefault;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, fullName.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jc(_$hash, city.hashCode);
    _$hash = $jc(_$hash, district.hashCode);
    _$hash = $jc(_$hash, line.hashCode);
    _$hash = $jc(_$hash, postalCode.hashCode);
    _$hash = $jc(_$hash, isDefault.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CustomerAddress')
          ..add('id', id)
          ..add('title', title)
          ..add('fullName', fullName)
          ..add('phone', phone)
          ..add('city', city)
          ..add('district', district)
          ..add('line', line)
          ..add('postalCode', postalCode)
          ..add('isDefault', isDefault))
        .toString();
  }
}

class CustomerAddressBuilder
    implements Builder<CustomerAddress, CustomerAddressBuilder> {
  _$CustomerAddress? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  String? _fullName;
  String? get fullName => _$this._fullName;
  set fullName(String? fullName) => _$this._fullName = fullName;

  String? _phone;
  String? get phone => _$this._phone;
  set phone(String? phone) => _$this._phone = phone;

  String? _city;
  String? get city => _$this._city;
  set city(String? city) => _$this._city = city;

  String? _district;
  String? get district => _$this._district;
  set district(String? district) => _$this._district = district;

  String? _line;
  String? get line => _$this._line;
  set line(String? line) => _$this._line = line;

  String? _postalCode;
  String? get postalCode => _$this._postalCode;
  set postalCode(String? postalCode) => _$this._postalCode = postalCode;

  bool? _isDefault;
  bool? get isDefault => _$this._isDefault;
  set isDefault(bool? isDefault) => _$this._isDefault = isDefault;

  CustomerAddressBuilder() {
    CustomerAddress._defaults(this);
  }

  CustomerAddressBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _title = $v.title;
      _fullName = $v.fullName;
      _phone = $v.phone;
      _city = $v.city;
      _district = $v.district;
      _line = $v.line;
      _postalCode = $v.postalCode;
      _isDefault = $v.isDefault;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CustomerAddress other) {
    _$v = other as _$CustomerAddress;
  }

  @override
  void update(void Function(CustomerAddressBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CustomerAddress build() => _build();

  _$CustomerAddress _build() {
    final _$result = _$v ??
        _$CustomerAddress._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'CustomerAddress', 'id'),
          title: BuiltValueNullFieldError.checkNotNull(
              title, r'CustomerAddress', 'title'),
          fullName: BuiltValueNullFieldError.checkNotNull(
              fullName, r'CustomerAddress', 'fullName'),
          phone: BuiltValueNullFieldError.checkNotNull(
              phone, r'CustomerAddress', 'phone'),
          city: BuiltValueNullFieldError.checkNotNull(
              city, r'CustomerAddress', 'city'),
          district: BuiltValueNullFieldError.checkNotNull(
              district, r'CustomerAddress', 'district'),
          line: BuiltValueNullFieldError.checkNotNull(
              line, r'CustomerAddress', 'line'),
          postalCode: postalCode,
          isDefault: BuiltValueNullFieldError.checkNotNull(
              isDefault, r'CustomerAddress', 'isDefault'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
