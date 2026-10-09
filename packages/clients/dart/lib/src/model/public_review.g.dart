// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'public_review.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$PublicReview extends PublicReview {
  @override
  final String id;
  @override
  final String authorName;
  @override
  final int rating;
  @override
  final String? title;
  @override
  final String body;
  @override
  final String? color;
  @override
  final DateTime createdAt;
  @override
  final String? storeReply;

  factory _$PublicReview([void Function(PublicReviewBuilder)? updates]) =>
      (PublicReviewBuilder()..update(updates))._build();

  _$PublicReview._(
      {required this.id,
      required this.authorName,
      required this.rating,
      this.title,
      required this.body,
      this.color,
      required this.createdAt,
      this.storeReply})
      : super._();
  @override
  PublicReview rebuild(void Function(PublicReviewBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  PublicReviewBuilder toBuilder() => PublicReviewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is PublicReview &&
        id == other.id &&
        authorName == other.authorName &&
        rating == other.rating &&
        title == other.title &&
        body == other.body &&
        color == other.color &&
        createdAt == other.createdAt &&
        storeReply == other.storeReply;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, authorName.hashCode);
    _$hash = $jc(_$hash, rating.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, body.hashCode);
    _$hash = $jc(_$hash, color.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, storeReply.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'PublicReview')
          ..add('id', id)
          ..add('authorName', authorName)
          ..add('rating', rating)
          ..add('title', title)
          ..add('body', body)
          ..add('color', color)
          ..add('createdAt', createdAt)
          ..add('storeReply', storeReply))
        .toString();
  }
}

class PublicReviewBuilder
    implements Builder<PublicReview, PublicReviewBuilder> {
  _$PublicReview? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _authorName;
  String? get authorName => _$this._authorName;
  set authorName(String? authorName) => _$this._authorName = authorName;

  int? _rating;
  int? get rating => _$this._rating;
  set rating(int? rating) => _$this._rating = rating;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  String? _body;
  String? get body => _$this._body;
  set body(String? body) => _$this._body = body;

  String? _color;
  String? get color => _$this._color;
  set color(String? color) => _$this._color = color;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  String? _storeReply;
  String? get storeReply => _$this._storeReply;
  set storeReply(String? storeReply) => _$this._storeReply = storeReply;

  PublicReviewBuilder() {
    PublicReview._defaults(this);
  }

  PublicReviewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _authorName = $v.authorName;
      _rating = $v.rating;
      _title = $v.title;
      _body = $v.body;
      _color = $v.color;
      _createdAt = $v.createdAt;
      _storeReply = $v.storeReply;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(PublicReview other) {
    _$v = other as _$PublicReview;
  }

  @override
  void update(void Function(PublicReviewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  PublicReview build() => _build();

  _$PublicReview _build() {
    final _$result = _$v ??
        _$PublicReview._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'PublicReview', 'id'),
          authorName: BuiltValueNullFieldError.checkNotNull(
              authorName, r'PublicReview', 'authorName'),
          rating: BuiltValueNullFieldError.checkNotNull(
              rating, r'PublicReview', 'rating'),
          title: title,
          body: BuiltValueNullFieldError.checkNotNull(
              body, r'PublicReview', 'body'),
          color: color,
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'PublicReview', 'createdAt'),
          storeReply: storeReply,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
