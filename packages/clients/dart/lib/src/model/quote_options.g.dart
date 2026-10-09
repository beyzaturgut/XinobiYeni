// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote_options.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$QuoteOptions extends QuoteOptions {
  @override
  final BuiltList<String> purposes;
  @override
  final int minQuantity;
  @override
  final int maxQuantity;
  @override
  final int maxItems;

  factory _$QuoteOptions([void Function(QuoteOptionsBuilder)? updates]) =>
      (QuoteOptionsBuilder()..update(updates))._build();

  _$QuoteOptions._(
      {required this.purposes,
      required this.minQuantity,
      required this.maxQuantity,
      required this.maxItems})
      : super._();
  @override
  QuoteOptions rebuild(void Function(QuoteOptionsBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  QuoteOptionsBuilder toBuilder() => QuoteOptionsBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuoteOptions &&
        purposes == other.purposes &&
        minQuantity == other.minQuantity &&
        maxQuantity == other.maxQuantity &&
        maxItems == other.maxItems;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, purposes.hashCode);
    _$hash = $jc(_$hash, minQuantity.hashCode);
    _$hash = $jc(_$hash, maxQuantity.hashCode);
    _$hash = $jc(_$hash, maxItems.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuoteOptions')
          ..add('purposes', purposes)
          ..add('minQuantity', minQuantity)
          ..add('maxQuantity', maxQuantity)
          ..add('maxItems', maxItems))
        .toString();
  }
}

class QuoteOptionsBuilder
    implements Builder<QuoteOptions, QuoteOptionsBuilder> {
  _$QuoteOptions? _$v;

  ListBuilder<String>? _purposes;
  ListBuilder<String> get purposes =>
      _$this._purposes ??= ListBuilder<String>();
  set purposes(ListBuilder<String>? purposes) => _$this._purposes = purposes;

  int? _minQuantity;
  int? get minQuantity => _$this._minQuantity;
  set minQuantity(int? minQuantity) => _$this._minQuantity = minQuantity;

  int? _maxQuantity;
  int? get maxQuantity => _$this._maxQuantity;
  set maxQuantity(int? maxQuantity) => _$this._maxQuantity = maxQuantity;

  int? _maxItems;
  int? get maxItems => _$this._maxItems;
  set maxItems(int? maxItems) => _$this._maxItems = maxItems;

  QuoteOptionsBuilder() {
    QuoteOptions._defaults(this);
  }

  QuoteOptionsBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _purposes = $v.purposes.toBuilder();
      _minQuantity = $v.minQuantity;
      _maxQuantity = $v.maxQuantity;
      _maxItems = $v.maxItems;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(QuoteOptions other) {
    _$v = other as _$QuoteOptions;
  }

  @override
  void update(void Function(QuoteOptionsBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuoteOptions build() => _build();

  _$QuoteOptions _build() {
    _$QuoteOptions _$result;
    try {
      _$result = _$v ??
          _$QuoteOptions._(
            purposes: purposes.build(),
            minQuantity: BuiltValueNullFieldError.checkNotNull(
                minQuantity, r'QuoteOptions', 'minQuantity'),
            maxQuantity: BuiltValueNullFieldError.checkNotNull(
                maxQuantity, r'QuoteOptions', 'maxQuantity'),
            maxItems: BuiltValueNullFieldError.checkNotNull(
                maxItems, r'QuoteOptions', 'maxItems'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'purposes';
        purposes.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'QuoteOptions', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
