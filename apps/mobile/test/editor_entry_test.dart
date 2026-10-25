import 'package:go_router/go_router.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_mobile/app/router.dart';
import 'package:xinobi_mobile/features/account/auth.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/features/designs/designs.dart';

import 'app_test.dart' show FakeCatalog;
import 'account_test.dart' show MemoryTokens;

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));
  testWidgets(
    'My Designs editor action opens a visible product picker without redirecting into the tab shell',
    (tester) async {
      final router = buildRouter(initialLocation: '/hesap/tasarimlarim');
      addTearDown(router.dispose);
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            tokenStoreProvider.overrideWithValue(MemoryTokens()),
            catalogRepositoryProvider.overrideWithValue(FakeCatalog()),
            myDesignsProvider.overrideWith((_) async => []),
          ],
          child: MaterialApp.router(routerConfig: router),
        ),
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Editörde tasarla'));
      await tester.pumpAndSettle();
      expect(find.text('Tasarım editörü'), findsOneWidget);
      expect(find.text('Tasarlamak için ürün seç'), findsOneWidget);
      expect(find.text('Çay Makinesi 101'), findsOneWidget);
      expect(
        GoRouterState.of(tester.element(find.text('Tasarım editörü'))).uri.path,
        '/tasarim-editoru',
      );
      expect(tester.takeException(), isNull);
      await tester.tap(find.text('Çay Makinesi 101'));
      await tester.pumpAndSettle();
      expect(
        find.text('Tasarımını nasıl oluşturmak istersin?'),
        findsOneWidget,
      );
    },
  );
}
