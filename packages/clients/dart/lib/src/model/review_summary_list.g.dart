// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'review_summary_list.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReviewSummaryList extends ReviewSummaryList {
  @override
  final BuiltList<ReviewSummary> items;

  factory _$ReviewSummaryList(
          [void Function(ReviewSummaryListBuilder)? updates]) =>
      (ReviewSummaryListBuilder()..update(updates))._build();

  _$ReviewSummaryList._({required this.items}) : super._();
  @override
  ReviewSummaryList rebuild(void Function(ReviewSummaryListBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ReviewSummaryListBuilder toBuilder() =>
      ReviewSummaryListBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReviewSummaryList && items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReviewSummaryList')
          ..add('items', items))
        .toString();
  }
}

class ReviewSummaryListBuilder
    implements Builder<ReviewSummaryList, ReviewSummaryListBuilder> {
  _$ReviewSummaryList? _$v;

  ListBuilder<ReviewSummary>? _items;
  ListBuilder<ReviewSummary> get items =>
      _$this._items ??= ListBuilder<ReviewSummary>();
  set items(ListBuilder<ReviewSummary>? items) => _$this._items = items;

  ReviewSummaryListBuilder() {
    ReviewSummaryList._defaults(this);
  }

  ReviewSummaryListBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReviewSummaryList other) {
    _$v = other as _$ReviewSummaryList;
  }

  @override
  void update(void Function(ReviewSummaryListBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReviewSummaryList build() => _build();

  _$ReviewSummaryList _build() {
    _$ReviewSummaryList _$result;
    try {
      _$result = _$v ??
          _$ReviewSummaryList._(
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ReviewSummaryList', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
