// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'review_summary.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ReviewSummary extends ReviewSummary {
  @override
  final String productId;
  @override
  final double average;
  @override
  final int count;
  @override
  final BuiltList<int> distribution;

  factory _$ReviewSummary([void Function(ReviewSummaryBuilder)? updates]) =>
      (ReviewSummaryBuilder()..update(updates))._build();

  _$ReviewSummary._(
      {required this.productId,
      required this.average,
      required this.count,
      required this.distribution})
      : super._();
  @override
  ReviewSummary rebuild(void Function(ReviewSummaryBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ReviewSummaryBuilder toBuilder() => ReviewSummaryBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ReviewSummary &&
        productId == other.productId &&
        average == other.average &&
        count == other.count &&
        distribution == other.distribution;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, productId.hashCode);
    _$hash = $jc(_$hash, average.hashCode);
    _$hash = $jc(_$hash, count.hashCode);
    _$hash = $jc(_$hash, distribution.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ReviewSummary')
          ..add('productId', productId)
          ..add('average', average)
          ..add('count', count)
          ..add('distribution', distribution))
        .toString();
  }
}

class ReviewSummaryBuilder
    implements Builder<ReviewSummary, ReviewSummaryBuilder> {
  _$ReviewSummary? _$v;

  String? _productId;
  String? get productId => _$this._productId;
  set productId(String? productId) => _$this._productId = productId;

  double? _average;
  double? get average => _$this._average;
  set average(double? average) => _$this._average = average;

  int? _count;
  int? get count => _$this._count;
  set count(int? count) => _$this._count = count;

  ListBuilder<int>? _distribution;
  ListBuilder<int> get distribution =>
      _$this._distribution ??= ListBuilder<int>();
  set distribution(ListBuilder<int>? distribution) =>
      _$this._distribution = distribution;

  ReviewSummaryBuilder() {
    ReviewSummary._defaults(this);
  }

  ReviewSummaryBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _productId = $v.productId;
      _average = $v.average;
      _count = $v.count;
      _distribution = $v.distribution.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ReviewSummary other) {
    _$v = other as _$ReviewSummary;
  }

  @override
  void update(void Function(ReviewSummaryBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ReviewSummary build() => _build();

  _$ReviewSummary _build() {
    _$ReviewSummary _$result;
    try {
      _$result = _$v ??
          _$ReviewSummary._(
            productId: BuiltValueNullFieldError.checkNotNull(
                productId, r'ReviewSummary', 'productId'),
            average: BuiltValueNullFieldError.checkNotNull(
                average, r'ReviewSummary', 'average'),
            count: BuiltValueNullFieldError.checkNotNull(
                count, r'ReviewSummary', 'count'),
            distribution: distribution.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'distribution';
        distribution.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ReviewSummary', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
