// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'quote.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$Quote extends Quote {
  @override
  final String id;
  @override
  final String code;
  @override
  final String? accountId;
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
  final BuiltList<QuoteItem> items;
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
  @override
  final String status;
  @override
  final DateTime createdAt;
  @override
  final QuoteOffer? offer;
  @override
  final BuiltList<QuoteMessage> messages;
  @override
  final BuiltList<QuoteEvent> history;

  factory _$Quote([void Function(QuoteBuilder)? updates]) =>
      (QuoteBuilder()..update(updates))._build();

  _$Quote._(
      {required this.id,
      required this.code,
      this.accountId,
      required this.company,
      required this.contactName,
      required this.email,
      this.phone,
      this.taxNumber,
      required this.items,
      required this.personalization,
      this.personalizationNote,
      this.desiredDate,
      this.purpose,
      this.note,
      required this.status,
      required this.createdAt,
      this.offer,
      required this.messages,
      required this.history})
      : super._();
  @override
  Quote rebuild(void Function(QuoteBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  QuoteBuilder toBuilder() => QuoteBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is Quote &&
        id == other.id &&
        code == other.code &&
        accountId == other.accountId &&
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
        note == other.note &&
        status == other.status &&
        createdAt == other.createdAt &&
        offer == other.offer &&
        messages == other.messages &&
        history == other.history;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, accountId.hashCode);
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
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, offer.hashCode);
    _$hash = $jc(_$hash, messages.hashCode);
    _$hash = $jc(_$hash, history.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'Quote')
          ..add('id', id)
          ..add('code', code)
          ..add('accountId', accountId)
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
          ..add('note', note)
          ..add('status', status)
          ..add('createdAt', createdAt)
          ..add('offer', offer)
          ..add('messages', messages)
          ..add('history', history))
        .toString();
  }
}

class QuoteBuilder implements Builder<Quote, QuoteBuilder> {
  _$Quote? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  String? _accountId;
  String? get accountId => _$this._accountId;
  set accountId(String? accountId) => _$this._accountId = accountId;

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

  ListBuilder<QuoteItem>? _items;
  ListBuilder<QuoteItem> get items =>
      _$this._items ??= ListBuilder<QuoteItem>();
  set items(ListBuilder<QuoteItem>? items) => _$this._items = items;

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

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  QuoteOfferBuilder? _offer;
  QuoteOfferBuilder get offer => _$this._offer ??= QuoteOfferBuilder();
  set offer(QuoteOfferBuilder? offer) => _$this._offer = offer;

  ListBuilder<QuoteMessage>? _messages;
  ListBuilder<QuoteMessage> get messages =>
      _$this._messages ??= ListBuilder<QuoteMessage>();
  set messages(ListBuilder<QuoteMessage>? messages) =>
      _$this._messages = messages;

  ListBuilder<QuoteEvent>? _history;
  ListBuilder<QuoteEvent> get history =>
      _$this._history ??= ListBuilder<QuoteEvent>();
  set history(ListBuilder<QuoteEvent>? history) => _$this._history = history;

  QuoteBuilder() {
    Quote._defaults(this);
  }

  QuoteBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _code = $v.code;
      _accountId = $v.accountId;
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
      _status = $v.status;
      _createdAt = $v.createdAt;
      _offer = $v.offer?.toBuilder();
      _messages = $v.messages.toBuilder();
      _history = $v.history.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(Quote other) {
    _$v = other as _$Quote;
  }

  @override
  void update(void Function(QuoteBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  Quote build() => _build();

  _$Quote _build() {
    _$Quote _$result;
    try {
      _$result = _$v ??
          _$Quote._(
            id: BuiltValueNullFieldError.checkNotNull(id, r'Quote', 'id'),
            code: BuiltValueNullFieldError.checkNotNull(code, r'Quote', 'code'),
            accountId: accountId,
            company: BuiltValueNullFieldError.checkNotNull(
                company, r'Quote', 'company'),
            contactName: BuiltValueNullFieldError.checkNotNull(
                contactName, r'Quote', 'contactName'),
            email:
                BuiltValueNullFieldError.checkNotNull(email, r'Quote', 'email'),
            phone: phone,
            taxNumber: taxNumber,
            items: items.build(),
            personalization: BuiltValueNullFieldError.checkNotNull(
                personalization, r'Quote', 'personalization'),
            personalizationNote: personalizationNote,
            desiredDate: desiredDate,
            purpose: purpose,
            note: note,
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'Quote', 'status'),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'Quote', 'createdAt'),
            offer: _offer?.build(),
            messages: messages.build(),
            history: history.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();

        _$failedField = 'offer';
        _offer?.build();
        _$failedField = 'messages';
        messages.build();
        _$failedField = 'history';
        history.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(r'Quote', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
