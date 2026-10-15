// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'verify_admin_mfa.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$VerifyAdminMfa extends VerifyAdminMfa {
  @override
  final String challengeId;
  @override
  final String code;

  factory _$VerifyAdminMfa([void Function(VerifyAdminMfaBuilder)? updates]) =>
      (VerifyAdminMfaBuilder()..update(updates))._build();

  _$VerifyAdminMfa._({required this.challengeId, required this.code})
      : super._();
  @override
  VerifyAdminMfa rebuild(void Function(VerifyAdminMfaBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  VerifyAdminMfaBuilder toBuilder() => VerifyAdminMfaBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is VerifyAdminMfa &&
        challengeId == other.challengeId &&
        code == other.code;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, challengeId.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'VerifyAdminMfa')
          ..add('challengeId', challengeId)
          ..add('code', code))
        .toString();
  }
}

class VerifyAdminMfaBuilder
    implements Builder<VerifyAdminMfa, VerifyAdminMfaBuilder> {
  _$VerifyAdminMfa? _$v;

  String? _challengeId;
  String? get challengeId => _$this._challengeId;
  set challengeId(String? challengeId) => _$this._challengeId = challengeId;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  VerifyAdminMfaBuilder() {
    VerifyAdminMfa._defaults(this);
  }

  VerifyAdminMfaBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _challengeId = $v.challengeId;
      _code = $v.code;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(VerifyAdminMfa other) {
    _$v = other as _$VerifyAdminMfa;
  }

  @override
  void update(void Function(VerifyAdminMfaBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  VerifyAdminMfa build() => _build();

  _$VerifyAdminMfa _build() {
    final _$result = _$v ??
        _$VerifyAdminMfa._(
          challengeId: BuiltValueNullFieldError.checkNotNull(
              challengeId, r'VerifyAdminMfa', 'challengeId'),
          code: BuiltValueNullFieldError.checkNotNull(
              code, r'VerifyAdminMfa', 'code'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
