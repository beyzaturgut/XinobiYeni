// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_design_files.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderDesignFiles extends OrderDesignFiles {
  @override
  final OrderDesignFile pattern;
  @override
  final OrderDesignFile? productSource;
  @override
  final OrderDesignFile? composition;

  factory _$OrderDesignFiles(
          [void Function(OrderDesignFilesBuilder)? updates]) =>
      (OrderDesignFilesBuilder()..update(updates))._build();

  _$OrderDesignFiles._(
      {required this.pattern, this.productSource, this.composition})
      : super._();
  @override
  OrderDesignFiles rebuild(void Function(OrderDesignFilesBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderDesignFilesBuilder toBuilder() =>
      OrderDesignFilesBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderDesignFiles &&
        pattern == other.pattern &&
        productSource == other.productSource &&
        composition == other.composition;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, pattern.hashCode);
    _$hash = $jc(_$hash, productSource.hashCode);
    _$hash = $jc(_$hash, composition.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderDesignFiles')
          ..add('pattern', pattern)
          ..add('productSource', productSource)
          ..add('composition', composition))
        .toString();
  }
}

class OrderDesignFilesBuilder
    implements Builder<OrderDesignFiles, OrderDesignFilesBuilder> {
  _$OrderDesignFiles? _$v;

  OrderDesignFileBuilder? _pattern;
  OrderDesignFileBuilder get pattern =>
      _$this._pattern ??= OrderDesignFileBuilder();
  set pattern(OrderDesignFileBuilder? pattern) => _$this._pattern = pattern;

  OrderDesignFileBuilder? _productSource;
  OrderDesignFileBuilder get productSource =>
      _$this._productSource ??= OrderDesignFileBuilder();
  set productSource(OrderDesignFileBuilder? productSource) =>
      _$this._productSource = productSource;

  OrderDesignFileBuilder? _composition;
  OrderDesignFileBuilder get composition =>
      _$this._composition ??= OrderDesignFileBuilder();
  set composition(OrderDesignFileBuilder? composition) =>
      _$this._composition = composition;

  OrderDesignFilesBuilder() {
    OrderDesignFiles._defaults(this);
  }

  OrderDesignFilesBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _pattern = $v.pattern.toBuilder();
      _productSource = $v.productSource?.toBuilder();
      _composition = $v.composition?.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderDesignFiles other) {
    _$v = other as _$OrderDesignFiles;
  }

  @override
  void update(void Function(OrderDesignFilesBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderDesignFiles build() => _build();

  _$OrderDesignFiles _build() {
    _$OrderDesignFiles _$result;
    try {
      _$result = _$v ??
          _$OrderDesignFiles._(
            pattern: pattern.build(),
            productSource: _productSource?.build(),
            composition: _composition?.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'pattern';
        pattern.build();
        _$failedField = 'productSource';
        _productSource?.build();
        _$failedField = 'composition';
        _composition?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'OrderDesignFiles', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
