// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'surat_tracking_view.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SuratTrackingView extends SuratTrackingView {
  @override
  final String reference;
  @override
  final String registrationState;
  @override
  final String environment;
  @override
  final String result;
  @override
  final DateTime? lastAttempt;
  @override
  final DateTime? lastSuccess;
  @override
  final BuiltList<SuratTrackingItem> items;

  factory _$SuratTrackingView(
          [void Function(SuratTrackingViewBuilder)? updates]) =>
      (SuratTrackingViewBuilder()..update(updates))._build();

  _$SuratTrackingView._(
      {required this.reference,
      required this.registrationState,
      required this.environment,
      required this.result,
      this.lastAttempt,
      this.lastSuccess,
      required this.items})
      : super._();
  @override
  SuratTrackingView rebuild(void Function(SuratTrackingViewBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SuratTrackingViewBuilder toBuilder() =>
      SuratTrackingViewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SuratTrackingView &&
        reference == other.reference &&
        registrationState == other.registrationState &&
        environment == other.environment &&
        result == other.result &&
        lastAttempt == other.lastAttempt &&
        lastSuccess == other.lastSuccess &&
        items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, reference.hashCode);
    _$hash = $jc(_$hash, registrationState.hashCode);
    _$hash = $jc(_$hash, environment.hashCode);
    _$hash = $jc(_$hash, result.hashCode);
    _$hash = $jc(_$hash, lastAttempt.hashCode);
    _$hash = $jc(_$hash, lastSuccess.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SuratTrackingView')
          ..add('reference', reference)
          ..add('registrationState', registrationState)
          ..add('environment', environment)
          ..add('result', result)
          ..add('lastAttempt', lastAttempt)
          ..add('lastSuccess', lastSuccess)
          ..add('items', items))
        .toString();
  }
}

class SuratTrackingViewBuilder
    implements Builder<SuratTrackingView, SuratTrackingViewBuilder> {
  _$SuratTrackingView? _$v;

  String? _reference;
  String? get reference => _$this._reference;
  set reference(String? reference) => _$this._reference = reference;

  String? _registrationState;
  String? get registrationState => _$this._registrationState;
  set registrationState(String? registrationState) =>
      _$this._registrationState = registrationState;

  String? _environment;
  String? get environment => _$this._environment;
  set environment(String? environment) => _$this._environment = environment;

  String? _result;
  String? get result => _$this._result;
  set result(String? result) => _$this._result = result;

  DateTime? _lastAttempt;
  DateTime? get lastAttempt => _$this._lastAttempt;
  set lastAttempt(DateTime? lastAttempt) => _$this._lastAttempt = lastAttempt;

  DateTime? _lastSuccess;
  DateTime? get lastSuccess => _$this._lastSuccess;
  set lastSuccess(DateTime? lastSuccess) => _$this._lastSuccess = lastSuccess;

  ListBuilder<SuratTrackingItem>? _items;
  ListBuilder<SuratTrackingItem> get items =>
      _$this._items ??= ListBuilder<SuratTrackingItem>();
  set items(ListBuilder<SuratTrackingItem>? items) => _$this._items = items;

  SuratTrackingViewBuilder() {
    SuratTrackingView._defaults(this);
  }

  SuratTrackingViewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _reference = $v.reference;
      _registrationState = $v.registrationState;
      _environment = $v.environment;
      _result = $v.result;
      _lastAttempt = $v.lastAttempt;
      _lastSuccess = $v.lastSuccess;
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SuratTrackingView other) {
    _$v = other as _$SuratTrackingView;
  }

  @override
  void update(void Function(SuratTrackingViewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SuratTrackingView build() => _build();

  _$SuratTrackingView _build() {
    _$SuratTrackingView _$result;
    try {
      _$result = _$v ??
          _$SuratTrackingView._(
            reference: BuiltValueNullFieldError.checkNotNull(
                reference, r'SuratTrackingView', 'reference'),
            registrationState: BuiltValueNullFieldError.checkNotNull(
                registrationState, r'SuratTrackingView', 'registrationState'),
            environment: BuiltValueNullFieldError.checkNotNull(
                environment, r'SuratTrackingView', 'environment'),
            result: BuiltValueNullFieldError.checkNotNull(
                result, r'SuratTrackingView', 'result'),
            lastAttempt: lastAttempt,
            lastSuccess: lastSuccess,
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'SuratTrackingView', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
