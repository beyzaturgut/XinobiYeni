import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;

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
import 'package:xinobi_mobile/features/personalization/editor_screen.dart';
import 'package:xinobi_mobile/features/personalization/surface_preview.dart';
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
    Uint8List? image,
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
          designImageProvider.overrideWith((ref, path) async => null),
          if (image != null)
            galleryPickerProvider.overrideWithValue(
              () async => (bytes: image, name: 'device-test.png'),
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

  testWidgets('Editor blocks preview when a variant has no approved mask', (
    tester,
  ) async {
    await open(tester, '/tasarim-editoru?urun=P1&renk=V1');
    expect(find.text('Tasarım editörü'), findsOneWidget);
    expect(
      find.text('Bu renk için onaylı tasarım yüzeyi yok; başka bir renk seç.'),
      findsOneWidget,
    );
    expect(
      find.text(
        'Temsilidir. Dijital önizlemedir; baskı ölçüsü ve renk onayı değildir.',
      ),
      findsOneWidget,
    );
  });

  testWidgets(
    'Approved editor places, rotates, covers and saves a gallery image',
    (tester) async {
      final recorder = ui.PictureRecorder();
      Canvas(recorder).drawRect(
        const Rect.fromLTWH(0, 0, 8, 8),
        Paint()..color = Colors.white,
      );
      final picture = recorder.endRecording();
      final raster = await picture.toImage(8, 8);
      final bytes = (await raster.toByteData(format: ui.ImageByteFormat.png))!
          .buffer
          .asUint8List();
      raster.dispose();
      picture.dispose();
      final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
      server.listen((request) {
        request.response.headers.contentType = ContentType('image', 'png');
        request.response.add(bytes);
        request.response.close();
      });
      addTearDown(() => server.close(force: true));
      final designs = OfflineDesigns();
      await open(
        tester,
        '/tasarim-editoru?urun=P1&renk=V1',
        designs: designs,
        catalog: ApprovedCatalog('http://127.0.0.1:${server.port}/fixture.png'),
        image: bytes,
      );
      await tester.tap(find.text('Galeriden seç'));
      await tester.pumpAndSettle();
      final preview = find.byType(SurfacePreview);
      expect(preview, findsOneWidget);
      expect(
        find.byWidgetPredicate(
          (w) => w is CustomPaint && w.painter is SurfacePainter,
        ),
        findsOneWidget,
      );
      await tester.ensureVisible(preview);
      await tester.timedDrag(
        preview,
        const Offset(80, 40),
        const Duration(milliseconds: 500),
      );
      await tester.pumpAndSettle();
      expect(
        tester.widget<SurfacePreview>(preview).placement.offset,
        isNot(Offset.zero),
      );
      final size = find.byType(Slider).first;
      await tester.ensureVisible(size);
      await tester.drag(size, const Offset(30, 0));
      await tester.pumpAndSettle();
      expect(
        tester.widget<SurfacePreview>(preview).placement.scale,
        isNot(0.4),
      );
      final rotation = find.byType(Slider).last;
      await tester.ensureVisible(rotation);
      await tester.drag(rotation, const Offset(30, 0));
      await tester.pumpAndSettle();
      expect(
        tester.widget<SurfacePreview>(preview).placement.rotation,
        isNot(0),
      );
      await tester.ensureVisible(find.text('Yüzeyi kapla'));
      await tester.tap(find.text('Yüzeyi kapla'));
      await tester.pumpAndSettle();
      expect(tester.widget<SurfacePreview>(preview).placement.cover, isTrue);
      await tester.ensureVisible(find.text('Tasarımımı kaydet'));
      await tester.tap(find.text('Tasarımımı kaydet'));
      await tester.pumpAndSettle();
      expect(designs.saved.last.name, 'device-test.png');
      expect(find.text('Tasarım hesabına kaydedildi.'), findsOneWidget);
    },
  );
}
