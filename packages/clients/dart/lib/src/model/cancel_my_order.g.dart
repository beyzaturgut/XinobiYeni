// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cancel_my_order.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CancelMyOrder extends CancelMyOrder {
  @override
  final String reason;
  @override
  final String? description;

  factory _$CancelMyOrder([void Function(CancelMyOrderBuilder)? updates]) =>
      (CancelMyOrderBuilder()..update(updates))._build();

  _$CancelMyOrder._({required this.reason, this.description}) : super._();
  @override
  CancelMyOrder rebuild(void Function(CancelMyOrderBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CancelMyOrderBuilder toBuilder() => CancelMyOrderBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CancelMyOrder &&
        reason == other.reason &&
        description == other.description;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reason.hashCode);
    _$hash = $jc(_$hash, description.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CancelMyOrder')
          ..add('reason', reason)
          ..add('description', description))
        .toString();
  }
}

class CancelMyOrderBuilder
    implements Builder<CancelMyOrder, CancelMyOrderBuilder> {
  _$CancelMyOrder? _$v;

  String? _reason;
  String? get reason => _$this._reason;
  set reason(String? reason) => _$this._reason = reason;

  String? _description;
  String? get description => _$this._description;
  set description(String? description) => _$this._description = description;

  CancelMyOrderBuilder() {
    CancelMyOrder._defaults(this);
  }

  CancelMyOrderBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reason = $v.reason;
      _description = $v.description;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CancelMyOrder other) {
    _$v = other as _$CancelMyOrder;
  }

  @override
  void update(void Function(CancelMyOrderBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CancelMyOrder build() => _build();

  _$CancelMyOrder _build() {
    final _$result = _$v ??
        _$CancelMyOrder._(
          reason: BuiltValueNullFieldError.checkNotNull(
              reason, r'CancelMyOrder', 'reason'),
          description: description,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
