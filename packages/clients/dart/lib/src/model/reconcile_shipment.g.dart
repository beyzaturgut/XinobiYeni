// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'reconcile_shipment.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReconcileShipment extends ReconcileShipment {
  @override
  final String evidence;
  @override
  final String? resolution;

  factory _$ReconcileShipment(
          [void Function(ReconcileShipmentBuilder)? updates]) =>
      (ReconcileShipmentBuilder()..update(updates))._build();

  _$ReconcileShipment._({required this.evidence, this.resolution}) : super._();
  @override
  ReconcileShipment rebuild(void Function(ReconcileShipmentBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ReconcileShipmentBuilder toBuilder() =>
      ReconcileShipmentBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReconcileShipment &&
        evidence == other.evidence &&
        resolution == other.resolution;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, evidence.hashCode);
    _$hash = $jc(_$hash, resolution.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReconcileShipment')
          ..add('evidence', evidence)
          ..add('resolution', resolution))
        .toString();
  }
}

class ReconcileShipmentBuilder
    implements Builder<ReconcileShipment, ReconcileShipmentBuilder> {
  _$ReconcileShipment? _$v;

  String? _evidence;
  String? get evidence => _$this._evidence;
  set evidence(String? evidence) => _$this._evidence = evidence;

  String? _resolution;
  String? get resolution => _$this._resolution;
  set resolution(String? resolution) => _$this._resolution = resolution;

  ReconcileShipmentBuilder() {
    ReconcileShipment._defaults(this);
  }

  ReconcileShipmentBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _evidence = $v.evidence;
      _resolution = $v.resolution;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReconcileShipment other) {
    _$v = other as _$ReconcileShipment;
  }

  @override
  void update(void Function(ReconcileShipmentBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReconcileShipment build() => _build();

  _$ReconcileShipment _build() {
    final _$result = _$v ??
        _$ReconcileShipment._(
          evidence: BuiltValueNullFieldError.checkNotNull(
              evidence, r'ReconcileShipment', 'evidence'),
          resolution: resolution,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
