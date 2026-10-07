// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'xinobi_u_session.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$XinobiUSession extends XinobiUSession {
  @override
  final String id;
  @override
  final String status;
  @override
  final DateTime expiresAt;
  @override
  final XinobiUProduct product;
  @override
  final XinobiUVariant variant;
  @override
  final String questionBankVersion;
  @override
  final BuiltList<XinobiUQuestion> questions;
  @override
  final BuiltList<XinobiUAnswer> answers;
  @override
  final String? imageUrl;
  @override
  final String? errorCode;
  @override
  final String? errorMessage;

  factory _$XinobiUSession([void Function(XinobiUSessionBuilder)? updates]) =>
      (XinobiUSessionBuilder()..update(updates))._build();

  _$XinobiUSession._(
      {required this.id,
      required this.status,
      required this.expiresAt,
      required this.product,
      required this.variant,
      required this.questionBankVersion,
      required this.questions,
      required this.answers,
      this.imageUrl,
      this.errorCode,
      this.errorMessage})
      : super._();
  @override
  XinobiUSession rebuild(void Function(XinobiUSessionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  XinobiUSessionBuilder toBuilder() => XinobiUSessionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is XinobiUSession &&
        id == other.id &&
        status == other.status &&
        expiresAt == other.expiresAt &&
        product == other.product &&
        variant == other.variant &&
        questionBankVersion == other.questionBankVersion &&
        questions == other.questions &&
        answers == other.answers &&
        imageUrl == other.imageUrl &&
        errorCode == other.errorCode &&
        errorMessage == other.errorMessage;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, product.hashCode);
    _$hash = $jc(_$hash, variant.hashCode);
    _$hash = $jc(_$hash, questionBankVersion.hashCode);
    _$hash = $jc(_$hash, questions.hashCode);
    _$hash = $jc(_$hash, answers.hashCode);
    _$hash = $jc(_$hash, imageUrl.hashCode);
    _$hash = $jc(_$hash, errorCode.hashCode);
    _$hash = $jc(_$hash, errorMessage.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'XinobiUSession')
          ..add('id', id)
          ..add('status', status)
          ..add('expiresAt', expiresAt)
          ..add('product', product)
          ..add('variant', variant)
          ..add('questionBankVersion', questionBankVersion)
          ..add('questions', questions)
          ..add('answers', answers)
          ..add('imageUrl', imageUrl)
          ..add('errorCode', errorCode)
          ..add('errorMessage', errorMessage))
        .toString();
  }
}

class XinobiUSessionBuilder
    implements Builder<XinobiUSession, XinobiUSessionBuilder> {
  _$XinobiUSession? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  XinobiUProductBuilder? _product;
  XinobiUProductBuilder get product =>
      _$this._product ??= XinobiUProductBuilder();
  set product(XinobiUProductBuilder? product) => _$this._product = product;

  XinobiUVariantBuilder? _variant;
  XinobiUVariantBuilder get variant =>
      _$this._variant ??= XinobiUVariantBuilder();
  set variant(XinobiUVariantBuilder? variant) => _$this._variant = variant;

  String? _questionBankVersion;
  String? get questionBankVersion => _$this._questionBankVersion;
  set questionBankVersion(String? questionBankVersion) =>
      _$this._questionBankVersion = questionBankVersion;

  ListBuilder<XinobiUQuestion>? _questions;
  ListBuilder<XinobiUQuestion> get questions =>
      _$this._questions ??= ListBuilder<XinobiUQuestion>();
  set questions(ListBuilder<XinobiUQuestion>? questions) =>
      _$this._questions = questions;

  ListBuilder<XinobiUAnswer>? _answers;
  ListBuilder<XinobiUAnswer> get answers =>
      _$this._answers ??= ListBuilder<XinobiUAnswer>();
  set answers(ListBuilder<XinobiUAnswer>? answers) => _$this._answers = answers;

  String? _imageUrl;
  String? get imageUrl => _$this._imageUrl;
  set imageUrl(String? imageUrl) => _$this._imageUrl = imageUrl;

  String? _errorCode;
  String? get errorCode => _$this._errorCode;
  set errorCode(String? errorCode) => _$this._errorCode = errorCode;

  String? _errorMessage;
  String? get errorMessage => _$this._errorMessage;
  set errorMessage(String? errorMessage) => _$this._errorMessage = errorMessage;

  XinobiUSessionBuilder() {
    XinobiUSession._defaults(this);
  }

  XinobiUSessionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _status = $v.status;
      _expiresAt = $v.expiresAt;
      _product = $v.product.toBuilder();
      _variant = $v.variant.toBuilder();
      _questionBankVersion = $v.questionBankVersion;
      _questions = $v.questions.toBuilder();
      _answers = $v.answers.toBuilder();
      _imageUrl = $v.imageUrl;
      _errorCode = $v.errorCode;
      _errorMessage = $v.errorMessage;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(XinobiUSession other) {
    _$v = other as _$XinobiUSession;
  }

  @override
  void update(void Function(XinobiUSessionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  XinobiUSession build() => _build();

  _$XinobiUSession _build() {
    _$XinobiUSession _$result;
    try {
      _$result = _$v ??
          _$XinobiUSession._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'XinobiUSession', 'id'),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'XinobiUSession', 'status'),
            expiresAt: BuiltValueNullFieldError.checkNotNull(
                expiresAt, r'XinobiUSession', 'expiresAt'),
            product: product.build(),
            variant: variant.build(),
            questionBankVersion: BuiltValueNullFieldError.checkNotNull(
                questionBankVersion, r'XinobiUSession', 'questionBankVersion'),
            questions: questions.build(),
            answers: answers.build(),
            imageUrl: imageUrl,
            errorCode: errorCode,
            errorMessage: errorMessage,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'product';
        product.build();
        _$failedField = 'variant';
        variant.build();

        _$failedField = 'questions';
        questions.build();
        _$failedField = 'answers';
        answers.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'XinobiUSession', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
