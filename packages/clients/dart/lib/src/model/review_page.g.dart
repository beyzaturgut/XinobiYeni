// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'review_page.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReviewPage extends ReviewPage {
  @override
  final ReviewSummary summary;
  @override
  final BuiltList<PublicReview> items;
  @override
  final int page;
  @override
  final int pageSize;

  factory _$ReviewPage([void Function(ReviewPageBuilder)? updates]) =>
      (ReviewPageBuilder()..update(updates))._build();

  _$ReviewPage._(
      {required this.summary,
      required this.items,
      required this.page,
      required this.pageSize})
      : super._();
  @override
  ReviewPage rebuild(void Function(ReviewPageBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ReviewPageBuilder toBuilder() => ReviewPageBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReviewPage &&
        summary == other.summary &&
        items == other.items &&
        page == other.page &&
        pageSize == other.pageSize;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, summary.hashCode);
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, page.hashCode);
    _$hash = $jc(_$hash, pageSize.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReviewPage')
          ..add('summary', summary)
          ..add('items', items)
          ..add('page', page)
          ..add('pageSize', pageSize))
        .toString();
  }
}

class ReviewPageBuilder implements Builder<ReviewPage, ReviewPageBuilder> {
  _$ReviewPage? _$v;

  ReviewSummaryBuilder? _summary;
  ReviewSummaryBuilder get summary =>
      _$this._summary ??= ReviewSummaryBuilder();
  set summary(ReviewSummaryBuilder? summary) => _$this._summary = summary;

  ListBuilder<PublicReview>? _items;
  ListBuilder<PublicReview> get items =>
      _$this._items ??= ListBuilder<PublicReview>();
  set items(ListBuilder<PublicReview>? items) => _$this._items = items;

  int? _page;
  int? get page => _$this._page;
  set page(int? page) => _$this._page = page;

  int? _pageSize;
  int? get pageSize => _$this._pageSize;
  set pageSize(int? pageSize) => _$this._pageSize = pageSize;

  ReviewPageBuilder() {
    ReviewPage._defaults(this);
  }

  ReviewPageBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _summary = $v.summary.toBuilder();
      _items = $v.items.toBuilder();
      _page = $v.page;
      _pageSize = $v.pageSize;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReviewPage other) {
    _$v = other as _$ReviewPage;
  }

  @override
  void update(void Function(ReviewPageBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReviewPage build() => _build();

  _$ReviewPage _build() {
    _$ReviewPage _$result;
    try {
      _$result = _$v ??
          _$ReviewPage._(
            summary: summary.build(),
            items: items.build(),
            page: BuiltValueNullFieldError.checkNotNull(
                page, r'ReviewPage', 'page'),
            pageSize: BuiltValueNullFieldError.checkNotNull(
                pageSize, r'ReviewPage', 'pageSize'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'summary';
        summary.build();
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ReviewPage', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
