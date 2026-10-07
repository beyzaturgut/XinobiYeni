import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/account/auth.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/main.dart';

import 'app_test.dart' show FakeCatalog;

class MemoryTokens implements TokenStore {
  MemoryTokens([this.value]);
  String? value;
  @override
  Future<String?> refreshToken() async => value;
  @override
  Future<void> save(String refreshToken) async => value = refreshToken;
  @override
  Future<void> clear() async => value = null;
}

AccountProfile _profile(String name, String email) => AccountProfile((b) => b
  ..id = 'u1'
  ..name = name
  ..email = email
  ..createdAt = DateTime.utc(2026, 10, 7));

AuthSession _session(String suffix, AccountProfile profile) => AuthSession((b) => b
  ..accessToken = 'access-$suffix'
  ..accessTokenExpiresAt = DateTime.utc(2026, 10, 7, 12, 15)
  ..refreshToken = 'refresh-$suffix'
  ..refreshTokenExpiresAt = DateTime.utc(2026, 11, 6)
  ..account = profile.toBuilder());

/// Offline stand-in for /api/v1/auth: one account, password "guclu-parola-1", verification code "123456".
class FakeAccounts implements AccountRepository {
  final profile = _profile('Ayşe Yılmaz', 'ayse@example.com');
  var refreshCount = 0;
  final revoked = <String>[];
  String? expiredAccess;

  @override
  Future<AccountEmailVerification> startVerification(String email) async => AccountEmailVerification((b) => b
    ..verificationId = 'v1'
    ..email = email
    ..expiresAt = DateTime.utc(2026, 10, 7, 12, 10)
    ..previewCode = '123456');

  @override
  Future<AuthSession> register({required String name, required String email, required String password, required String verificationId, required String code}) async {
    if (code != '123456') throw const AccountException('verification_failed', 'Doğrulama kodu hatalı.');
    return _session('new', _profile(name, email));
  }

  @override
  Future<AuthSession> login(String email, String password) async {
    if (email != 'ayse@example.com' || password != 'guclu-parola-1') throw const AccountException('invalid_credentials', 'E-posta veya parola hatalı.');
    return _session('login', profile);
  }

  @override
  Future<AuthSession> refresh(String refreshToken) async {
    refreshCount++;
    if (!refreshToken.startsWith('refresh-')) throw const AccountException('invalid_refresh_token', 'Oturumun sona erdi. Tekrar giriş yap.');
    return _session('r$refreshCount', profile);
  }

  @override
  Future<void> logout(String refreshToken) async => revoked.add(refreshToken);

  @override
  Future<AccountProfile> me(String accessToken) async {
    if (accessToken == expiredAccess) throw const AccountException('unauthorized', 'Oturumun sona erdi. Tekrar giriş yap.');
    return profile.rebuild((b) => b.name = 'Ayşe Y.');
  }
}

Future<(FakeAccounts, MemoryTokens)> pumpAccount(WidgetTester tester, {String? storedRefresh, bool keepPreferences = false}) async {
  if (!keepPreferences) SharedPreferences.setMockInitialValues({});
  tester.view.physicalSize = const Size(1170, 2532);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);
  final accounts = FakeAccounts();
  final tokens = MemoryTokens(storedRefresh);
  await tester.pumpWidget(ProviderScope(
    retry: noAutomaticRetry,
    overrides: [
      catalogRepositoryProvider.overrideWithValue(FakeCatalog()),
      accountRepositoryProvider.overrideWithValue(accounts),
      tokenStoreProvider.overrideWithValue(tokens),
    ],
    child: const XinobiApp(initialLocation: '/hesap'),
  ));
  await tester.pumpAndSettle();
  return (accounts, tokens);
}

void main() {
  testWidgets('a stored refresh token restores the session on launch', (tester) async {
    final (accounts, tokens) = await pumpAccount(tester, storedRefresh: 'refresh-old');
    expect(find.text('Hesabım'), findsOneWidget);
    expect(find.text('ayse@example.com'), findsOneWidget);
    expect(accounts.refreshCount, 1);
    expect(tokens.value, 'refresh-r1', reason: 'The rotated token replaces the old one.');
  });

  testWidgets('an invalid stored token is cleared and the forms are shown', (tester) async {
    final (_, tokens) = await pumpAccount(tester, storedRefresh: 'stolen');
    expect(find.text('Hesabına giriş yap'), findsOneWidget);
    expect(tokens.value, isNull);
  });

  testWidgets('login shows a generic error, then signs in and logout clears the token', (tester) async {
    final (accounts, tokens) = await pumpAccount(tester);
    await tester.enterText(find.widgetWithText(TextField, 'E-posta'), 'ayse@example.com');
    await tester.enterText(find.widgetWithText(TextField, 'Parola'), 'yanlis');
    await tester.tap(find.widgetWithText(FilledButton, 'Giriş yap'));
    await tester.pumpAndSettle();
    expect(find.text('E-posta veya parola hatalı.'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Parola'), 'guclu-parola-1');
    await tester.tap(find.widgetWithText(FilledButton, 'Giriş yap'));
    await tester.pumpAndSettle();
    expect(find.text('Ayşe Yılmaz'), findsOneWidget);
    expect(tokens.value, 'refresh-login');
    await tester.tap(find.text('Çıkış yap'));
    await tester.pumpAndSettle();
    expect(find.text('Hesabına giriş yap'), findsOneWidget);
    expect(tokens.value, isNull);
    expect(accounts.revoked, ['refresh-login']);
  });

  testWidgets('registration sends a code and creates the account with it', (tester) async {
    final (_, tokens) = await pumpAccount(tester);
    await tester.tap(find.text('Üye ol'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Doğrulama kodu gönder'));
    await tester.pumpAndSettle();
    expect(find.text('Ad soyad gir.'), findsOneWidget, reason: 'Fields are checked before a code is requested.');
    await tester.enterText(find.widgetWithText(TextField, 'Ad soyad'), 'Mehmet Kaya');
    await tester.enterText(find.widgetWithText(TextField, 'E-posta'), 'mehmet@example.com');
    await tester.enterText(find.widgetWithText(TextField, 'Parola'), 'guclu-parola-2');
    await tester.tap(find.text('Doğrulama kodu gönder'));
    await tester.pumpAndSettle();
    expect(find.textContaining('mehmet@example.com adresine 6 haneli'), findsOneWidget);
    expect(find.textContaining('Geliştirme modu'), findsOneWidget);
    expect(find.text('Kodu tekrar gönder (60 sn)'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Doğrulama kodu'), '000000');
    await tester.tap(find.text('Hesabı oluştur'));
    await tester.pumpAndSettle();
    expect(find.text('Doğrulama kodu hatalı.'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Doğrulama kodu'), '123456');
    await tester.tap(find.text('Hesabı oluştur'));
    await tester.pump(const Duration(seconds: 61));
    await tester.pumpAndSettle();
    expect(find.text('Mehmet Kaya'), findsOneWidget);
    expect(tokens.value, 'refresh-new');
  });

  testWidgets('an expired access token is refreshed once when the profile reloads', (tester) async {
    final (accounts, _) = await pumpAccount(tester, storedRefresh: 'refresh-old');
    accounts.expiredAccess = 'access-r1';
    final container = ProviderScope.containerOf(tester.element(find.text('Hesabım')));
    await container.read(authProvider.notifier).reloadProfile();
    await tester.pumpAndSettle();
    expect(accounts.refreshCount, 2);
    expect(find.text('Ayşe Y.'), findsOneWidget);
  });
}
