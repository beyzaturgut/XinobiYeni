import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_mobile/app/theme.dart';
import 'package:xinobi_mobile/features/home/home_sections.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  setUpAll(() async {
    await (FontLoader('Inter')..addFont(rootBundle.load('assets/fonts/Inter-Variable.ttf'))).load();
    await (FontLoader('MaterialIcons')..addFont(rootBundle.load('fonts/MaterialIcons-Regular.otf'))).load();
  });
  for (final width in [320.0, 390.0, 700.0]) {
    for (final scale in [1.0, 2.0]) {
      testWidgets('home preview keeps product clear at $width px and ${scale}x text', (tester) async {
        tester.view.physicalSize = Size(width, 2000);
        tester.view.devicePixelRatio = 1;
        addTearDown(tester.view.reset);
        await tester.pumpWidget(MaterialApp(
          theme: buildTheme(),
          builder: (context, child) => MediaQuery(data: MediaQuery.of(context).copyWith(textScaler: TextScaler.linear(scale)), child: child!),
          home: const Scaffold(body: SingleChildScrollView(child: XinobiUFeature())),
        ));
        await tester.pumpAndSettle();
        final product = tester.getRect(find.byKey(const ValueKey('home-personalization-product')));
        final questions = tester.getRect(find.byKey(const ValueKey('home-personalization-questions')));
        final artwork = tester.getRect(find.byKey(const ValueKey('home-personalization-artwork')));
        final panel = tester.getRect(find.byKey(const ValueKey('home-personalization-preview')));
        expect(product.overlaps(questions), isFalse);
        expect(product.overlaps(artwork), isFalse);
        expect(questions.top, greaterThan(product.bottom));
        expect(artwork.left, greaterThan(questions.right));
        expect(artwork.bottom, closeTo(questions.bottom, .01));
        for (final rect in [product, questions, artwork]) {
          expect(rect.left, greaterThanOrEqualTo(panel.left));
          expect(rect.right, lessThanOrEqualTo(panel.right));
          expect(rect.bottom, lessThanOrEqualTo(panel.bottom));
        }
        expect(find.text('Temsilidir'), findsOneWidget);
        expect(tester.takeException(), isNull);
        if (Platform.environment['XINOBI_CAPTURE_HOME'] == '1' && width == 390 && scale == 1) {
          await tester.pumpAndSettle();
          await expectLater(find.byType(XinobiUFeature), matchesGoldenFile('/tmp/xinobi-flutter-home-preview.png'));
        }
      });
    }
  }
  testWidgets('home design CTA still opens the real design entry', (tester) async {
    final router = GoRouter(routes: [
      GoRoute(path: '/', builder: (_, _) => const Scaffold(body: SingleChildScrollView(child: XinobiUFeature()))),
      GoRoute(path: '/xinobi-u', builder: (_, _) => const Scaffold(body: Text('Design entry'))),
    ]);
    addTearDown(router.dispose);
    await tester.pumpWidget(MaterialApp.router(routerConfig: router, theme: buildTheme()));
    await tester.tap(find.text('Tasarımını keşfet'));
    await tester.pumpAndSettle();
    expect(find.text('Design entry'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
