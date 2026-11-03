import 'package:built_collection/built_collection.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../catalog/catalog_repository.dart';
import '../../core/user_facing_error.dart';

/// [code] is the API's stable problem code (e.g. `invalid_credentials`, `email_taken`); [message] is safe to show.
class AccountException implements UserFacingException {
  const AccountException(this.code, this.message);
  final String code;
  @override
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
  /// Sends a reset code; the answer is the same whether or not the address has an account.
  Future<AccountEmailVerification> startPasswordReset(String email);
  /// Sets the new password and signs out every device.
  Future<void> confirmPasswordReset({required String email, required String verificationId, required String code, required String newPassword});
  Future<AuthSession> refresh(String refreshToken);
  Future<void> logout(String refreshToken);
  Future<AccountProfile> me(String accessToken);
  /// [phone] null leaves it unchanged; an empty string removes it.
  Future<AccountProfile> updateProfile(String accessToken, {required String name, String? phone});
  Future<AccountEmailVerification> startEmailChange(String accessToken, String newEmail);
  Future<AccountProfile> confirmEmailChange(String accessToken, {required String newEmail, required String verificationId, required String code, required String password});
  Future<void> deleteAccount(String accessToken, String password);
  Future<List<CustomerAddress>> addresses(String accessToken);
  Future<CustomerAddress> saveAddress(String accessToken, String? id, SaveCustomerAddress address);
  Future<void> deleteAddress(String accessToken, String id);
  /// Product ids saved as favourites on the account; the web reads the same list.
  Future<List<String>> favorites(String accessToken);
  /// Fails with `product_not_found` when the product is not published.
  Future<void> addFavorite(String accessToken, String productId);
  Future<void> deleteFavorite(String accessToken, String productId);
  Future<List<CustomerOrder>> orders(String accessToken);
  Future<CustomerOrder> placeOrder(String accessToken, PlaceOrder order);
  Future<CustomerOrder> order(String accessToken, String id);
  Future<OrderOptions> orderOptions(String accessToken);
  /// Cancels a received order at once, or opens a request while it is being prepared.
  Future<CustomerOrder> cancelOrder(String accessToken, String id, CancelMyOrder request);
  Future<CustomerOrder> returnOrder(String accessToken, String id, ReturnMyOrder request);
  Future<Inbox> inbox(String accessToken);
  /// [ids] null marks every notification read.
  Future<void> markRead(String accessToken, List<String>? ids);
  Future<List<MyReview>> myReviews(String accessToken);
  /// Only products from a delivered order; a new submission replaces the earlier one and waits for moderation.
  Future<MyReview> submitReview(String accessToken, SubmitReview review);
  Future<List<MyDesign>> designs(String accessToken);
  /// Copies a finished XINOBI U design out of its session into the account (K-21).
  Future<MyDesign> saveDesign(String accessToken, String sessionId);
  /// Stores the customer's own image for a product (K-14); the server checks the content is PNG, JPEG or WebP.
  Future<MyDesign> uploadDesign(String accessToken, List<int> bytes, String fileName, String productId, String? variantId);
  Future<MyDesign> renameDesign(String accessToken, String id, String name);
  Future<void> deleteDesign(String accessToken, String id);
  /// Absolute URL of a design image; it needs the bearer header.
  String designImageUrl(String path);
  Future<List<Quote>> quotes(String accessToken);

  /// Signs out every other device; the returned session keeps this one signed in.
  Future<AuthSession> changePassword(String accessToken, {required String current, required String next});
}

class ApiAccountRepository implements AccountRepository {
  ApiAccountRepository(XinobiApiClient client)
      : _api = client.getAccountApi(),
        _baseUrl = client.dio.options.baseUrl;
  final AccountApi _api;
  final String _baseUrl;

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
  Future<AccountEmailVerification> startPasswordReset(String email) =>
      _call(() => _api.startPasswordReset(startPasswordReset: StartPasswordReset((b) => b.email = email.trim().toLowerCase())));

  @override
  Future<void> confirmPasswordReset({required String email, required String verificationId, required String code, required String newPassword}) =>
      _empty(() => _api.confirmPasswordReset(
            confirmPasswordReset: ConfirmPasswordReset((b) => b
              ..email = email
              ..verificationId = verificationId
              ..verificationCode = code.trim()
              ..newPassword = newPassword),
          ));

  @override
  Future<AccountProfile> me(String accessToken) => _call(() => _api.getMyAccount(headers: {'Authorization': 'Bearer $accessToken'}));

  Map<String, String> _bearer(String token) => {'Authorization': 'Bearer $token'};

  @override
  Future<AccountProfile> updateProfile(String accessToken, {required String name, String? phone}) => _call(() => _api.updateMyAccount(
        updateMyAccount: UpdateMyAccount((b) => b
          ..name = name
          ..phone = phone),
        headers: _bearer(accessToken),
      ));

  @override
  Future<AccountEmailVerification> startEmailChange(String accessToken, String newEmail) =>
      _call(() => _api.startMyEmailChange(startEmailChange: StartEmailChange((b) => b.newEmail = newEmail), headers: _bearer(accessToken)));

  @override
  Future<AccountProfile> confirmEmailChange(String accessToken, {required String newEmail, required String verificationId, required String code, required String password}) =>
      _call(() => _api.confirmMyEmailChange(
            confirmEmailChange: ConfirmEmailChange((b) => b
              ..newEmail = newEmail
              ..verificationId = verificationId
              ..verificationCode = code
              ..currentPassword = password),
            headers: _bearer(accessToken),
          ));

  @override
  Future<void> deleteAccount(String accessToken, String password) =>
      _empty(() => _api.deleteMyAccount(deleteMyAccount: DeleteMyAccount((b) => b.currentPassword = password), headers: _bearer(accessToken)));

  @override
  Future<List<CustomerAddress>> addresses(String accessToken) async => (await _call(() => _api.listMyAddresses(headers: _bearer(accessToken)))).toList();

  @override
  Future<CustomerAddress> saveAddress(String accessToken, String? id, SaveCustomerAddress address) => id == null
      ? _call(() => _api.addMyAddress(saveCustomerAddress: address, headers: _bearer(accessToken)))
      : _call(() => _api.updateMyAddress(id: id, saveCustomerAddress: address, headers: _bearer(accessToken)));

  @override
  Future<void> deleteAddress(String accessToken, String id) => _empty(() => _api.deleteMyAddress(id: id, headers: _bearer(accessToken)));

  @override
  Future<List<String>> favorites(String accessToken) async => (await _call(() => _api.listMyFavorites(headers: _bearer(accessToken)))).toList();

  @override
  Future<void> addFavorite(String accessToken, String productId) =>
      _empty(() => _api.addMyFavorite(addFavorite: AddFavorite((b) => b.productId = productId), headers: _bearer(accessToken)));

  @override
  Future<void> deleteFavorite(String accessToken, String productId) => _empty(() => _api.deleteMyFavorite(productId: productId, headers: _bearer(accessToken)));

  @override
  Future<List<CustomerOrder>> orders(String accessToken) async => (await _call(() => _api.listMyOrders(headers: _bearer(accessToken)))).toList();

  @override
  Future<CustomerOrder> placeOrder(String accessToken, PlaceOrder order) => _call(() => _api.placeMyOrder(placeOrder: order, headers: _bearer(accessToken)));

  @override
  Future<CustomerOrder> order(String accessToken, String id) => _call(() => _api.getMyOrder(id: id, headers: _bearer(accessToken)));

  @override
  Future<OrderOptions> orderOptions(String accessToken) => _call(() => _api.getOrderOptions(headers: _bearer(accessToken)));

  @override
  Future<CustomerOrder> cancelOrder(String accessToken, String id, CancelMyOrder request) =>
      _call(() => _api.cancelMyOrder(id: id, cancelMyOrder: request, headers: _bearer(accessToken)));

  @override
  Future<CustomerOrder> returnOrder(String accessToken, String id, ReturnMyOrder request) =>
      _call(() => _api.returnMyOrder(id: id, returnMyOrder: request, headers: _bearer(accessToken)));

  @override
  Future<List<MyReview>> myReviews(String accessToken) async => (await _call(() => _api.listMyReviews(headers: _bearer(accessToken)))).toList();

  @override
  Future<MyReview> submitReview(String accessToken, SubmitReview review) => _call(() => _api.submitMyReview(submitReview: review, headers: _bearer(accessToken)));

  @override
  Future<List<MyDesign>> designs(String accessToken) async => (await _call(() => _api.listMyDesigns(headers: _bearer(accessToken)))).toList();

  @override
  Future<MyDesign> saveDesign(String accessToken, String sessionId) =>
      _call(() => _api.saveMyDesign(saveDesignFromSession: SaveDesignFromSession((b) => b.sessionId = sessionId), headers: _bearer(accessToken)));

  @override
  Future<MyDesign> uploadDesign(String accessToken, List<int> bytes, String fileName, String productId, String? variantId) => _call(() => _api.uploadMyDesign(
      file: MultipartFile.fromBytes(bytes, filename: fileName), productId: productId, variantId: variantId, headers: _bearer(accessToken)));

  @override
  Future<MyDesign> renameDesign(String accessToken, String id, String name) =>
      _call(() => _api.renameMyDesign(id: id, renameDesign: RenameDesign((b) => b.name = name), headers: _bearer(accessToken)));

  @override
  Future<void> deleteDesign(String accessToken, String id) => _empty(() => _api.deleteMyDesign(id: id, headers: _bearer(accessToken)));

  @override
  String designImageUrl(String path) => Uri.parse(_baseUrl).resolve(path).toString();

  @override
  Future<List<Quote>> quotes(String accessToken) async => (await _call(() => _api.listMyQuotes(headers: _bearer(accessToken)))).toList();

  @override
  Future<Inbox> inbox(String accessToken) => _call(() => _api.listMyNotifications(headers: _bearer(accessToken)));

  @override
  Future<void> markRead(String accessToken, List<String>? ids) => _empty(() => _api.markMyNotificationsRead(
      markNotificationsRead: MarkNotificationsRead((b) => b.ids = ids == null ? null : ListBuilder<String>(ids)), headers: _bearer(accessToken)));

  Future<void> _empty(Future<Response<void>> Function() request) async {
    try {
      await request();
    } on DioException catch (error) {
      await _call<Never>(() => Future.error(error));
    }
  }

  @override
  Future<AuthSession> changePassword(String accessToken, {required String current, required String next}) => _call(() => _api.changeMyPassword(
        changeMyPassword: ChangeMyPassword((b) => b
          ..currentPassword = current
          ..newPassword = next),
        headers: {'Authorization': 'Bearer $accessToken'},
      ));

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

  late Future<void> ready;
  @override
  AuthState build() {
    ready = _restore();
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
    } catch (_) {
      // An unreadable platform keystore (e.g. after a backup restore) must not leave every account screen loading forever.
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
    final profile = await _authorized(_repository.me);
    if (profile != null) state = SignedIn(profile);
  }

  /// Throws [AccountException] (e.g. `invalid_name`, `invalid_phone`) so the form can show it.
  Future<void> updateProfile({required String name, String? phone}) async {
    final profile = await _authorized((token) => _repository.updateProfile(token, name: name.trim(), phone: phone?.trim()));
    if (profile != null) state = SignedIn(profile);
  }

  Future<AccountEmailVerification?> startEmailChange(String newEmail) => _authorized((token) => _repository.startEmailChange(token, newEmail.trim()));

  Future<void> confirmEmailChange({required String newEmail, required String verificationId, required String code, required String password}) async {
    final profile = await _authorized((token) => _repository.confirmEmailChange(token, newEmail: newEmail.trim(), verificationId: verificationId, code: code.trim(), password: password));
    if (profile != null) state = SignedIn(profile);
  }

  /// Deletes the account on the server, then forgets the session on this device.
  Future<void> deleteAccount(String password) async {
    await _authorized((token) => _repository.deleteAccount(token, password));
    _accessToken = null;
    await _tokens.clear();
    state = const SignedOut();
  }

  /// For account data owned by other features (addresses, orders): runs [call] with a valid access token.
  /// A valid access token (refreshed when needed) for requests the generated client cannot make, e.g. image headers; null when signed out.
  Future<String?> accessToken() => _authorized((token) async => token);

  Future<T?> withSession<T>(Future<T> Function(AccountRepository repository, String accessToken) call) => _authorized((token) => call(_repository, token));

  /// Throws [AccountException] (`wrong_password`, `weak_password`); on success this device gets the new session.
  Future<void> changePassword({required String current, required String next}) async {
    final session = await _authorized((token) => _repository.changePassword(token, current: current, next: next));
    if (session != null) await _adopt(session);
  }

  /// Runs [call] with the access token; an expired token is refreshed once and the call retried. Null when signed out meanwhile.
  Future<T?> _authorized<T>(Future<T> Function(String accessToken) call) async {
    final token = _accessToken;
    if (token == null) return null;
    try {
      return await call(token);
    } on AccountException catch (error) {
      if (!error.unauthorized) rethrow;
      final stored = await _tokens.refreshToken();
      if (stored == null) {
        await logout();
        return null;
      }
      try {
        await _adopt(await _refresh(stored));
      } on AccountException {
        await logout();
        return null;
      }
      return call(_accessToken!);
    }
  }
}

final accountRepositoryProvider = Provider<AccountRepository>((ref) => ApiAccountRepository(ref.watch(apiClientProvider)));
final tokenStoreProvider = Provider<TokenStore>((ref) => const SecureTokenStore());
final authProvider = NotifierProvider<AuthController, AuthState>(AuthController.new);
