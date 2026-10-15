// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'create_admin_invitation.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$CreateAdminInvitation extends CreateAdminInvitation {
  @override
  final String email;

  factory _$CreateAdminInvitation(
          [void Function(CreateAdminInvitationBuilder)? updates]) =>
      (CreateAdminInvitationBuilder()..update(updates))._build();

  _$CreateAdminInvitation._({required this.email}) : super._();
  @override
  CreateAdminInvitation rebuild(
          void Function(CreateAdminInvitationBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  CreateAdminInvitationBuilder toBuilder() =>
      CreateAdminInvitationBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is CreateAdminInvitation && email == other.email;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, email.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'CreateAdminInvitation')
          ..add('email', email))
        .toString();
  }
}

class CreateAdminInvitationBuilder
    implements Builder<CreateAdminInvitation, CreateAdminInvitationBuilder> {
  _$CreateAdminInvitation? _$v;

  String? _email;
  String? get email => _$this._email;
  set email(String? email) => _$this._email = email;

  CreateAdminInvitationBuilder() {
    CreateAdminInvitation._defaults(this);
  }

  CreateAdminInvitationBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _email = $v.email;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(CreateAdminInvitation other) {
    _$v = other as _$CreateAdminInvitation;
  }

  @override
  void update(void Function(CreateAdminInvitationBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  CreateAdminInvitation build() => _build();

  _$CreateAdminInvitation _build() {
    final _$result = _$v ??
        _$CreateAdminInvitation._(
          email: BuiltValueNullFieldError.checkNotNull(
              email, r'CreateAdminInvitation', 'email'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
