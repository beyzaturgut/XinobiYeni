// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'delete_managed_customer.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$DeleteManagedCustomer extends DeleteManagedCustomer {
  @override
  final String expectedVersion;

  factory _$DeleteManagedCustomer(
          [void Function(DeleteManagedCustomerBuilder)? updates]) =>
      (DeleteManagedCustomerBuilder()..update(updates))._build();

  _$DeleteManagedCustomer._({required this.expectedVersion}) : super._();
  @override
  DeleteManagedCustomer rebuild(
          void Function(DeleteManagedCustomerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  DeleteManagedCustomerBuilder toBuilder() =>
      DeleteManagedCustomerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is DeleteManagedCustomer &&
        expectedVersion == other.expectedVersion;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, expectedVersion.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'DeleteManagedCustomer')
          ..add('expectedVersion', expectedVersion))
        .toString();
  }
}

class DeleteManagedCustomerBuilder
    implements Builder<DeleteManagedCustomer, DeleteManagedCustomerBuilder> {
  _$DeleteManagedCustomer? _$v;

  String? _expectedVersion;
  String? get expectedVersion => _$this._expectedVersion;
  set expectedVersion(String? expectedVersion) =>
      _$this._expectedVersion = expectedVersion;

  DeleteManagedCustomerBuilder() {
    DeleteManagedCustomer._defaults(this);
  }

  DeleteManagedCustomerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _expectedVersion = $v.expectedVersion;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(DeleteManagedCustomer other) {
    _$v = other as _$DeleteManagedCustomer;
  }

  @override
  void update(void Function(DeleteManagedCustomerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  DeleteManagedCustomer build() => _build();

  _$DeleteManagedCustomer _build() {
    final _$result = _$v ??
        _$DeleteManagedCustomer._(
          expectedVersion: BuiltValueNullFieldError.checkNotNull(
              expectedVersion, r'DeleteManagedCustomer', 'expectedVersion'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
