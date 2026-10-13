import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/features/xinobi_u/variant_selection_screen.dart';

ProductDetail product() => ProductDetail(
  (b) => b
    ..id = 'P1'
    ..name = 'Test product'
    ..category = 'Tea'
    ..description = ''
    ..seoTitle = ''
    ..personalizable = true
    ..variants.addAll([
      VariantDetail(
        (v) => v
          ..id = 'V1'
          ..sku = '1'
          ..color = 'Navy'
          ..availability.status = 'in_stock'
          ..purchasable = true
          ..maxQuantity = 1,
      ),
      VariantDetail(
        (v) => v
          ..id = 'V2'
          ..sku = '2'
          ..color = 'Red'
          ..availability.status = 'in_stock'
          ..purchasable = true
          ..maxQuantity = 1,
      ),
    ]),
);

void main() {
  testWidgets(
    'choose a supported color then open artwork with exact identity, without questionnaire',
    (tester) async {
      final router = GoRouter(
        initialLocation: '/color',
        routes: [
          GoRoute(
            path: '/color',
            builder: (_, _) =>
                const XinobiUVariantSelectionScreen(productId: 'P1'),
          ),
          GoRoute(
            path: '/xinobi-u/kendi-gorselin',
            builder: (_, state) => Scaffold(
              body: Text(
                'artwork:${state.uri.queryParameters['urun']}:${state.uri.queryParameters['renk']}',
              ),
            ),
          ),
          GoRoute(
            path: '/xinobi-u/anket',
            builder: (_, _) => const Text('questionnaire'),
          ),
        ],
      );
      addTearDown(router.dispose);
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            productProvider('P1').overrideWith((_) async => product()),
            acceptedSurfaceProvider((productId: 'P1', variantId: 'V1'))
                .overrideWith((_) async => true),
            acceptedSurfaceProvider((productId: 'P1', variantId: 'V2'))
                .overrideWith((_) async => false),
          ],
          child: MaterialApp.router(routerConfig: router),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Kendi görselinizi ekleyin'), findsNothing);
      await tester.tap(find.bySemanticsLabel('Red rengini seç'));
      await tester.pumpAndSettle();
      final disabled = find.widgetWithText(
        OutlinedButton,
        'Kendi görselinizi ekleyin',
      );
      await tester.scrollUntilVisible(disabled, 200);
      expect(tester.widget<OutlinedButton>(disabled).onPressed, isNull);
      await tester.scrollUntilVisible(
        find.bySemanticsLabel('Navy rengini seç'),
        -200,
      );
      await tester.tap(find.bySemanticsLabel('Navy rengini seç'));
      await tester.pumpAndSettle();
      final button = find.widgetWithText(
        OutlinedButton,
        'Kendi görselinizi ekleyin',
      );
      await tester.scrollUntilVisible(button, 200);
      await tester.tap(button);
      await tester.pumpAndSettle();
      expect(find.text('artwork:P1:V1'), findsOneWidget);
      expect(find.text('questionnaire'), findsNothing);
    },
  );
}
