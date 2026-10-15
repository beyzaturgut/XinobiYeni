// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'admin_invitation_response.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AdminInvitationResponse extends AdminInvitationResponse {
  @override
  final String id;
  @override
  final String email;
  @override
  final DateTime expiresAt;
  @override
  final String? previewUrl;

  factory _$AdminInvitationResponse(
          [void Function(AdminInvitationResponseBuilder)? updates]) =>
      (AdminInvitationResponseBuilder()..update(updates))._build();

  _$AdminInvitationResponse._(
      {required this.id,
      required this.email,
      required this.expiresAt,
      this.previewUrl})
      : super._();
  @override
  AdminInvitationResponse rebuild(
          void Function(AdminInvitationResponseBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AdminInvitationResponseBuilder toBuilder() =>
      AdminInvitationResponseBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AdminInvitationResponse &&
        id == other.id &&
        email == other.email &&
        expiresAt == other.expiresAt &&
        previewUrl == other.previewUrl;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jc(_$hash, expiresAt.hashCode);
    _$hash = $jc(_$hash, previewUrl.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AdminInvitationResponse')
          ..add('id', id)
          ..add('email', email)
          ..add('expiresAt', expiresAt)
          ..add('previewUrl', previewUrl))
        .toString();
  }
}

class AdminInvitationResponseBuilder
    implements
        Builder<AdminInvitationResponse, AdminInvitationResponseBuilder> {
  _$AdminInvitationResponse? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  DateTime? _expiresAt;
  DateTime? get expiresAt => _$this._expiresAt;
  set expiresAt(DateTime? expiresAt) => _$this._expiresAt = expiresAt;

  String? _previewUrl;
  String? get previewUrl => _$this._previewUrl;
  set previewUrl(String? previewUrl) => _$this._previewUrl = previewUrl;

  AdminInvitationResponseBuilder() {
    AdminInvitationResponse._defaults(this);
  }

  AdminInvitationResponseBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _email = $v.email;
      _expiresAt = $v.expiresAt;
      _previewUrl = $v.previewUrl;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AdminInvitationResponse other) {
    _$v = other as _$AdminInvitationResponse;
  }

  @override
  void update(void Function(AdminInvitationResponseBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AdminInvitationResponse build() => _build();

  _$AdminInvitationResponse _build() {
    final _$result = _$v ??
        _$AdminInvitationResponse._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'AdminInvitationResponse', 'id'),
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'AdminInvitationResponse', 'email'),
          expiresAt: BuiltValueNullFieldError.checkNotNull(
              expiresAt, r'AdminInvitationResponse', 'expiresAt'),
          previewUrl: previewUrl,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
