import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/home/home_screen.dart';
import 'package:xinobi_mobile/features/news/news.dart';

import 'app_test.dart' show FakeCatalog, pumpApp;

AnnouncementItem _news(String id, String title, DateTime at) => AnnouncementItem((b) => b
  ..id = id
  ..title = title
  ..body = '$title ayrıntısı'
  ..kind = 'Duyuru'
  ..publishedAt = at.toUtc());

class FailingNews extends FakeCatalog {
  @override
  Future<AnnouncementList> announcements() async => throw Exception('offline');
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('the header has favourites and news instead of search', (tester) async {
    await pumpApp(tester);
    expect(find.bySemanticsLabel('Ara'), findsNothing);
    expect(find.byTooltip('Haber ve duyurular'), findsOneWidget);
    await tester.tap(find.byTooltip('Favorilerim'));
    await tester.pumpAndSettle();
    expect(find.text('Favori listen henüz boş.'), findsOneWidget);
  });

  testWidgets('tapping the header logo returns to the home page', (tester) async {
    await pumpApp(tester, location: '/sepet');
    expect(find.byType(HomeScreen), findsNothing);
    await tester.tap(find.bySemanticsLabel('Xinobi, ana sayfa'));
    await tester.pumpAndSettle();
    expect(find.byType(HomeScreen), findsOneWidget);
  });

  testWidgets('the badge counts unseen announcements and opening the page reads them', (tester) async {
    SharedPreferences.setMockInitialValues({seenAnnouncementsKey: ['A1']});
    final catalog = FakeCatalog()
      ..news = [_news('A1', 'Eski duyuru', DateTime(2026, 10, 1)), _news('A2', 'Yeni kampanya', DateTime(2026, 10, 6))];
    await pumpApp(tester, catalog: catalog);
    expect(find.bySemanticsLabel('1'), findsNothing, reason: 'The badge number must not replace the button name (its tooltip).');
    await tester.tap(find.byTooltip('Haber ve duyurular, 1 yeni'));
    await tester.pumpAndSettle();

    final titles = tester.widgetList<Text>(find.textContaining(RegExp(r'^(Eski duyuru|Yeni kampanya)$'))).map((text) => text.data).toList();
    expect(titles, ['Yeni kampanya', 'Eski duyuru'], reason: 'Newest first.');
    expect(find.text('Yeni'), findsOneWidget, reason: 'Only the unseen one is marked, and it stays marked during the visit.');
    expect(find.text('Duyuru · 06.10.2026'), findsOneWidget);
    expect((await SharedPreferences.getInstance()).getStringList(seenAnnouncementsKey)?.toSet(), {'A1', 'A2'});

    await tester.pageBack();
    await tester.pumpAndSettle();
    expect(find.byTooltip('Haber ve duyurular'), findsOneWidget);
  });

  testWidgets('no announcements shows an empty message', (tester) async {
    await pumpApp(tester, location: '/duyurular');
    expect(find.text('Henüz haber veya duyuru yok.'), findsOneWidget);
  });

  testWidgets('an unreachable API shows no badge and a retry on the page', (tester) async {
    await pumpApp(tester, catalog: FailingNews());
    expect(find.byTooltip('Haber ve duyurular'), findsOneWidget);
    await tester.tap(find.byTooltip('Haber ve duyurular'));
    await tester.pumpAndSettle();
    expect(find.text('Tekrar dene'), findsOneWidget);
  });
}
