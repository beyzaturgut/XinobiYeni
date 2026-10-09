// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'submit_review.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SubmitReview extends SubmitReview {
  @override
  final String productId;
  @override
  final int rating;
  @override
  final String? title;
  @override
  final String body;

  factory _$SubmitReview([void Function(SubmitReviewBuilder)? updates]) =>
      (SubmitReviewBuilder()..update(updates))._build();

  _$SubmitReview._(
      {required this.productId,
      required this.rating,
      this.title,
      required this.body})
      : super._();
  @override
  SubmitReview rebuild(void Function(SubmitReviewBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SubmitReviewBuilder toBuilder() => SubmitReviewBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SubmitReview &&
        productId == other.productId &&
        rating == other.rating &&
        title == other.title &&
        body == other.body;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, rating.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, body.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SubmitReview')
          ..add('productId', productId)
          ..add('rating', rating)
          ..add('title', title)
          ..add('body', body))
        .toString();
  }
}

class SubmitReviewBuilder
    implements Builder<SubmitReview, SubmitReviewBuilder> {
  _$SubmitReview? _$v;

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

  SubmitReviewBuilder() {
    SubmitReview._defaults(this);
  }

  SubmitReviewBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _rating = $v.rating;
      _title = $v.title;
      _body = $v.body;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SubmitReview other) {
    _$v = other as _$SubmitReview;
  }

  @override
  void update(void Function(SubmitReviewBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SubmitReview build() => _build();

  _$SubmitReview _build() {
    final _$result = _$v ??
        _$SubmitReview._(
          productId: BuiltValueNullFieldError.checkNotNull(
              productId, r'SubmitReview', 'productId'),
          rating: BuiltValueNullFieldError.checkNotNull(
              rating, r'SubmitReview', 'rating'),
          title: title,
          body: BuiltValueNullFieldError.checkNotNull(
              body, r'SubmitReview', 'body'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
