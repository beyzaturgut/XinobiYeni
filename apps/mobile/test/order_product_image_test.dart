import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/account/auth.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/features/account/order_product_image.dart';
import 'package:xinobi_mobile/features/designs/designs.dart';
import 'package:xinobi_mobile/features/designs/design_configurations.dart';

final preview = MemoryImage(
  base64Decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg==',
  ),
);
CustomerOrderLine orderLine() => CustomerOrderLine(
  (b) => b
    ..productId = 'P1'
    ..variantId = 'V1'
    ..name = 'Kişisel çay makinesi'
    ..color = 'Mavi'
    ..quantity = 1
    ..unitPrice.amountMinor = 100
    ..unitPrice.currency = 'TRY'
    ..lineTotal.amountMinor = 100
    ..lineTotal.currency = 'TRY'
    ..personalization.designId = 'design'
    ..personalization.kind = 'ai'
    ..personalization.name = 'Dalgalar'
    ..personalization.mime = 'image/png'
    ..personalization.imageUrl = '/api/v1/me/orders/order/lines/0/design'
    ..personalization.configurationId = 'config'
    ..personalization.configurationRevision = 1,
);

void main() {
  for (final failure in [false, true]) {
    testWidgets('legacy manifest requires its own snapshot (error=$failure)', (
      tester,
    ) async {
      final line = orderLine().rebuild(
        (b) => b.personalization
          ..schemaVersion = 1
          ..files = OrderDesignFiles(
            (f) => f.pattern
              ..sha256 = 'a' * 64
              ..mime = 'image/png'
              ..bytes = 10,
          ).toBuilder(),
      );
      var fallback = 0;
      await tester.pumpWidget(
        ProviderScope(
          retry: (_, _) => null,
          overrides: [
            designImageProvider(orderPreviewPath('order', 0))
                .overrideWith((_) async {
                  if (failure) {
                    throw const AccountException('unavailable', 'Unavailable');
                  }
                  return null;
                }),
            designImageProvider(configurationPreviewPath('config', 1))
                .overrideWith((_) async {
                  fallback++;
                  return preview;
                }),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: SizedBox(
                width: 250,
                height: 250,
                child: OrderProductImage(
                  orderId: 'order',
                  index: 0,
                  line: line,
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(Image), findsNothing);
      expect(fallback, 0);
      expect(
        find.textContaining('Güncel ürün veya tasarımla değiştirilmez.'),
        findsOneWidget,
      );
    });
    testWidgets(
      'schema-2 missing snapshot never reads live product or configuration (error=$failure)',
      (tester) async {
        final line = orderLine().rebuild(
          (b) => b.personalization.schemaVersion = 2,
        );
        var fallbacks = 0;
        await tester.pumpWidget(
          ProviderScope(
            retry: (_, _) => null,
            overrides: [
              designImageProvider(orderPreviewPath('order', 0)).overrideWith((
                _,
              ) async {
                if (failure) {
                  throw const AccountException('unavailable', 'Unavailable');
                }
                return null;
              }),
              designImageProvider(configurationPreviewPath('config', 1))
                  .overrideWith((_) async {
                    fallbacks++;
                    return preview;
                  }),
              productProvider('P1').overrideWith((_) async {
                fallbacks++;
                throw const CatalogException('Must not load current product');
              }),
            ],
            child: MaterialApp(
              home: Scaffold(
                body: SizedBox(
                  width: 250,
                  height: 250,
                  child: OrderProductImage(
                    orderId: 'order',
                    index: 0,
                    line: line,
                  ),
                ),
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(
          find.text(
            'Siparişteki tasarım önizlemesi alınamadı. Güncel ürün veya tasarımla değiştirilmez.',
          ),
          findsOneWidget,
        );
        expect(find.byType(Image), findsNothing);
        expect(fallbacks, 0);
      },
    );
  }
  testWidgets(
    'order thumbnail and zoom viewer use the composed product snapshot',
    (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            designImageProvider(orderPreviewPath('order', 0))
                .overrideWith((_) async => preview),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: OrderProductThumbnail(
                orderId: 'order',
                index: 0,
                line: orderLine(),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.widget<Image>(find.byType(Image)).image, same(preview));
      expect(find.byType(PrivateDesignImage), findsNothing);
      await tester.tap(find.byType(InkWell));
      await tester.pumpAndSettle();
      expect(find.byType(InteractiveViewer), findsOneWidget);
      expect(
        tester
            .widget<InteractiveViewer>(find.byType(InteractiveViewer))
            .maxScale,
        5,
      );
      expect(find.text('Kişisel çay makinesi'), findsOneWidget);
      expect(
        find.text('Yakınlaştırmak için iki parmağınla büyüt.'),
        findsOneWidget,
      );
      await tester.tap(find.byType(BackButton));
      await tester.pumpAndSettle();
      expect(find.byType(InteractiveViewer), findsNothing);
    },
  );

  testWidgets(
    'older order uses its exact saved configuration revision when no snapshot exists',
    (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            designImageProvider(orderPreviewPath('order', 0)).overrideWith(
              (_) async =>
                  throw const AccountException('not_found', 'Not found'),
            ),
            designImageProvider(configurationPreviewPath('config', 1))
                .overrideWith((_) async => preview),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: SizedBox(
                width: 100,
                height: 100,
                child: OrderProductImage(
                  orderId: 'order',
                  index: 0,
                  line: orderLine(),
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.widget<Image>(find.byType(Image)).image, same(preview));
      expect(find.byType(PrivateDesignImage), findsNothing);
    },
  );
  testWidgets(
    'missing historical composition is labelled instead of showing the raw pattern as the product',
    (tester) async {
      final line = orderLine().rebuild(
        (b) => b.personalization
          ..configurationId = null
          ..configurationRevision = null,
      );
      await tester.pumpWidget(
        ProviderScope(
          retry: (_, _) => null,
          overrides: [
            designImageProvider(orderPreviewPath('order', 0))
                .overrideWith((_) async => null),
            designImageProvider(line.personalization!.imageUrl!)
                .overrideWith((_) async => preview),
            productProvider('P1').overrideWith(
              (_) async => throw const CatalogException('Unavailable'),
            ),
          ],
          child: MaterialApp(
            home: Scaffold(
              body: SizedBox(
                width: 200,
                height: 200,
                child: OrderProductImage(
                  orderId: 'order',
                  index: 0,
                  line: line,
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(find.text('Tasarım önizlemesi mevcut değil'), findsOneWidget);
      expect(find.byType(PrivateDesignImage), findsNothing);
      expect(find.byType(Image), findsNothing);
    },
  );
}
