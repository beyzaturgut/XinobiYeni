import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../catalog/catalog_repository.dart';

/// [code] is the API's stable problem code (e.g. `invalid_credentials`, `email_taken`); [message] is safe to show.
class AccountException implements Exception {
  const AccountException(this.code, this.message);
  final String code;
  final String message;
  bool get unauthorized => code == 'invalid_refresh_token' || code == 'invalid_token' || code == 'unauthorized';
  @override
  String toString() => message;
}

/// Shared account contract (/api/v1/auth, /api/v1/me) — the same accounts the web uses (ADR-004: bearer tokens on mobile).
abstract interface class AccountRepository {
  Future<AccountEmailVerification> startVerification(String email);
  Future<AuthSession> register({required String name, required String email, required String password, required String verificationId, required String code});
  Future<AuthSession> login(String email, String password);
  Future<AuthSession> refresh(String refreshToken);
  Future<void> logout(String refreshToken);
  Future<AccountProfile> me(String accessToken);
}

class ApiAccountRepository implements AccountRepository {
  ApiAccountRepository(XinobiApiClient client) : _api = client.getAccountApi();
  final AccountApi _api;

  @override
  Future<AccountEmailVerification> startVerification(String email) =>
      _call(() => _api.startAccountEmailVerification(startAccountEmailVerification: StartAccountEmailVerification((b) => b.email = email)));

  @override
  Future<AuthSession> register({required String name, required String email, required String password, required String verificationId, required String code}) =>
      _call(() => _api.registerAccount(
            registerAccount: RegisterAccount((b) => b
              ..name = name
              ..email = email
              ..password = password
              ..verificationId = verificationId
              ..verificationCode = code),
          ));

  @override
  Future<AuthSession> login(String email, String password) => _call(() => _api.loginAccount(
        loginAccount: LoginAccount((b) => b
          ..email = email
          ..password = password),
      ));

  @override
  Future<AuthSession> refresh(String refreshToken) => _call(() => _api.refreshSession(refreshSession: RefreshSession((b) => b.refreshToken = refreshToken)));

  @override
  Future<void> logout(String refreshToken) async {
    try {
      await _api.logoutSession(logoutSession: LogoutSession((b) => b.refreshToken = refreshToken));
    } on DioException {
      // Local sign-out still happens; the server session expires on its own.
    }
  }

  @override
  Future<AccountProfile> me(String accessToken) => _call(() => _api.getMyAccount(headers: {'Authorization': 'Bearer $accessToken'}));

  Future<T> _call<T>(Future<Response<T>> Function() request) async {
    try {
      final data = (await request()).data;
      if (data == null) throw const AccountException('empty_response', 'Beklenmeyen boş yanıt alındı.');
      return data;
    } on DioException catch (error) {
      final body = error.response?.data;
      final code = body is Map ? body['code']?.toString() : null;
      final title = body is Map ? body['title']?.toString() : null;
      if (code != null && title != null && title.isNotEmpty) throw AccountException(code, title);
      return switch (error.response?.statusCode) {
        401 => throw const AccountException('unauthorized', 'Oturumun sona erdi. Tekrar giriş yap.'),
        429 => throw const AccountException('rate_limited', 'Çok fazla deneme yaptın. Biraz sonra tekrar dene.'),
        503 => throw const AccountException('account_unavailable', 'Hesap işlemleri şu anda kullanılamıyor.'),
        _ => throw const AccountException('network', 'Bağlantı kurulamadı. İnternet bağlantını kontrol edip tekrar dene.'),
      };
    }
  }
}

/// Tokens live in the platform keystore (iOS Keychain, Android Keystore), never in plain preferences.
abstract interface class TokenStore {
  Future<String?> refreshToken();
  Future<void> save(String refreshToken);
  Future<void> clear();
}

class SecureTokenStore implements TokenStore {
  const SecureTokenStore();
  static const _storage = FlutterSecureStorage();
  static const _key = 'xinobi-refresh-token';
  @override
  Future<String?> refreshToken() => _storage.read(key: _key);
  @override
  Future<void> save(String refreshToken) => _storage.write(key: _key, value: refreshToken);
  @override
  Future<void> clear() => _storage.delete(key: _key);
}

sealed class AuthState {
  const AuthState();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class SignedOut extends AuthState {
  const SignedOut();
}

class SignedIn extends AuthState {
  const SignedIn(this.profile);
  final AccountProfile profile;
}

/// Holds the session. The access token stays in memory only; the refresh token restores the session on the next launch.
class AuthController extends Notifier<AuthState> {
  String? _accessToken;
  Future<AuthSession>? _refreshing;

  AccountRepository get _repository => ref.read(accountRepositoryProvider);
  TokenStore get _tokens => ref.read(tokenStoreProvider);

  @override
  AuthState build() {
    _restore();
    return const AuthLoading();
  }

  Future<void> _restore() async {
    try {
      final stored = await _tokens.refreshToken();
      if (stored == null) {
        state = const SignedOut();
        return;
      }
      await _adopt(await _refresh(stored));
    } on AccountException catch (error) {
      if (error.unauthorized) await _tokens.clear();
      state = const SignedOut();
    }
  }

  Future<AuthSession> _refresh(String refreshToken) => _refreshing ??= _repository.refresh(refreshToken).whenComplete(() => _refreshing = null);

  Future<void> _adopt(AuthSession session) async {
    _accessToken = session.accessToken;
    await _tokens.save(session.refreshToken);
    state = SignedIn(session.account);
  }

  Future<void> login(String email, String password) async => _adopt(await _repository.login(email.trim(), password));

  Future<void> register({required String name, required String email, required String password, required String verificationId, required String code}) async =>
      _adopt(await _repository.register(name: name.trim(), email: email.trim(), password: password, verificationId: verificationId, code: code.trim()));

  Future<void> logout() async {
    final stored = await _tokens.refreshToken();
    _accessToken = null;
    await _tokens.clear();
    state = const SignedOut();
    if (stored != null) await _repository.logout(stored);
  }

  /// Reloads the profile; an expired access token is refreshed once and the call retried.
  Future<void> reloadProfile() async {
    final token = _accessToken;
    if (token == null) return;
    try {
      state = SignedIn(await _repository.me(token));
    } on AccountException catch (error) {
      if (!error.unauthorized && error.code != 'unauthorized') rethrow;
      final stored = await _tokens.refreshToken();
      if (stored == null) return logout();
      try {
        await _adopt(await _refresh(stored));
        state = SignedIn(await _repository.me(_accessToken!));
      } on AccountException {
        await logout();
      }
    }
  }
}

final accountRepositoryProvider = Provider<AccountRepository>((ref) => ApiAccountRepository(ref.watch(apiClientProvider)));
final tokenStoreProvider = Provider<TokenStore>((ref) => const SecureTokenStore());
final authProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);
