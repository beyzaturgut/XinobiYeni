import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/app/theme.dart';
import 'package:xinobi_mobile/features/xinobi_u/questionnaire_screen.dart';
import 'package:xinobi_mobile/features/xinobi_u/xinobi_u_repository.dart';
import 'package:xinobi_mobile/main.dart';

const _axes = ['Doğa', 'Ruh hâli', 'Renk', 'Yoğunluk', 'Tarz'];

XinobiUSession _session(String id, {String status = 'questionnaire', Map<String, String> answers = const {}, String? error}) => XinobiUSession((b) => b
  ..id = id
  ..status = status
  ..expiresAt = DateTime.utc(2026, 10, 8)
  ..product.id = 'P1'
  ..product.name = 'Çay Makinesi 101'
  ..product.category = 'Çay makineleri'
  ..variant.id = 'V1'
  ..variant.color = 'Lacivert'
  ..questionBankVersion = 'xinobi-u-1'
  ..questions.addAll([
    for (var i = 0; i < 5; i++)
      XinobiUQuestion((q) => q
        ..id = 'q$i'
        ..axis = 'axis$i'
        ..axisLabel = _axes[i]
        ..text = 'Soru metni $i?'
        ..options.addAll([
          for (var j = 0; j < 4; j++)
            XinobiUOption((o) => o
              ..id = 'q$i-o$j'
              ..label = 'Seçenek $i-$j'),
        ])),
  ])
  ..answers.addAll(answers.entries.map((e) => XinobiUAnswer((a) => a
    ..questionId = e.key
    ..optionId = e.value)))
  ..imageUrl = status == 'ready' ? null : null
  ..errorCode = error
  ..errorMessage = error == null ? null : 'Görsel üretimi tamamlanamadı.');

/// Offline stand-in for the server; counts generation requests so no metered call can slip into tests.
class FakeXinobiU implements XinobiURepository {
  int created = 0;
  String? lastVariant = 'unset';
  int generateCalls = 0;
  int pollsUntilReady = 2;
  XinobiUException? generateError;
  final expired = <String>{};
  final sessions = <String, XinobiUSession>{};

  @override
  Future<XinobiUStatus> status() async => XinobiUStatus((b) => b
    ..generationAvailable = true
    ..questionBankVersion = 'xinobi-u-1'
    ..questionCount = 500);

  @override
  Future<XinobiUSession> createSession({required String productId, String? variantId}) async {
    lastVariant = variantId;
    final session = _session('s${++created}');
    sessions[session.id] = session;
    return session;
  }

  @override
  Future<XinobiUSession> session(String id) async {
    if (expired.contains(id) || !sessions.containsKey(id)) throw const XinobiUException('session_expired', 'Tasarım oturumu bulunamadı veya süresi doldu.');
    final current = sessions[id]!;
    if (current.status == 'queued' && --pollsUntilReady <= 0) {
      sessions[id] = current.rebuild((b) => b.status = 'ready');
    }
    return sessions[id]!;
  }

  @override
  Future<XinobiUSession> generate(String id, Map<String, String> answers) async {
    generateCalls++;
    if (generateError != null) throw generateError!;
    expect(answers.length, 5);
    return sessions[id] = _session(id, status: 'queued', answers: answers);
  }
}

Future<void> pumpQuestionnaire(WidgetTester tester, FakeXinobiU fake) async {
  tester.view.physicalSize = const Size(1170, 2532);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(ProviderScope(
    retry: noAutomaticRetry,
    overrides: [xinobiURepositoryProvider.overrideWithValue(fake)],
    child: MaterialApp(
      theme: buildTheme(),
      home: const QuestionnaireScreen(productId: 'P1', pollInterval: Duration(milliseconds: 10)),
    ),
  ));
  await tester.pumpAndSettle();
}

Future<void> answerAll(WidgetTester tester, {int from = 0}) async {
  for (var i = from; i < 5; i++) {
    expect(find.text('Soru ${i + 1} / 5'), findsOneWidget);
    await tester.tap(find.text('Seçenek $i-1'));
    await tester.pumpAndSettle();
    await tester.tap(find.text(i == 4 ? 'Tercihlerimi gör →' : 'Devam et →'));
    await tester.pumpAndSettle();
  }
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('five questions, review, one generation, then the representative preview', (tester) async {
    final fake = FakeXinobiU();
    await pumpQuestionnaire(tester, fake);
    expect(find.text('Devam et →'), findsOneWidget);
    expect(tester.widget<FilledButton>(find.widgetWithText(FilledButton, 'Devam et →')).onPressed, isNull, reason: 'An answer is required.');
    await answerAll(tester);
    expect(find.text('Birlikte şekillenen beş tercih.'), findsOneWidget);
    expect(find.text('Seçenek 2-1'), findsOneWidget);
    await tester.tap(find.text('AI ile tasarımımı oluştur ✦'));
    await tester.pumpAndSettle();
    expect(find.text('İşte sana özel yorum.'), findsOneWidget);
    expect(find.textContaining('Temsilidir.'), findsOneWidget);
    expect(fake.generateCalls, 1);
    expect(fake.lastVariant, isNull, reason: 'No colour is chosen; the server picks the photo.');
  });

  testWidgets('restarting the app resumes the same questionnaire and answers', (tester) async {
    final fake = FakeXinobiU();
    await pumpQuestionnaire(tester, fake);
    await tester.tap(find.text('Seçenek 0-2'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Devam et →'));
    await tester.pumpAndSettle();
    await tester.pumpWidget(const SizedBox());
    await pumpQuestionnaire(tester, fake);
    expect(fake.created, 1, reason: 'The stored session is reused.');
    expect(find.text('Soru 2 / 5'), findsOneWidget);
  });

  testWidgets('daily limit keeps the answers and explains the problem', (tester) async {
    final fake = FakeXinobiU()..generateError = const XinobiUException('daily_limit', 'Bugünkü görsel üretim sınırına ulaşıldı.');
    await pumpQuestionnaire(tester, fake);
    await answerAll(tester);
    await tester.tap(find.text('AI ile tasarımımı oluştur ✦'));
    await tester.pumpAndSettle();
    expect(find.text('Bugünkü görsel üretim sınırına ulaşıldı.'), findsOneWidget);
    expect(find.text('Birlikte şekillenen beş tercih.'), findsOneWidget);
  });

  testWidgets('an expired stored session starts a new questionnaire', (tester) async {
    SharedPreferences.setMockInitialValues({'xinobi-u-session:P1:': 'old'});
    final fake = FakeXinobiU()..expired.add('old');
    await pumpQuestionnaire(tester, fake);
    expect(fake.created, 1);
    expect(find.text('Soru 1 / 5'), findsOneWidget);
  });

  testWidgets('system back steps to the previous question', (tester) async {
    final fake = FakeXinobiU();
    await pumpQuestionnaire(tester, fake);
    await tester.tap(find.text('Seçenek 0-0'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Devam et →'));
    await tester.pumpAndSettle();
    expect(find.text('Soru 2 / 5'), findsOneWidget);
    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    expect(find.text('Soru 1 / 5'), findsOneWidget);
  });
}
