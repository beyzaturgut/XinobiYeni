// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'change_customer_access.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ChangeCustomerAccess extends ChangeCustomerAccess {
  @override
  final String status;
  @override
  final String expectedVersion;

  factory _$ChangeCustomerAccess(
          [void Function(ChangeCustomerAccessBuilder)? updates]) =>
      (ChangeCustomerAccessBuilder()..update(updates))._build();

  _$ChangeCustomerAccess._(
      {required this.status, required this.expectedVersion})
      : super._();
  @override
  ChangeCustomerAccess rebuild(
          void Function(ChangeCustomerAccessBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ChangeCustomerAccessBuilder toBuilder() =>
      ChangeCustomerAccessBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ChangeCustomerAccess &&
        status == other.status &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ChangeCustomerAccess')
          ..add('status', status)
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class ChangeCustomerAccessBuilder
    implements Builder<ChangeCustomerAccess, ChangeCustomerAccessBuilder> {
  _$ChangeCustomerAccess? _$v;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  String? _expectedVersion;
  String? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(String? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  ChangeCustomerAccessBuilder() {
    ChangeCustomerAccess._defaults(this);
  }

  ChangeCustomerAccessBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ChangeCustomerAccess other) {
    _$v = other as _$ChangeCustomerAccess;
  }

  @override
  void update(void Function(ChangeCustomerAccessBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ChangeCustomerAccess build() => _build();

  _$ChangeCustomerAccess _build() {
    final _$result = _$v ??
        _$ChangeCustomerAccess._(
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'ChangeCustomerAccess', 'status'),
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
              expectedVersion, r'ChangeCustomerAccess', 'expectedVersion'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
