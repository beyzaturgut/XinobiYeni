// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'save_design_from_session.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SaveDesignFromSession extends SaveDesignFromSession {
  @override
  final String sessionId;
  @override
  final String? name;

  factory _$SaveDesignFromSession(
          [void Function(SaveDesignFromSessionBuilder)? updates]) =>
      (SaveDesignFromSessionBuilder()..update(updates))._build();

  _$SaveDesignFromSession._({required this.sessionId, this.name}) : super._();
  @override
  SaveDesignFromSession rebuild(
          void Function(SaveDesignFromSessionBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SaveDesignFromSessionBuilder toBuilder() =>
      SaveDesignFromSessionBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SaveDesignFromSession &&
        sessionId == other.sessionId &&
        name == other.name;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, sessionId.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'SaveDesignFromSession')
          ..add('sessionId', sessionId)
          ..add('name', name))
        .toString();
  }
}

class SaveDesignFromSessionBuilder
    implements Builder<SaveDesignFromSession, SaveDesignFromSessionBuilder> {
  _$SaveDesignFromSession? _$v;

  String? _sessionId;
  String? get sessionId => _$this._sessionId;
  set sessionId(String? sessionId) => _$this._sessionId = sessionId;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  SaveDesignFromSessionBuilder() {
    SaveDesignFromSession._defaults(this);
  }

  SaveDesignFromSessionBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _sessionId = $v.sessionId;
      _name = $v.name;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SaveDesignFromSession other) {
    _$v = other as _$SaveDesignFromSession;
  }

  @override
  void update(void Function(SaveDesignFromSessionBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SaveDesignFromSession build() => _build();

  _$SaveDesignFromSession _build() {
    final _$result = _$v ??
        _$SaveDesignFromSession._(
          sessionId: BuiltValueNullFieldError.checkNotNull(
              sessionId, r'SaveDesignFromSession', 'sessionId'),
          name: name,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
