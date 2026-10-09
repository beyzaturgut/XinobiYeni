import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_mobile/features/compare/compare.dart';

import 'app_test.dart' show pumpApp;

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));

  testWidgets('cards add products to the comparison, which lists specs and hides equal rows on request', (tester) async {
    await pumpApp(tester, location: '/urunler');
    await tester.tap(find.byTooltip('Çay Makinesi 101 ürününü karşılaştırmaya ekle'));
    await tester.pumpAndSettle();
    await tester.tap(find.byTooltip('Kahve Makinesi 101 ürününü karşılaştırmaya ekle'));
    await tester.pumpAndSettle();
    expect(jsonDecode((await SharedPreferences.getInstance()).getString(compareStorageKey)!), ['P1', 'P2']);

    await tester.tap(find.byTooltip('Karşılaştır, 2 ürün'));
    await tester.pumpAndSettle();
    expect(find.text('Güç'), findsOneWidget);
    expect(find.text('1650 W'), findsOneWidget);
    expect(find.text('1200 W'), findsOneWidget);
    expect(find.text('Kapasite'), findsOneWidget);

    await tester.tap(find.text('Yalnız farkları göster'));
    await tester.pumpAndSettle();
    expect(find.text('Kapasite'), findsNothing, reason: 'Both products have the same capacity.');
    expect(find.text('Güç'), findsOneWidget);

    await tester.tap(find.byTooltip('Kahve Makinesi 101 ürününü karşılaştırmadan çıkar'));
    await tester.pumpAndSettle();
    expect(find.text('1200 W'), findsNothing);
  });

  testWidgets('the list stops at four products', (tester) async {
    SharedPreferences.setMockInitialValues({compareStorageKey: jsonEncode(['A', 'B', 'C', 'D'])});
    await pumpApp(tester, location: '/urunler');
    await tester.tap(find.byTooltip('Çay Makinesi 101 ürününü karşılaştırmaya ekle'));
    await tester.pump();
    expect(find.text('En fazla 4 ürün karşılaştırabilirsin.'), findsOneWidget);
  });
}
