

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/account/auth.dart';
import 'package:xinobi_mobile/features/assistant/nobi.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/features/designs/designs.dart';
import 'package:xinobi_mobile/features/quotes/quotes.dart';
import 'package:xinobi_mobile/main.dart';

import '../test/account_test.dart' show FakeAccounts, MemoryTokens;
import '../test/app_test.dart' show FakeCatalog;

// Device UI tests use offline repositories: no real accounts, mail or inference.
class OfflineNobi extends NobiRepository {
  OfflineNobi() : super(XinobiApiClient());
  String? sent;
  @override
  Future<String?> storedConversation() async => null;
  @override
  Future<void> rememberConversation(String? id) async {}
  @override
  Future<AssistantConfig> config() async => AssistantConfig(
    (b) => b
      ..enabled = true
      ..aiAnswers = false
      ..greeting = 'Test kataloğuna hoş geldin.'
      ..quickReplies.add('Çay makineleri')
      ..whatsAppAvailable = false
      ..disclaimer = 'Test yanıtı',
  );
  @override
  Future<AssistantReply> send(
    String message,
    String? conversationId,
    String? token,
  ) async {
    sent = message;
    return AssistantReply(
      (b) => b
        ..conversationId = 'offline-conversation'
        ..remaining = 9
        ..reply.replace(
          AssistantMessage(
            (m) => m
              ..id = 'offline-reply'
              ..role = 'assistant'
              ..text = 'Çay Makinesi 101 test kataloğunda bulunuyor.'
              ..at = DateTime.utc(2026, 10, 9),
          ),
        ),
    );
  }
}

class OfflineDesigns extends FakeAccounts {
  final saved = <MyDesign>[
    MyDesign(
      (b) => b
        ..id = 'design-1'
        ..kind = 'own'
        ..name = 'İlk tasarım'
        ..productId = 'P1'
        ..productName = 'Çay Makinesi 101'
        ..variantId = 'V1'
        ..imageUrl = '/offline-image'
        ..createdAt = DateTime.utc(2026, 10, 9),
    ),
  ];
  @override
  Future<List<MyDesign>> designs(String accessToken) async => List.of(saved);
  @override
  Future<MyDesign> renameDesign(
    String accessToken,
    String id,
    String name,
  ) async {
    final index = saved.indexWhere((item) => item.id == id);
    return saved[index] = saved[index].rebuild((b) => b.name = name);
  }

  @override
  Future<void> deleteDesign(String accessToken, String id) async =>
      saved.removeWhere((item) => item.id == id);
  @override
  Future<MyDesign> uploadDesign(
    String accessToken,
    List<int> bytes,
    String fileName,
    String productId,
    String? variantId,
  ) async {
    final design = saved.first.rebuild(
      (b) => b
        ..id = 'uploaded-design'
        ..name = fileName
        ..productId = productId
        ..variantId = variantId,
    );
    saved.add(design);
    return design;
  }
}

class ApprovedCatalog extends FakeCatalog {
  ApprovedCatalog(this.url);
  final String url;
  @override
  Future<ProductDetail> product(String id) async {
    final detail = await super.product(id);
    return detail.rebuild(
      (b) => b.variants.replace(
        detail.variants.map(
          (v) => v.rebuild(
            (b) => b
              ..imageUrl = url
              ..surfaceMaskUrl = url,
          ),
        ),
      ),
    );
  }
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  Future<void> open(
    WidgetTester tester,
    String route, {
    OfflineNobi? nobi,
    OfflineDesigns? designs,
    FakeCatalog? catalog,

  }) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          catalogRepositoryProvider.overrideWithValue(catalog ?? FakeCatalog()),
          accountRepositoryProvider.overrideWithValue(
            designs ?? FakeAccounts(),
          ),
          tokenStoreProvider.overrideWithValue(
            MemoryTokens(designs == null ? null : 'refresh-initial'),
          ),
          designImageProvider.overrideWith((ref, path) async => null
            ),
          if (nobi != null) nobiRepositoryProvider.overrideWithValue(nobi),
          quoteOptionsProvider.overrideWith(
            (ref) async => QuoteOptions(
              (b) => b
                ..purposes.add('Kurumsal hediye')
                ..minQuantity = 10
                ..maxQuantity = 1000
                ..maxItems = 10,
            ),
          ),
        ],
        child: XinobiApp(initialLocation: route),
      ),
    );
    await tester.pumpAndSettle();
  }

  testWidgets('Nobi sends a quick reply and displays the server reply', (
    tester,
  ) async {
    final nobi = OfflineNobi();
    await open(tester, '/nobi', nobi: nobi);
    expect(find.text('Test kataloğuna hoş geldin.'), findsOneWidget);
    await tester.tap(find.text('Çay makineleri').last);
    await tester.pumpAndSettle();
    expect(nobi.sent, 'Çay makineleri');
    expect(
      find.text('Çay Makinesi 101 test kataloğunda bulunuyor.'),
      findsOneWidget,
    );
  });

  testWidgets('Corporate quote form opens and tracking is reachable', (
    tester,
  ) async {
    await open(tester, '/kurumsal/teklif');
    expect(find.text('Kurumsal kişiselleştirme istiyorum'), findsOneWidget);
    expect(find.byType(TextField), findsWidgets);
    await tester.pumpWidget(const SizedBox());
    await open(tester, '/kurumsal/teklif/takip');
    expect(find.byType(TextField), findsWidgets);
  });

  testWidgets('Saved design can be renamed and deleted', (tester) async {
    final designs = OfflineDesigns();
    await open(tester, '/hesap/tasarimlarim', designs: designs);
    expect(find.text('İlk tasarım'), findsOneWidget);
    expect(find.text('Temsilidir'), findsOneWidget);
    await tester.tap(find.byTooltip('İlk tasarım yeniden adlandır'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextField), 'Yeni tasarım');
    await tester.tap(find.text('Kaydet'));
    await tester.pumpAndSettle();
    expect(designs.saved.single.name, 'Yeni tasarım');
    expect(find.text('Yeni tasarım'), findsOneWidget);
    await tester.tap(find.byTooltip('Yeni tasarım sil'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Sil'));
    await tester.pumpAndSettle();
    expect(designs.saved, isEmpty);
    expect(find.textContaining('Henüz kayıtlı tasarımın yok.'), findsOneWidget);
  });

  testWidgets('Editor entry opens product-level method selection without a colour picker', (
    tester
  ) async {
    await open(tester, '/tasarim-editoru?urun=P1&renk=V1');
    expect(find.text('Tasarımını nasıl oluşturmak istersin?'),
      findsOneWidget,
    );
    expect(
      find.bySemanticsLabel(
        'Lacivert rengini seç'
      ),
      findsNothing);
      expect(find.text('Görsel yükle →'), findsOneWidget);
    },
  );
}
