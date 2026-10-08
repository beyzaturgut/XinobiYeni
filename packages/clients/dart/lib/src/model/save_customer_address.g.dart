// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'save_customer_address.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SaveCustomerAddress extends SaveCustomerAddress {
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

  factory _$SaveCustomerAddress(
          [void Function(SaveCustomerAddressBuilder)? updates]) =>
      (SaveCustomerAddressBuilder()..update(updates))._build();

  _$SaveCustomerAddress._(
      {required this.title,
      required this.fullName,
      required this.phone,
      required this.city,
      required this.district,
      required this.line,
      this.postalCode,
      required this.isDefault})
      : super._();
  @override
  SaveCustomerAddress rebuild(
          void Function(SaveCustomerAddressBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SaveCustomerAddressBuilder toBuilder() =>
      SaveCustomerAddressBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SaveCustomerAddress &&
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
    return (newBuiltValueToStringHelper(r'SaveCustomerAddress')
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

class SaveCustomerAddressBuilder
    implements Builder<SaveCustomerAddress, SaveCustomerAddressBuilder> {
  _$SaveCustomerAddress? _$v;

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

  SaveCustomerAddressBuilder() {
    SaveCustomerAddress._defaults(this);
  }

  SaveCustomerAddressBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
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
  void replace(SaveCustomerAddress other) {
    _$v = other as _$SaveCustomerAddress;
  }

  @override
  void update(void Function(SaveCustomerAddressBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SaveCustomerAddress build() => _build();

  _$SaveCustomerAddress _build() {
    final _$result = _$v ??
        _$SaveCustomerAddress._(
          title: BuiltValueNullFieldError.checkNotNull(
              title, r'SaveCustomerAddress', 'title'),
          fullName: BuiltValueNullFieldError.checkNotNull(
              fullName, r'SaveCustomerAddress', 'fullName'),
          phone: BuiltValueNullFieldError.checkNotNull(
              phone, r'SaveCustomerAddress', 'phone'),
          city: BuiltValueNullFieldError.checkNotNull(
              city, r'SaveCustomerAddress', 'city'),
          district: BuiltValueNullFieldError.checkNotNull(
              district, r'SaveCustomerAddress', 'district'),
          line: BuiltValueNullFieldError.checkNotNull(
              line, r'SaveCustomerAddress', 'line'),
          postalCode: postalCode,
          isDefault: BuiltValueNullFieldError.checkNotNull(
              isDefault, r'SaveCustomerAddress', 'isDefault'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
