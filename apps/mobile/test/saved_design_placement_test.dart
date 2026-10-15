import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/cart/cart.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/features/designs/designs.dart';
import 'package:xinobi_mobile/features/personalization/design_placement_store.dart';
import 'package:xinobi_mobile/features/personalization/surface_preview.dart';
import 'cart_test.dart' show CartCatalog;

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));
  const placement = DesignPlacement.place(scale: .63, rotation: .41, offset: Offset(.12, -.18));

  test('saved photo placement survives a new read and stays bound to its design/product/colour', () async {
    await DesignPlacementStore.save('photo', 'P1', 'V1', placement);
    expect((await DesignPlacementStore.load('photo', 'P1', 'V1'))!.toJson(), placement.toJson());
    expect(await DesignPlacementStore.load('photo', 'P1', 'V2'), isNull);
    expect(await DesignPlacementStore.load('another-photo', 'P1', 'V1'), isNull);
  });

  testWidgets('adding a saved photo from My Designs recovers its placement and persists it in the cart', (tester) async {
    await DesignPlacementStore.save('photo', 'P1', 'V1', placement);
    final design = MyDesign((b) => b
      ..id = 'photo'
      ..kind = 'upload'
      ..name = 'Fotoğraf'
      ..productId = 'P1'
      ..productName = 'Çay Makinesi 101'
      ..variantId = 'V1'
      ..imageUrl = '/api/v1/me/designs/photo/image'
      ..createdAt = DateTime.utc(2026));
    final router = GoRouter(routes: [GoRoute(path: '/', builder: (_, _) => Scaffold(body: Consumer(builder: (context, ref, _) => TextButton(
      onPressed: () => addDesignToCart(context, ref, design), child: const Text('Ekle'),
    ))))]);
    addTearDown(router.dispose);
    await tester.pumpWidget(ProviderScope(overrides: [catalogRepositoryProvider.overrideWithValue(CartCatalog())], child: MaterialApp.router(routerConfig: router)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Ekle'));
    await tester.pumpAndSettle();
    final stored = (await SharedPreferences.getInstance()).getString(cartStorageKey);
    expect(parseCart(stored).single.designPlacement!.toJson(), placement.toJson());
  });
}
