import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../account/auth.dart';
import '../cart/cart.dart';
import '../catalog/catalog_repository.dart';

/// First-party WebView commerce transport. The bearer token stays in the app.
/// It cannot proxy arbitrary URLs, authentication endpoints or account mutations.
class NativeCommerceBridge {
  NativeCommerceBridge(this.ref);
  final Ref ref;

  static bool allowed(String path, String method) {
    const id = r'[a-f0-9]{32}';
    if (method == 'GET') return path == '/me' || RegExp('^/me/(designs|design-configurations)(/$id(/image|/revisions/[1-9][0-9]*(/preview)?)?)?\$').hasMatch(path);
    if (method == 'POST') return path == '/me/designs' || path == '/me/designs/upload' || RegExp('^/me/designs/$id/configurations\$').hasMatch(path);
    return method == 'PUT' && RegExp('^/me/design-configurations/$id/(favorite|revisions/[1-9][0-9]*/preview)\$').hasMatch(path);
  }

  Future<Map<String, dynamic>> account(Map<String, dynamic> payload) async {
    final path = payload['path'], method = payload['method'];
    if (path is! String || method is! String || !allowed(path, method)) throw const CartException('Bu işlem önizleme bağlantısından yapılamaz.');
    await ref.read(authProvider.notifier).ready;
    final response = await ref.read(authProvider.notifier).withSession((_, token) async {
      Object? data = payload['body'];
      if (data is String) data = jsonDecode(data);
      if (data is Map && data['form'] is Map) {
        data = FormData.fromMap({for (final entry in (data['form'] as Map).entries)
          entry.key as String: entry.value is Map ? MultipartFile.fromBytes(base64Decode(entry.value['base64'] as String), filename: entry.value['name'] as String) : entry.value});
      }
      try {
        return await ref.read(apiClientProvider).dio.request<Object?>('/api/v1$path', data: data, options: Options(
          method: method, responseType: payload['binary'] == true ? ResponseType.bytes : ResponseType.json,
          headers: {'Authorization': 'Bearer $token'}, validateStatus: (_) => true,
        )).then((value) {
          if (value.statusCode == 401) throw const AccountException('unauthorized', 'Oturum sona erdi.');
          return value;
        });
      } on DioException {
        throw const CartException('Hesap servisine ulaşılamadı. Yeniden deneyin.');
      }
    });
    if (response == null) return {'status': 401, 'body': {'title': 'Uygulamada hesabına giriş yap.'}};
    final mime = response.headers.value('content-type') ?? 'application/json';
    return {'status': response.statusCode, 'contentType': mime,
      if (payload['binary'] == true) 'base64': base64Encode((response.data as List).cast<int>()) else 'body': response.data};
  }

  Future<Map<String, dynamic>> handle(String raw) async {
    String? id;
    try {
      if (raw.length > 12 * 1024 * 1024) throw const CartException('Önizleme isteği işlenemedi.');
      final request = jsonDecode(raw) as Map<String, dynamic>;
      id = request['id'] as String;
      final payload = request['payload'] as Map<String, dynamic>;
      switch (request['action']) {
        case 'account': return {'id': id, ...await account(payload)};
        case 'cart.read':
          await ref.read(cartProvider.notifier).ready;
          return {'id': id, 'body': ref.read(cartProvider).map((line) => {...line.toJson(), if(line.configurationPlacement == null && line.designPlacement != null) 'legacyDesignPlacement': line.designPlacement!.toJson()}).toList()};
        case 'cart.write':
          final rows = parseCart(jsonEncode(payload['rows'])), expected = parseCart(jsonEncode(payload['previous']));
          if (payload['rows'] is! List || rows.length != (payload['rows'] as List).length) throw const CartException('Sepet satırları doğrulanamadı.');
          await ref.read(cartProvider.notifier).replaceFromPreview(rows, expected);
          return {'id': id, 'status': 204};
        default: throw const CartException('Önizleme işlemi tanınmadı.');
      }
    } catch (error) {
      return {'id': id, 'error': error is CartException ? error.message : error is AccountException ? error.message : 'İşlem tamamlanamadı. Yeniden deneyin.'};
    }
  }
}
final nativeCommerceBridgeProvider = Provider<NativeCommerceBridge>(NativeCommerceBridge.new);
