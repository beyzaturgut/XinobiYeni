// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'print_setup_snapshot.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PrintSetupSnapshot extends PrintSetupSnapshot {
  @override
  final String status;
  @override
  final BuiltList<PrintProfileSnapshot> profiles;
  @override
  final bool? productionReady;

  factory _$PrintSetupSnapshot(
          [void Function(PrintSetupSnapshotBuilder)? updates]) =>
      (PrintSetupSnapshotBuilder()..update(updates))._build();

  _$PrintSetupSnapshot._(
      {required this.status, required this.profiles, this.productionReady})
      : super._();
  @override
  PrintSetupSnapshot rebuild(
          void Function(PrintSetupSnapshotBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PrintSetupSnapshotBuilder toBuilder() =>
      PrintSetupSnapshotBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PrintSetupSnapshot &&
        status == other.status &&
        profiles == other.profiles &&
        productionReady == other.productionReady;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, profiles.hashCode);
    _$hash = $jc(_$hash, productionReady.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PrintSetupSnapshot')
          ..add('status', status)
          ..add('profiles', profiles)
          ..add('productionReady', productionReady))
        .toString();
  }
}

class PrintSetupSnapshotBuilder
    implements Builder<PrintSetupSnapshot, PrintSetupSnapshotBuilder> {
  _$PrintSetupSnapshot? _$v;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  ListBuilder<PrintProfileSnapshot>? _profiles;
  ListBuilder<PrintProfileSnapshot> get profiles =>
      _$this._profiles ??= ListBuilder<PrintProfileSnapshot>();
  set profiles(ListBuilder<PrintProfileSnapshot>? profiles) =>
      _$this._profiles = profiles;

  bool? _productionReady;
  bool? get productionReady => _$this._productionReady;
  set productionReady(bool? productionReady) =>
      _$this._productionReady = productionReady;

  PrintSetupSnapshotBuilder() {
    PrintSetupSnapshot._defaults(this);
  }

  PrintSetupSnapshotBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _profiles = $v.profiles.toBuilder();
      _productionReady = $v.productionReady;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PrintSetupSnapshot other) {
    _$v = other as _$PrintSetupSnapshot;
  }

  @override
  void update(void Function(PrintSetupSnapshotBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PrintSetupSnapshot build() => _build();

  _$PrintSetupSnapshot _build() {
    _$PrintSetupSnapshot _$result;
    try {
      _$result = _$v ??
          _$PrintSetupSnapshot._(
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'PrintSetupSnapshot', 'status'),
            profiles: profiles.build(),
            productionReady: productionReady,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'profiles';
        profiles.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'PrintSetupSnapshot', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
