// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'order_design_file.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$OrderDesignFile extends OrderDesignFile {
  @override
  final String sha256;
  @override
  final String mime;
  @override
  final int bytes;

  factory _$OrderDesignFile([void Function(OrderDesignFileBuilder)? updates]) =>
      (OrderDesignFileBuilder()..update(updates))._build();

  _$OrderDesignFile._(
      {required this.sha256, required this.mime, required this.bytes})
      : super._();
  @override
  OrderDesignFile rebuild(void Function(OrderDesignFileBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  OrderDesignFileBuilder toBuilder() => OrderDesignFileBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is OrderDesignFile &&
        sha256 == other.sha256 &&
        mime == other.mime &&
        bytes == other.bytes;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, sha256.hashCode);
    _$hash = $jc(_$hash, mime.hashCode);
    _$hash = $jc(_$hash, bytes.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'OrderDesignFile')
          ..add('sha256', sha256)
          ..add('mime', mime)
          ..add('bytes', bytes))
        .toString();
  }
}

class OrderDesignFileBuilder
    implements Builder<OrderDesignFile, OrderDesignFileBuilder> {
  _$OrderDesignFile? _$v;

  String? _sha256;
  String? get sha256 => _$this._sha256;
  set sha256(String? sha256) => _$this._sha256 = sha256;

  String? _mime;
  String? get mime => _$this._mime;
  set mime(String? mime) => _$this._mime = mime;

  int? _bytes;
  int? get bytes => _$this._bytes;
  set bytes(int? bytes) => _$this._bytes = bytes;

  OrderDesignFileBuilder() {
    OrderDesignFile._defaults(this);
  }

  OrderDesignFileBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _sha256 = $v.sha256;
      _mime = $v.mime;
      _bytes = $v.bytes;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(OrderDesignFile other) {
    _$v = other as _$OrderDesignFile;
  }

  @override
  void update(void Function(OrderDesignFileBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  OrderDesignFile build() => _build();

  _$OrderDesignFile _build() {
    final _$result = _$v ??
        _$OrderDesignFile._(
          sha256: BuiltValueNullFieldError.checkNotNull(
              sha256, r'OrderDesignFile', 'sha256'),
          mime: BuiltValueNullFieldError.checkNotNull(
              mime, r'OrderDesignFile', 'mime'),
          bytes: BuiltValueNullFieldError.checkNotNull(
              bytes, r'OrderDesignFile', 'bytes'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
