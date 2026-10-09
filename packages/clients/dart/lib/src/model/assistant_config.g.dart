// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'assistant_config.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AssistantConfig extends AssistantConfig {
  @override
  final bool enabled;
  @override
  final bool aiAnswers;
  @override
  final String greeting;
  @override
  final BuiltList<String> quickReplies;
  @override
  final bool whatsAppAvailable;
  @override
  final String disclaimer;

  factory _$AssistantConfig([void Function(AssistantConfigBuilder)? updates]) =>
      (AssistantConfigBuilder()..update(updates))._build();

  _$AssistantConfig._(
      {required this.enabled,
      required this.aiAnswers,
      required this.greeting,
      required this.quickReplies,
      required this.whatsAppAvailable,
      required this.disclaimer})
      : super._();
  @override
  AssistantConfig rebuild(void Function(AssistantConfigBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AssistantConfigBuilder toBuilder() => AssistantConfigBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AssistantConfig &&
        enabled == other.enabled &&
        aiAnswers == other.aiAnswers &&
        greeting == other.greeting &&
        quickReplies == other.quickReplies &&
        whatsAppAvailable == other.whatsAppAvailable &&
        disclaimer == other.disclaimer;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, enabled.hashCode);
    _$hash = $jc(_$hash, aiAnswers.hashCode);
    _$hash = $jc(_$hash, greeting.hashCode);
    _$hash = $jc(_$hash, quickReplies.hashCode);
    _$hash = $jc(_$hash, whatsAppAvailable.hashCode);
    _$hash = $jc(_$hash, disclaimer.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'AssistantConfig')
          ..add('enabled', enabled)
          ..add('aiAnswers', aiAnswers)
          ..add('greeting', greeting)
          ..add('quickReplies', quickReplies)
          ..add('whatsAppAvailable', whatsAppAvailable)
          ..add('disclaimer', disclaimer))
        .toString();
  }
}

class AssistantConfigBuilder
    implements Builder<AssistantConfig, AssistantConfigBuilder> {
  _$AssistantConfig? _$v;

  bool? _enabled;
  bool? get enabled => _$this._enabled;
  set enabled(bool? enabled) => _$this._enabled = enabled;

  bool? _aiAnswers;
  bool? get aiAnswers => _$this._aiAnswers;
  set aiAnswers(bool? aiAnswers) => _$this._aiAnswers = aiAnswers;

  String? _greeting;
  String? get greeting => _$this._greeting;
  set greeting(String? greeting) => _$this._greeting = greeting;

  ListBuilder<String>? _quickReplies;
  ListBuilder<String> get quickReplies =>
      _$this._quickReplies ??= ListBuilder<String>();
  set quickReplies(ListBuilder<String>? quickReplies) =>
      _$this._quickReplies = quickReplies;

  bool? _whatsAppAvailable;
  bool? get whatsAppAvailable => _$this._whatsAppAvailable;
  set whatsAppAvailable(bool? whatsAppAvailable) =>
      _$this._whatsAppAvailable = whatsAppAvailable;

  String? _disclaimer;
  String? get disclaimer => _$this._disclaimer;
  set disclaimer(String? disclaimer) => _$this._disclaimer = disclaimer;

  AssistantConfigBuilder() {
    AssistantConfig._defaults(this);
  }

  AssistantConfigBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _enabled = $v.enabled;
      _aiAnswers = $v.aiAnswers;
      _greeting = $v.greeting;
      _quickReplies = $v.quickReplies.toBuilder();
      _whatsAppAvailable = $v.whatsAppAvailable;
      _disclaimer = $v.disclaimer;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AssistantConfig other) {
    _$v = other as _$AssistantConfig;
  }

  @override
  void update(void Function(AssistantConfigBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AssistantConfig build() => _build();

  _$AssistantConfig _build() {
    _$AssistantConfig _$result;
    try {
      _$result = _$v ??
          _$AssistantConfig._(
            enabled: BuiltValueNullFieldError.checkNotNull(
                enabled, r'AssistantConfig', 'enabled'),
            aiAnswers: BuiltValueNullFieldError.checkNotNull(
                aiAnswers, r'AssistantConfig', 'aiAnswers'),
            greeting: BuiltValueNullFieldError.checkNotNull(
                greeting, r'AssistantConfig', 'greeting'),
            quickReplies: quickReplies.build(),
            whatsAppAvailable: BuiltValueNullFieldError.checkNotNull(
                whatsAppAvailable, r'AssistantConfig', 'whatsAppAvailable'),
            disclaimer: BuiltValueNullFieldError.checkNotNull(
                disclaimer, r'AssistantConfig', 'disclaimer'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'quickReplies';
        quickReplies.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AssistantConfig', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
