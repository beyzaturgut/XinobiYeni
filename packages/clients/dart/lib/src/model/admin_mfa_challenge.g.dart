// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_mfa_challenge.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminMfaChallenge extends AdminMfaChallenge {
  @override
  final String challengeId;
  @override
  final DateTime expiresAt;
  @override
  final String? previewCode;

  factory _$AdminMfaChallenge(
          [void Function(AdminMfaChallengeBuilder)? updates]) =>
      (AdminMfaChallengeBuilder()..update(updates))._build();

  _$AdminMfaChallenge._(
      {required this.challengeId, required this.expiresAt, this.previewCode})
      : super._();
  @override
  AdminMfaChallenge rebuild(void Function(AdminMfaChallengeBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminMfaChallengeBuilder toBuilder() =>
      AdminMfaChallengeBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminMfaChallenge &&
        challengeId == other.challengeId &&
        expiresAt == other.expiresAt &&
        previewCode == other.previewCode;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, challengeId.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, previewCode.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminMfaChallenge')
          ..add('challengeId', challengeId)
          ..add('expiresAt', expiresAt)
          ..add('previewCode', previewCode))
        .toString();
  }
}

class AdminMfaChallengeBuilder
    implements Builder<AdminMfaChallenge, AdminMfaChallengeBuilder> {
  _$AdminMfaChallenge? _$v;

  String? _challengeId;
  String? get challengeId => _$this._challengeId;
  set challengeId(String? challengeId) => _$this._challengeId = challengeId;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  String? _previewCode;
  String? get previewCode => _$this._previewCode;
  set previewCode(String? previewCode) => _$this._previewCode = previewCode;

  AdminMfaChallengeBuilder() {
    AdminMfaChallenge._defaults(this);
  }

  AdminMfaChallengeBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _challengeId = $v.challengeId;
      _expiresAt = $v.expiresAt;
      _previewCode = $v.previewCode;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminMfaChallenge other) {
    _$v = other as _$AdminMfaChallenge;
  }

  @override
  void update(void Function(AdminMfaChallengeBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminMfaChallenge build() => _build();

  _$AdminMfaChallenge _build() {
    final _$result = _$v ??
        _$AdminMfaChallenge._(
          challengeId: BuiltValueNullFieldError.checkNotNull(
              challengeId, r'AdminMfaChallenge', 'challengeId'),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
              expiresAt, r'AdminMfaChallenge', 'expiresAt'),
          previewCode: previewCode,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
