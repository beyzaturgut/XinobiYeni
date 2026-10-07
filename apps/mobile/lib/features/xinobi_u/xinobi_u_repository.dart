import 'dart:convert';
import 'dart:math';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../catalog/catalog_repository.dart';

/// XINOBI U contract (/api/v1/xinobi-u). Generation is a real, metered provider call on the server; the server makes it idempotent.
abstract interface class XinobiURepository {
  Future<XinobiUStatus> status();
  Future<XinobiUSession> createSession({required String productId, String? variantId});
  Future<XinobiUSession> session(String id);
  Future<XinobiUSession> generate(String id, Map<String, String> answers);
}

/// [code] is the API's stable problem code (e.g. `daily_limit`, `session_expired`); [message] is safe to show.
class XinobiUException implements Exception {
  const XinobiUException(this.code, this.message);
  final String code;
  final String message;
  bool get sessionGone => code == 'session_expired' || code == 'questionnaire_updated';
  @override
  String toString() => message;
}

class ApiXinobiURepository implements XinobiURepository {
  ApiXinobiURepository(XinobiApiClient client, this._clientId) : _api = client.getXinobiUApi();

  final XinobiUApi _api;
  final Future<String> Function() _clientId;

  @override
  Future<XinobiUStatus> status() => _call(() => _api.getXinobiUStatus());

  @override
  Future<XinobiUSession> createSession({required String productId, String? variantId}) async {
    final clientId = await _clientId();
    return _call(() => _api.createXinobiUSession(
          createXinobiUSession: CreateXinobiUSession((b) => b
            ..productId = productId
            ..variantId = variantId
            ..clientId = clientId),
        ));
  }

  @override
  Future<XinobiUSession> session(String id) => _call(() => _api.getXinobiUSession(id: id));

  @override
  Future<XinobiUSession> generate(String id, Map<String, String> answers) => _call(() => _api.startXinobiUGeneration(
        id: id,
        xinobiUGenerationRequest: XinobiUGenerationRequest((b) => b.answers.addAll(answers.entries.map((entry) => XinobiUAnswer((a) => a
          ..questionId = entry.key
          ..optionId = entry.value)))),
      ));

  Future<T> _call<T>(Future<Response<T>> Function() request) async {
    try {
      final data = (await request()).data;
      if (data == null) throw const XinobiUException('empty_response', 'Beklenmeyen boş yanıt alındı.');
      return data;
    } on DioException catch (error) {
      final body = error.response?.data;
      final code = body is Map ? body['code']?.toString() : null;
      final title = body is Map ? body['title']?.toString() : null;
      if (code != null && title != null && title.isNotEmpty) throw XinobiUException(code, title);
      if (error.response?.statusCode == 503) throw const XinobiUException('xinobi_u_unavailable', 'XINOBI U şu anda kullanılamıyor.');
      if (error.response?.statusCode == 429) throw const XinobiUException('rate_limited', 'Çok sık işlem yapıldı. Biraz sonra tekrar deneyin.');
      throw const XinobiUException('network', 'Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    }
  }
}

/// Per-install state: a random client id (no personal data) and unfinished questionnaires so an app restart resumes them.
class XinobiULocalStore {
  XinobiULocalStore(this._prefs);
  final Future<SharedPreferences> _prefs;
  static const _clientKey = 'xinobi-u-client-id';

  Future<String> clientId() async {
    final prefs = await _prefs;
    final existing = prefs.getString(_clientKey);
    if (existing != null) return existing;
    final id = _uuidV4();
    await prefs.setString(_clientKey, id);
    return id;
  }

  // Keyed by what the user asked for; an empty variant means "server default".
  Future<String?> sessionFor(String productId, String? variantId) async => (await _prefs).getString('xinobi-u-session:$productId:${variantId ?? ''}');
  Future<void> rememberSession(String productId, String? variantId, String sessionId) async =>
      (await _prefs).setString('xinobi-u-session:$productId:${variantId ?? ''}', sessionId);
  Future<void> forgetSession(String productId, String? variantId) async => (await _prefs).remove('xinobi-u-session:$productId:${variantId ?? ''}');

  Future<Map<String, String>> answers(String sessionId) async {
    final raw = (await _prefs).getString('xinobi-u-answers:$sessionId');
    return raw == null ? {} : Map<String, String>.from(jsonDecode(raw) as Map);
  }

  Future<void> saveAnswers(String sessionId, Map<String, String> answers) async =>
      (await _prefs).setString('xinobi-u-answers:$sessionId', jsonEncode(answers));

  static String _uuidV4() {
    final random = Random.secure();
    final bytes = List<int>.generate(16, (_) => random.nextInt(256));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    final hex = bytes.map((b) => b.toRadixString(16).padLeft(2, '0')).join();
    return '${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}';
  }
}

final xinobiULocalStoreProvider = Provider<XinobiULocalStore>((ref) => XinobiULocalStore(SharedPreferences.getInstance()));
final xinobiURepositoryProvider =
    Provider<XinobiURepository>((ref) => ApiXinobiURepository(ref.watch(apiClientProvider), ref.watch(xinobiULocalStoreProvider).clientId));
