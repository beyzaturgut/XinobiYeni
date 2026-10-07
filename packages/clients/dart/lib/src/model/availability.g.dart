// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'availability.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Availability extends Availability {
  @override
  final String status;
  @override
  final int? remaining;

  factory _$Availability([void Function(AvailabilityBuilder)? updates]) =>
      (AvailabilityBuilder()..update(updates))._build();

  _$Availability._({required this.status, this.remaining}) : super._();
  @override
  Availability rebuild(void Function(AvailabilityBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AvailabilityBuilder toBuilder() => AvailabilityBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Availability &&
        status == other.status &&
        remaining == other.remaining;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, remaining.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Availability')
          ..add('status', status)
          ..add('remaining', remaining))
        .toString();
  }
}

class AvailabilityBuilder
    implements Builder<Availability, AvailabilityBuilder> {
  _$Availability? _$v;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  int? _remaining;
  int? get remaining => _$this._remaining;
  set remaining(int? remaining) => _$this._remaining = remaining;

  AvailabilityBuilder() {
    Availability._defaults(this);
  }

  AvailabilityBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _remaining = $v.remaining;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Availability other) {
    _$v = other as _$Availability;
  }

  @override
  void update(void Function(AvailabilityBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Availability build() => _build();

  _$Availability _build() {
    final _$result = _$v ??
        _$Availability._(
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'Availability', 'status'),
          remaining: remaining,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
