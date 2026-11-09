import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/features/xinobi_u/method_selection_screen.dart';

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

Future<GoRouter> pumpMethod(WidgetTester tester, {String? requested, bool v1Ready = true}) async {
  final router = GoRouter(
    initialLocation: '/method',
    routes: [
      GoRoute(path: '/method', builder: (_, _) => XinobiUMethodScreen(productId: 'P1', variantId: requested)),
      GoRoute(
        path: '/xinobi-u/kendi-gorselin',
        builder: (_, state) => Scaffold(body: Text('artwork:${state.uri.queryParameters['urun']}:${state.uri.queryParameters['renk']}:${state.uri.queryParameters['mod'] ?? ''}')),
      ),
      GoRoute(path: '/xinobi-u/anket', builder: (_, state) => Text('questionnaire:${state.uri.queryParameters['renk']}')),
    ],
  );
  addTearDown(router.dispose);
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        productProvider('P1').overrideWith((_) async => product()),
        singleSourceSurfaceProvider( 'P1').overrideWith((_) async => v1Ready? SingleSourceSurface(
                  productId: 'P1',
                  surfaceId: 'source-1-mask-${'a' * 32}',
                  sourceRevision: 1,
                  width: 317,
                  height: 213,
                  sourceSha256: 'a' * 64,
                  maskSha256: 'b' * 64,
                  sourceUrl: 'https://example.invalid/source.png',
                  maskUrl: 'https://example.invalid/mask.png',
                )
              : null,),
        acceptedSurfaceProvider((productId: 'P1', variantId: 'V2')).overrideWith((_) async => false),
      ],
      child: MaterialApp.router(routerConfig: router),
    ),
  );
  await tester.pumpAndSettle();
  return router;
}

Future<void> tapVisible(WidgetTester tester, Finder finder) async {
  await tester.scrollUntilVisible(finder, 200);
  await tester.tap(finder);
  await tester.pumpAndSettle();
}

void main() {
  testWidgets('the method step has no colour picker and opens the own image upload on its single approved product source', (tester) async {
    await pumpMethod(tester, requested: 'V2');
    expect(find.text('Tasarımını nasıl oluşturmak istersin?'), findsOneWidget);
    expect(find.bySemanticsLabel('Red rengini seç'), findsNothing);
    // Historical colour parameter cannot select a different source or a sale SKU.
    await tapVisible(tester, find.text('Görsel yükle →'));
    expect(find.text('artwork:P1:null:'), findsOneWidget);
    expect(find.textContaining('questionnaire'), findsNothing);
  });

  testWidgets('pattern and questionnaire methods keep the product identity', (tester) async {
    final router = await pumpMethod(tester, requested: 'V1');
    await tapVisible(tester, find.text('Kendi desenini yükle'));
    await tapVisible(tester, find.text('Desen yükle →'));
    expect(find.text('artwork:P1:null:desen'), findsOneWidget);
    router.pop();
    await tester.pumpAndSettle();
    await tapVisible(tester, find.text('Sorularla tasarla'));
    await tapVisible(tester, find.text('Sorulara başla →'));
    expect(find.text('questionnaire:null'), findsOneWidget);
  });

  testWidgets('a product without an approved source cannot continue', (tester) async {
    await pumpMethod(tester, v1Ready: false);
    await tester.scrollUntilVisible(find.text('Bu ürünün onaylı kişiselleştirme yüzeyi henüz hazır değil.'), 200);
    final button = find.widgetWithText(FilledButton, 'Kişiselleştirme kullanılamıyor');
    await tester.scrollUntilVisible(button, 200);
    expect(tester.widget<FilledButton>(button).onPressed, isNull);
  });
}
