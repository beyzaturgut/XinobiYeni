// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_quote.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateQuote extends CreateQuote {
  @override
  final String company;
  @override
  final String contactName;
  @override
  final String email;
  @override
  final String? phone;
  @override
  final String? taxNumber;
  @override
  final BuiltList<QuoteItemRequest> items;
  @override
  final bool personalization;
  @override
  final String? personalizationNote;
  @override
  final Date? desiredDate;
  @override
  final String? purpose;
  @override
  final String? note;

  factory _$CreateQuote([void Function(CreateQuoteBuilder)? updates]) =>
      (CreateQuoteBuilder()..update(updates))._build();

  _$CreateQuote._(
      {required this.company,
      required this.contactName,
      required this.email,
      this.phone,
      this.taxNumber,
      required this.items,
      required this.personalization,
      this.personalizationNote,
      this.desiredDate,
      this.purpose,
      this.note})
      : super._();
  @override
  CreateQuote rebuild(void Function(CreateQuoteBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CreateQuoteBuilder toBuilder() => CreateQuoteBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateQuote &&
        company == other.company &&
        contactName == other.contactName &&
        email == other.email &&
        phone == other.phone &&
        taxNumber == other.taxNumber &&
        items == other.items &&
        personalization == other.personalization &&
        personalizationNote == other.personalizationNote &&
        desiredDate == other.desiredDate &&
        purpose == other.purpose &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, company.hashCode);
    _$hash = $jc(_$hash, contactName.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, phone.hashCode);
    _$hash = $jc(_$hash, taxNumber.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, personalization.hashCode);
    _$hash = $jc(_$hash, personalizationNote.hashCode);
    _$hash = $jc(_$hash, desiredDate.hashCode);
    _$hash = $jc(_$hash, purpose.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreateQuote')
          ..add('company', company)
          ..add('contactName', contactName)
          ..add('email', email)
          ..add('phone', phone)
          ..add('taxNumber', taxNumber)
          ..add('items', items)
          ..add('personalization', personalization)
          ..add('personalizationNote', personalizationNote)
          ..add('desiredDate', desiredDate)
          ..add('purpose', purpose)
          ..add('note', note))
        .toString();
  }
}

class CreateQuoteBuilder implements Builder<CreateQuote, CreateQuoteBuilder> {
  _$CreateQuote? _$v;

  String? _company;
  String? get company => _$this._company;
  set company(String? company) => _$this._company = company;

  String? _contactName;
  String? get contactName => _$this._contactName;
  set contactName(String? contactName) => _$this._contactName = contactName;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  String? _phone;
  String? get phone => _$this._phone;
  set phone(String? phone) => _$this._phone = phone;

  String? _taxNumber;
  String? get taxNumber => _$this._taxNumber;
  set taxNumber(String? taxNumber) => _$this._taxNumber = taxNumber;

  ListBuilder<QuoteItemRequest>? _items;
  ListBuilder<QuoteItemRequest> get items =>
      _$this._items ??= ListBuilder<QuoteItemRequest>();
  set items(ListBuilder<QuoteItemRequest>? items) => _$this._items = items;

  bool? _personalization;
  bool? get personalization => _$this._personalization;
  set personalization(bool? personalization) =>
      _$this._personalization = personalization;

  String? _personalizationNote;
  String? get personalizationNote => _$this._personalizationNote;
  set personalizationNote(String? personalizationNote) =>
      _$this._personalizationNote = personalizationNote;

  Date? _desiredDate;
  Date? get desiredDate => _$this._desiredDate;
  set desiredDate(Date? desiredDate) => _$this._desiredDate = desiredDate;

  String? _purpose;
  String? get purpose => _$this._purpose;
  set purpose(String? purpose) => _$this._purpose = purpose;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  CreateQuoteBuilder() {
    CreateQuote._defaults(this);
  }

  CreateQuoteBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _company = $v.company;
      _contactName = $v.contactName;
      _email = $v.email;
      _phone = $v.phone;
      _taxNumber = $v.taxNumber;
      _items = $v.items.toBuilder();
      _personalization = $v.personalization;
      _personalizationNote = $v.personalizationNote;
      _desiredDate = $v.desiredDate;
      _purpose = $v.purpose;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreateQuote other) {
    _$v = other as _$CreateQuote;
  }

  @override
  void update(void Function(CreateQuoteBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateQuote build() => _build();

  _$CreateQuote _build() {
    _$CreateQuote _$result;
    try {
      _$result = _$v ??
          _$CreateQuote._(
            company: BuiltValueNullFieldError.checkNotNull(
                company, r'CreateQuote', 'company'),
            contactName: BuiltValueNullFieldError.checkNotNull(
                contactName, r'CreateQuote', 'contactName'),
            email: BuiltValueNullFieldError.checkNotNull(
                email, r'CreateQuote', 'email'),
            phone: phone,
            taxNumber: taxNumber,
            items: items.build(),
            personalization: BuiltValueNullFieldError.checkNotNull(
                personalization, r'CreateQuote', 'personalization'),
            personalizationNote: personalizationNote,
            desiredDate: desiredDate,
            purpose: purpose,
            note: note,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'CreateQuote', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
