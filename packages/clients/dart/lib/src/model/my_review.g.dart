// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'my_review.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$MyReview extends MyReview {
  @override
  final String id;
  @override
  final String productId;
  @override
  final int rating;
  @override
  final String? title;
  @override
  final String body;
  @override
  final String status;
  @override
  final DateTime createdAt;
  @override
  final String? moderationNote;

  factory _$MyReview([void Function(MyReviewBuilder)? updates]) =>
      (MyReviewBuilder()..update(updates))._build();

  _$MyReview._(
      {required this.id,
      required this.productId,
      required this.rating,
      this.title,
      required this.body,
      required this.status,
      required this.createdAt,
      this.moderationNote})
      : super._();
  @override
  MyReview rebuild(void Function(MyReviewBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  MyReviewBuilder toBuilder() => MyReviewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is MyReview &&
        id == other.id &&
        productId == other.productId &&
        rating == other.rating &&
        title == other.title &&
        body == other.body &&
        status == other.status &&
        createdAt == other.createdAt &&
        moderationNote == other.moderationNote;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, rating.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, body.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, moderationNote.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'MyReview')
          ..add('id', id)
          ..add('productId', productId)
          ..add('rating', rating)
          ..add('title', title)
          ..add('body', body)
          ..add('status', status)
          ..add('createdAt', createdAt)
          ..add('moderationNote', moderationNote))
        .toString();
  }
}

class MyReviewBuilder implements Builder<MyReview, MyReviewBuilder> {
  _$MyReview? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  int? _rating;
  int? get rating => _$this._rating;
  set rating(int? rating) => _$this._rating = rating;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  String? _body;
  String? get body => _$this._body;
  set body(String? body) => _$this._body = body;

  String? _status;
  String? get status => _$this._status;
  set status(String? status) => _$this._status = status;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  String? _moderationNote;
  String? get moderationNote => _$this._moderationNote;
  set moderationNote(String? moderationNote) =>
      _$this._moderationNote = moderationNote;

  MyReviewBuilder() {
    MyReview._defaults(this);
  }

  MyReviewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _productId = $v.productId;
      _rating = $v.rating;
      _title = $v.title;
      _body = $v.body;
      _status = $v.status;
      _createdAt = $v.createdAt;
      _moderationNote = $v.moderationNote;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(MyReview other) {
    _$v = other as _$MyReview;
  }

  @override
  void update(void Function(MyReviewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  MyReview build() => _build();

  _$MyReview _build() {
    final _$result = _$v ??
        _$MyReview._(
          id: BuiltValueNullFieldError.checkNotNull(id, r'MyReview', 'id'),
          productId: BuiltValueNullFieldError.checkNotNull(
              productId, r'MyReview', 'productId'),
          rating: BuiltValueNullFieldError.checkNotNull(
              rating, r'MyReview', 'rating'),
          title: title,
          body:
              BuiltValueNullFieldError.checkNotNull(body, r'MyReview', 'body'),
          status: BuiltValueNullFieldError.checkNotNull(
              status, r'MyReview', 'status'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'MyReview', 'createdAt'),
          moderationNote: moderationNote,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
