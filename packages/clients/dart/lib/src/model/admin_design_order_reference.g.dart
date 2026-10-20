// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_design_order_reference.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminDesignOrderReference extends AdminDesignOrderReference {
  @override
  final String id;
  @override
  final String number;
  @override
  final DateTime createdAt;

  factory _$AdminDesignOrderReference(
          [void Function(AdminDesignOrderReferenceBuilder)? updates]) =>
      (AdminDesignOrderReferenceBuilder()..update(updates))._build();

  _$AdminDesignOrderReference._(
      {required this.id, required this.number, required this.createdAt})
      : super._();
  @override
  AdminDesignOrderReference rebuild(
          void Function(AdminDesignOrderReferenceBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminDesignOrderReferenceBuilder toBuilder() =>
      AdminDesignOrderReferenceBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminDesignOrderReference &&
        id == other.id &&
        number == other.number &&
        createdAt == other.createdAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, number.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminDesignOrderReference')
          ..add('id', id)
          ..add('number', number)
          ..add('createdAt', createdAt))
        .toString();
  }
}

class AdminDesignOrderReferenceBuilder
    implements
        Builder<AdminDesignOrderReference, AdminDesignOrderReferenceBuilder> {
  _$AdminDesignOrderReference? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _number;
  String? get number => _$this._number;
  set number(String? number) => _$this._number = number;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  AdminDesignOrderReferenceBuilder() {
    AdminDesignOrderReference._defaults(this);
  }

  AdminDesignOrderReferenceBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _number = $v.number;
      _createdAt = $v.createdAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminDesignOrderReference other) {
    _$v = other as _$AdminDesignOrderReference;
  }

  @override
  void update(void Function(AdminDesignOrderReferenceBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminDesignOrderReference build() => _build();

  _$AdminDesignOrderReference _build() {
    final _$result = _$v ??
        _$AdminDesignOrderReference._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'AdminDesignOrderReference', 'id'),
          number: BuiltValueNullFieldError.checkNotNull(
              number, r'AdminDesignOrderReference', 'number'),
          createdAt: BuiltValueNullFieldError.checkNotNull(
              createdAt, r'AdminDesignOrderReference', 'createdAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
