import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/account/auth.dart';
import 'package:xinobi_mobile/features/cart/cart.dart';
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

  final renames = <String>[];
  String? phone;
  @override
  Future<AccountProfile> updateProfile(String accessToken, {required String name, String? phone}) async {
    if (accessToken == expiredAccess) throw const AccountException('unauthorized', 'Oturumun sona erdi. Tekrar giriş yap.');
    if (phone != null && phone.isNotEmpty && phone.replaceAll(RegExp(r'\D'), '').length < 10) throw const AccountException('invalid_phone', 'Geçerli bir telefon numarası gir.');
    renames.add(name);
    if (phone != null) this.phone = phone.isEmpty ? null : phone;
    return profile.rebuild((b) => b
      ..name = name
      ..phone = this.phone);
  }

  @override
  Future<AccountEmailVerification> startEmailChange(String accessToken, String newEmail) async => AccountEmailVerification((b) => b
    ..verificationId = 'e1'
    ..email = newEmail
    ..expiresAt = DateTime.utc(2026, 10, 7, 12, 10)
    ..previewCode = '654321');

  String? changedEmail;
  @override
  Future<AccountProfile> confirmEmailChange(String accessToken, {required String newEmail, required String verificationId, required String code, required String password}) async {
    if (password != 'guclu-parola-1') throw const AccountException('wrong_password', 'Mevcut parolan hatalı.');
    if (code != '654321') throw const AccountException('verification_failed', 'Doğrulama kodu hatalı.');
    changedEmail = newEmail;
    return profile.rebuild((b) => b.email = newEmail);
  }

  var deleted = false;
  @override
  Future<void> deleteAccount(String accessToken, String password) async {
    if (password != 'guclu-parola-1') throw const AccountException('wrong_password', 'Mevcut parolan hatalı.');
    deleted = true;
  }

  final savedAddresses = <CustomerAddress>[];
  @override
  Future<List<CustomerAddress>> addresses(String accessToken) async => [...savedAddresses.where((a) => a.isDefault), ...savedAddresses.where((a) => !a.isDefault)];

  @override
  Future<CustomerAddress> saveAddress(String accessToken, String? id, SaveCustomerAddress address) async {
    final isDefault = address.isDefault || savedAddresses.isEmpty || savedAddresses.any((a) => a.id == id && a.isDefault);
    final saved = CustomerAddress((b) => b
      ..id = id ?? 'a${savedAddresses.length + 1}'
      ..title = address.title
      ..fullName = address.fullName
      ..phone = address.phone
      ..city = address.city
      ..district = address.district
      ..line = address.line
      ..postalCode = address.postalCode
      ..isDefault = isDefault);
    if (isDefault) {
      for (var i = 0; i < savedAddresses.length; i++) {
        savedAddresses[i] = savedAddresses[i].rebuild((b) => b.isDefault = false);
      }
    }
    final index = savedAddresses.indexWhere((a) => a.id == saved.id);
    index >= 0 ? savedAddresses[index] = saved : savedAddresses.add(saved);
    return saved;
  }

  @override
  Future<void> deleteAddress(String accessToken, String id) async => savedAddresses.removeWhere((a) => a.id == id);

  final placed = <CustomerOrder>[];
  final requests = <String>[];
  @override
  Future<List<CustomerOrder>> orders(String accessToken) async => placed.reversed.toList();

  @override
  Future<CustomerOrder> placeOrder(String accessToken, PlaceOrder order) async {
    requests.add(order.clientRequestId);
    final price = Money((b) => b
      ..amountMinor = 240000
      ..currency = 'TRY');
    final lines = [
      for (final item in order.items)
        CustomerOrderLine((b) => b
          ..productId = item.productId
          ..variantId = item.variantId
          ..name = 'Çay Makinesi 101'
          ..color = 'Lacivert'
          ..unitPrice = price.toBuilder()
          ..quantity = item.quantity
          ..lineTotal = (MoneyBuilder()
            ..amountMinor = 240000 * item.quantity
            ..currency = 'TRY')),
    ];
    final result = CustomerOrder((b) => b
      ..id = 'o${placed.length + 1}'
      ..number = 'XN-261007-1234'
      ..createdAt = DateTime.utc(2026, 10, 7, 12)
      ..status = 'received'
      ..address = savedAddresses.firstWhere((a) => a.id == order.addressId).toBuilder()
      ..lines.addAll(lines)
      ..total = (MoneyBuilder()
        ..amountMinor = lines.fold<int>(0, (sum, line) => sum + line.lineTotal.amountMinor)
        ..currency = 'TRY'));
    placed.add(result);
    return result;
  }

  @override
  Future<AuthSession> changePassword(String accessToken, {required String current, required String next}) async {
    if (current != 'guclu-parola-1') throw const AccountException('wrong_password', 'Mevcut parolan hatalı.');
    return _session('pw', profile);
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
    await tester.scrollUntilVisible(find.text('Çıkış yap'), 200, scrollable: find.byType(Scrollable).first);
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

  testWidgets('the signed-in account lists its settings, shopping and deletion', (tester) async {
    await pumpAccount(tester, storedRefresh: 'refresh-old');
    expect(find.text('AY'), findsOneWidget, reason: 'Initials avatar.');
    for (final row in ['Profil bilgileri', 'Parola değiştir', 'Siparişlerim', 'Adreslerim']) {
      expect(find.text(row), findsOneWidget);
    }
    expect(find.text('Favorilerim'), findsNothing, reason: 'Favourites live in the header.');
    await tester.scrollUntilVisible(find.text('Hesabımı sil'), 200, scrollable: find.byType(Scrollable).first);
    expect(find.text('Hesabımı sil'), findsOneWidget);
  });

  testWidgets('the name can be changed from profile details', (tester) async {
    final (accounts, _) = await pumpAccount(tester, storedRefresh: 'refresh-old');
    await tester.tap(find.text('Profil bilgileri'));
    await tester.pumpAndSettle();
    expect(find.text('ayse@example.com'), findsOneWidget, reason: 'E-mail is shown read-only.');
    await tester.enterText(find.widgetWithText(TextField, 'Ad soyad'), '  ');
    await tester.tap(find.widgetWithText(FilledButton, 'Kaydet'));
    await tester.pumpAndSettle();
    expect(find.text('Ad soyad gir.'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Ad soyad'), 'Ayşe Kaya');
    await tester.tap(find.widgetWithText(FilledButton, 'Kaydet'));
    await tester.pumpAndSettle();
    expect(accounts.renames, ['Ayşe Kaya']);
    expect(find.text('Profil bilgilerin güncellendi.'), findsOneWidget);
    expect(find.text('Ayşe Kaya'), findsOneWidget, reason: 'Back on the account tab with the new name.');
  });

  testWidgets('changing the password checks the fields and keeps this device signed in', (tester) async {
    final (_, tokens) = await pumpAccount(tester, storedRefresh: 'refresh-old');
    await tester.tap(find.text('Parola değiştir'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextField, 'Mevcut parola'), 'guclu-parola-1');
    await tester.enterText(find.widgetWithText(TextField, 'Yeni parola'), 'yeni-parola-1');
    await tester.enterText(find.widgetWithText(TextField, 'Yeni parola (tekrar)'), 'baska-parola');
    await tester.tap(find.widgetWithText(FilledButton, 'Parolayı değiştir'));
    await tester.pumpAndSettle();
    expect(find.text('Yeni parolalar eşleşmiyor.'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Mevcut parola'), 'yanlis-parola');
    await tester.enterText(find.widgetWithText(TextField, 'Yeni parola (tekrar)'), 'yeni-parola-1');
    await tester.tap(find.widgetWithText(FilledButton, 'Parolayı değiştir'));
    await tester.pumpAndSettle();
    expect(find.text('Mevcut parolan hatalı.'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Mevcut parola'), 'guclu-parola-1');
    await tester.tap(find.widgetWithText(FilledButton, 'Parolayı değiştir'));
    await tester.pumpAndSettle();
    expect(tokens.value, 'refresh-pw', reason: 'The new session replaces the revoked one.');
    expect(find.text('Hesabım'), findsOneWidget);
  });

  Future<void> openMenu(WidgetTester tester, String row) async {
    await tester.scrollUntilVisible(find.text(row), 200, scrollable: find.byType(Scrollable).first);
    await tester.tap(find.text(row));
    await tester.pumpAndSettle();
  }

  testWidgets('profile details save a phone number', (tester) async {
    final (accounts, _) = await pumpAccount(tester, storedRefresh: 'refresh-old');
    await openMenu(tester, 'Profil bilgileri');
    await tester.enterText(find.widgetWithText(TextField, 'Telefon (isteğe bağlı)'), '123');
    await tester.tap(find.widgetWithText(FilledButton, 'Kaydet'));
    await tester.pumpAndSettle();
    expect(find.text('Geçerli bir telefon numarası gir.'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Telefon (isteğe bağlı)'), '0532 123 45 67');
    await tester.tap(find.widgetWithText(FilledButton, 'Kaydet'));
    await tester.pumpAndSettle();
    expect(accounts.phone, '0532 123 45 67');
    expect(find.text('Profil bilgilerin güncellendi.'), findsOneWidget);
  });

  testWidgets('the e-mail changes after the code and the password', (tester) async {
    final (accounts, _) = await pumpAccount(tester, storedRefresh: 'refresh-old');
    await openMenu(tester, 'Profil bilgileri');
    await tester.tap(find.widgetWithText(TextButton, 'Değiştir'));
    await tester.pumpAndSettle();
    await tester.enterText(find.widgetWithText(TextField, 'Yeni e-posta'), 'yeni@example.com');
    await tester.tap(find.widgetWithText(FilledButton, 'Doğrulama kodu gönder'));
    await tester.pumpAndSettle();
    expect(find.text('Geliştirme ortamı kodu: 654321'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Doğrulama kodu'), '654321');
    await tester.enterText(find.widgetWithText(TextField, 'Mevcut parola'), 'yanlis');
    await tester.tap(find.widgetWithText(FilledButton, 'E-postayı değiştir'));
    await tester.pumpAndSettle();
    expect(find.text('Mevcut parolan hatalı.'), findsOneWidget);
    await tester.enterText(find.widgetWithText(TextField, 'Mevcut parola'), 'guclu-parola-1');
    await tester.tap(find.widgetWithText(FilledButton, 'E-postayı değiştir'));
    await tester.pumpAndSettle();
    expect(accounts.changedEmail, 'yeni@example.com');
    expect(find.text('E-posta adresin yeni@example.com olarak güncellendi.'), findsOneWidget);
  });

  testWidgets('deleting the account needs the password and the confirmation, then signs out', (tester) async {
    final (accounts, tokens) = await pumpAccount(tester, storedRefresh: 'refresh-old');
    await openMenu(tester, 'Hesabımı sil');
    final delete = find.widgetWithText(FilledButton, 'Hesabımı kalıcı olarak sil');
    await tester.enterText(find.widgetWithText(TextField, 'Mevcut parola'), 'guclu-parola-1');
    await tester.pump();
    expect(tester.widget<FilledButton>(delete).onPressed, isNull, reason: 'Needs the confirmation box.');
    await tester.tap(find.byType(Checkbox));
    await tester.pump();
    await tester.tap(delete);
    await tester.pumpAndSettle();
    expect(accounts.deleted, isTrue);
    expect(tokens.value, isNull);
    expect(find.text('Hesabına giriş yap'), findsOneWidget);
  });

  Future<void> fillAddress(WidgetTester tester, String title) async {
    await tester.enterText(find.widgetWithText(TextField, 'Adres başlığı'), title);
    await tester.enterText(find.widgetWithText(TextField, 'İl'), 'İstanbul');
    await tester.enterText(find.widgetWithText(TextField, 'İlçe'), 'Kadıköy');
    await tester.enterText(find.widgetWithText(TextField, 'Açık adres'), 'Moda Cad. No: 1');
    await tester.enterText(find.widgetWithText(TextField, 'Telefon'), '0532 123 45 67');
    await tester.scrollUntilVisible(find.widgetWithText(FilledButton, 'Kaydet'), 200, scrollable: find.byType(Scrollable).last);
    await tester.tap(find.widgetWithText(FilledButton, 'Kaydet'));
    await tester.pumpAndSettle();
  }

  testWidgets('addresses can be added, made default and deleted', (tester) async {
    final (accounts, _) = await pumpAccount(tester, storedRefresh: 'refresh-old');
    await openMenu(tester, 'Adreslerim');
    expect(find.textContaining('Henüz kayıtlı adresin yok'), findsOneWidget);
    await tester.tap(find.text('Adres ekle'));
    await tester.pumpAndSettle();
    expect(find.widgetWithText(TextField, 'Ayşe Yılmaz'), findsOneWidget, reason: 'The recipient defaults to the account name.');
    await fillAddress(tester, 'Ev');
    expect(find.text('Ev'), findsOneWidget);
    expect(find.text('Varsayılan'), findsOneWidget);
    await tester.tap(find.text('Adres ekle'));
    await tester.pumpAndSettle();
    await fillAddress(tester, 'İş');
    expect(accounts.savedAddresses.map((a) => a.isDefault), [true, false]);
    await tester.tap(find.text('İş'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Adresi sil'), 200, scrollable: find.byType(Scrollable).last);
    await tester.tap(find.text('Adresi sil'));
    await tester.pumpAndSettle();
    expect(accounts.savedAddresses.map((a) => a.title), ['Ev']);
  });

  testWidgets('the cart becomes a demo order with the chosen address', (tester) async {
    SharedPreferences.setMockInitialValues({cartStorageKey: jsonEncode([{'productId': 'P1', 'variantId': 'V1', 'quantity': 2}])});
    final (accounts, _) = await pumpAccount(tester, storedRefresh: 'refresh-old', keepPreferences: true);
    await accounts.saveAddress('t', null, SaveCustomerAddress((b) => b
      ..title = 'Ev'
      ..fullName = 'Ayşe Yılmaz'
      ..phone = '+905321234567'
      ..city = 'İstanbul'
      ..district = 'Kadıköy'
      ..line = 'Moda Cad. No: 1'
      ..isDefault = true));
    await tester.tap(find.text('Sepet'));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.widgetWithText(FilledButton, 'Siparişi tamamla'), 200, scrollable: find.byType(Scrollable).first);
    await tester.tap(find.widgetWithText(FilledButton, 'Siparişi tamamla'));
    await tester.pumpAndSettle();
    expect(find.text('Ev'), findsOneWidget);
    await tester.scrollUntilVisible(find.widgetWithText(FilledButton, 'Demo siparişi ver'), 200, scrollable: find.byType(Scrollable).last);
    await tester.tap(find.widgetWithText(FilledButton, 'Demo siparişi ver'));
    await tester.pumpAndSettle();
    expect(accounts.placed.single.lines.single.quantity, 2);
    expect(find.text('Siparişin alındı: XN-261007-1234'), findsOneWidget);
    expect(find.text('Sipariş detayı'), findsOneWidget);
    final container = ProviderScope.containerOf(tester.element(find.byType(Scaffold).first));
    expect(container.read(cartProvider), isEmpty, reason: 'The cart is emptied after the order.');
  });
}
