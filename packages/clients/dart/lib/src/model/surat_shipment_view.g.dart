// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'surat_shipment_view.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SuratShipmentView extends SuratShipmentView {
  @override
  final String reference;
  @override
  final String state;
  @override
  final DateTime startedAt;
  @override
  final DateTime? completedAt;
  @override
  final String message;

  factory _$SuratShipmentView(
          [void Function(SuratShipmentViewBuilder)? updates]) =>
      (SuratShipmentViewBuilder()..update(updates))._build();

  _$SuratShipmentView._(
      {required this.reference,
      required this.state,
      required this.startedAt,
      this.completedAt,
      required this.message})
      : super._();
  @override
  SuratShipmentView rebuild(void Function(SuratShipmentViewBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SuratShipmentViewBuilder toBuilder() =>
      SuratShipmentViewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SuratShipmentView &&
        reference == other.reference &&
        state == other.state &&
        startedAt == other.startedAt &&
        completedAt == other.completedAt &&
        message == other.message;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reference.hashCode);
    _$hash = $jc(_$hash, state.hashCode);
    _$hash = $jc(_$hash, startedAt.hashCode);
    _$hash = $jc(_$hash, completedAt.hashCode);
    _$hash = $jc(_$hash, message.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SuratShipmentView')
          ..add('reference', reference)
          ..add('state', state)
          ..add('startedAt', startedAt)
          ..add('completedAt', completedAt)
          ..add('message', message))
        .toString();
  }
}

class SuratShipmentViewBuilder
    implements Builder<SuratShipmentView, SuratShipmentViewBuilder> {
  _$SuratShipmentView? _$v;

  String? _reference;
  String? get reference => _$this._reference;
  set reference(String? reference) => _$this._reference = reference;

  String? _state;
  String? get state => _$this._state;
  set state(String? state) => _$this._state = state;

  DateTime? _startedAt;
  DateTime? get startedAt => _$this._startedAt;
  set startedAt(DateTime? startedAt) => _$this._startedAt = startedAt;

  DateTime? _completedAt;
  DateTime? get completedAt => _$this._completedAt;
  set completedAt(DateTime? completedAt) => _$this._completedAt = completedAt;

  String? _message;
  String? get message => _$this._message;
  set message(String? message) => _$this._message = message;

  SuratShipmentViewBuilder() {
    SuratShipmentView._defaults(this);
  }

  SuratShipmentViewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reference = $v.reference;
      _state = $v.state;
      _startedAt = $v.startedAt;
      _completedAt = $v.completedAt;
      _message = $v.message;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SuratShipmentView other) {
    _$v = other as _$SuratShipmentView;
  }

  @override
  void update(void Function(SuratShipmentViewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SuratShipmentView build() => _build();

  _$SuratShipmentView _build() {
    final _$result = _$v ??
        _$SuratShipmentView._(
          reference: BuiltValueNullFieldError.checkNotNull(
              reference, r'SuratShipmentView', 'reference'),
          state: BuiltValueNullFieldError.checkNotNull(
              state, r'SuratShipmentView', 'state'),
          startedAt: BuiltValueNullFieldError.checkNotNull(
              startedAt, r'SuratShipmentView', 'startedAt'),
          completedAt: completedAt,
          message: BuiltValueNullFieldError.checkNotNull(
              message, r'SuratShipmentView', 'message'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
