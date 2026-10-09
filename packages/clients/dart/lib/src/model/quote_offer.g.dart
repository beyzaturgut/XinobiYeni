// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote_offer.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$QuoteOffer extends QuoteOffer {
  @override
  final Money total;
  @override
  final Date validUntil;
  @override
  final String? note;
  @override
  final DateTime at;

  factory _$QuoteOffer([void Function(QuoteOfferBuilder)? updates]) =>
      (QuoteOfferBuilder()..update(updates))._build();

  _$QuoteOffer._(
      {required this.total,
      required this.validUntil,
      this.note,
      required this.at})
      : super._();
  @override
  QuoteOffer rebuild(void Function(QuoteOfferBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  QuoteOfferBuilder toBuilder() => QuoteOfferBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is QuoteOffer &&
        total == other.total &&
        validUntil == other.validUntil &&
        note == other.note &&
        at == other.at;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, total.hashCode);
    _$hash = $jc(_$hash, validUntil.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, at.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'QuoteOffer')
          ..add('total', total)
          ..add('validUntil', validUntil)
          ..add('note', note)
          ..add('at', at))
        .toString();
  }
}

class QuoteOfferBuilder implements Builder<QuoteOffer, QuoteOfferBuilder> {
  _$QuoteOffer? _$v;

  MoneyBuilder? _total;
  MoneyBuilder get total => _$this._total ??= MoneyBuilder();
  set total(MoneyBuilder? total) => _$this._total = total;

  Date? _validUntil;
  Date? get validUntil => _$this._validUntil;
  set validUntil(Date? validUntil) => _$this._validUntil = validUntil;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  DateTime? _at;
  DateTime? get at => _$this._at;
  set at(DateTime? at) => _$this._at = at;

  QuoteOfferBuilder() {
    QuoteOffer._defaults(this);
  }

  QuoteOfferBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _total = $v.total.toBuilder();
      _validUntil = $v.validUntil;
      _note = $v.note;
      _at = $v.at;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(QuoteOffer other) {
    _$v = other as _$QuoteOffer;
  }

  @override
  void update(void Function(QuoteOfferBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  QuoteOffer build() => _build();

  _$QuoteOffer _build() {
    _$QuoteOffer _$result;
    try {
      _$result = _$v ??
          _$QuoteOffer._(
            total: total.build(),
            validUntil: BuiltValueNullFieldError.checkNotNull(
                validUntil, r'QuoteOffer', 'validUntil'),
            note: note,
            at: BuiltValueNullFieldError.checkNotNull(at, r'QuoteOffer', 'at'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'total';
        total.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'QuoteOffer', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
