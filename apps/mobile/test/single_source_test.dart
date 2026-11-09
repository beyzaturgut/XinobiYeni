import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/features/xinobi_u/method_selection_screen.dart';
import 'package:xinobi_mobile/features/xinobi_u/xinobi_u_repository.dart';
import 'package:xinobi_mobile/main.dart' show noAutomaticRetry;

import 'package:xinobi_mobile/features/xinobi_u/questionnaire_screen.dart';
import 'xinobi_u_test.dart' show FakeXinobiU;
import 'app_test.dart' show FakeCatalog;
import 'own_image_entry_test.dart' show product;

Map<String, Object?> bundle({
  String product = 'P1',
  int revision = 1,
  int width = 5001,
  int height = 4000,
}) {
  final id = 'source-$revision-mask-${'c' * 32}',
      sourceHash = 'a' * 64,
      maskHash = 'b' * 64;
  return {
    'schemaVersion': 1,
    'scope': 'single-source-preview',
    'productReference': product,
    'sourceRevision': revision,
    'surfaceId': id,
    'inputs': {
      'width': width,
      'height': height,
      'surfaceVersion': maskHash,
      'sourceMediaVersion': sourceHash,
      'brandingRequired': false,
      'branding': null,
      'source': {
        'url': '/api/v1/product-surfaces/$product/$id/source?v=$sourceHash',
        'sha256': sourceHash,
      },
      'mask': {
        'url': '/api/v1/product-surfaces/$product/$id/mask?v=$maskHash',
        'sha256': maskHash,
      },
    },
  };
}

SingleSourceSurface parse(Map<String, Object?> value) =>
    SingleSourceSurface.fromContract(
      standardSerializers.deserializeWith(
        SingleSourcePublication.serializer,
        value,
      )!,
      'P1',
      Uri.parse('https://api.example.test'),
    );

class SurfaceAdapter implements HttpClientAdapter {
  int status = 200;
  Object? body = bundle();
  final requests = <RequestOptions>[];
  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? stream,
    Future<void>? cancel,
  ) async {
    requests.add(options);
    return ResponseBody.fromString(
      jsonEncode(body),
      status,
      headers: {
        'content-type': ['application/json'],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

Future<GoRouter> pumpMethod(
  WidgetTester tester, {
  required Future<SingleSourceSurface?> Function() load,
  TargetPlatform platform = TargetPlatform.android,
  double width = 390,
  double textScale = 1,
  bool eligible = true,
}) async {
  tester.view.physicalSize = Size(width, 1100);
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final router = GoRouter(
    initialLocation: '/method',
    routes: [
      GoRoute(
        path: '/method',
        builder: (_, _) => const XinobiUMethodScreen(
          productId: 'P1',
          variantId: 'obsolete-colour',
        ),
      ),
      GoRoute(
        path: '/xinobi-u/kendi-gorselin',
        builder: (_, state) => Scaffold(body: Text(state.uri.toString())),
      ),
      GoRoute(
        path: '/xinobi-u/anket',
        builder: (_, state) => Scaffold(body: Text(state.uri.toString())),
      ),
    ],
  );
  addTearDown(router.dispose);
  await tester.pumpWidget(
    ProviderScope(
      retry: noAutomaticRetry,
      overrides: [
        productProvider('P1').overrideWith(
          (_) async => product().rebuild((b) => b.personalizable = eligible),
        ),
        singleSourceSurfaceProvider('P1').overrideWith((_) => load()),
      ],
      child: MaterialApp.router(
        theme: ThemeData(platform: platform),
        routerConfig: router,
        builder: (context, child) => MediaQuery(
          data: MediaQuery.of(context)
              .copyWith(textScaler: TextScaler.linear(textScale)),
          child: child!,
        ),
      ),
    ),
  );
  await tester.pump();
  return router;
}

void main() {
  setUp(() => SharedPreferences.setMockInitialValues({}));
  test('strict publication preserves actual canvas, source identity and independent checksums', () {
    final value = parse(bundle());
    expect(value.width, 5001);
    expect(value.height, 4000);
    expect(value.sourceSha256, 'a' * 64);
    expect(value.maskSha256, 'b' * 64);
    expect(
      value.sourceUrl,
      startsWith('https://api.example.test/api/v1/product-surfaces/P1/'),
    );
    expect(parse(bundle(width: 7001, height: 5)).aspectRatio, 7001 / 5);
    expect(parse(bundle(revision: 2)).cacheKey, isNot(value.cacheKey));
  });
  test('different product, foreign media, mixed hash and unsupported metadata are rejected', () {
    for (final value in [
      bundle(product: 'other'),
      {...bundle(), 'scope': 'representative-preview'},
      {...bundle(), 'schemaVersion': 2},
      bundle(width: 0),
    ]) {
      expect(() => parse(value), throwsFormatException);
    }
    final foreign = bundle();
    final inputs = foreign['inputs']! as Map;
    inputs['mask'] = {'url': 'https://external.test/mask', 'sha256': 'b' * 64};
    expect(() => parse(foreign), throwsFormatException);
    final mixed = bundle();
    (mixed['inputs']! as Map)['sourceMediaVersion'] = 'b' * 64;
    expect(() => parse(mixed), throwsFormatException);
  });
  test('repository distinguishes 404, service failure and corrupt response without legacy fallback', () async {
    final adapter = SurfaceAdapter(),
        dio = Dio(BaseOptions(baseUrl: 'https://api.example.test'))
          ..httpClientAdapter = adapter;
    final repository = ApiCatalogRepository(
      XinobiApiClient(dio: dio, interceptors: const []),
    );
    expect((await repository.singleSourceSurface('P1'))!.width, 5001);
    adapter.status = 404;
    expect(await repository.singleSourceSurface('P1'), isNull);
    adapter.status = 503;
    await expectLater(
      repository.singleSourceSurface('P1'),
      throwsA(isA<CatalogException>()),
    );
    adapter.status = 200;
    adapter.body = bundle(product: 'other');
    await expectLater(
      repository.singleSourceSurface('P1'),
      throwsA(isA<CatalogException>()),
    );
    expect(
      adapter.requests,
      everyElement(
        isA<RequestOptions>().having(
          (r) => r.path,
          'path',
          '/api/v1/product-surfaces/P1/rendering-inputs',
        ),
      ),
    );
    expect(adapter.requests.map((r) => r.method), everyElement('GET'));
  });
  test('source-version sessions survive restart, never read old variant keys and isolate products', () async {
    SharedPreferences.setMockInitialValues({
      'xinobi-u-session:P1:V1': 'old-session',
    });
    final store = XinobiULocalStore(SharedPreferences.getInstance()),
        one = parse(bundle()),
        two = parse(bundle(revision: 2));
    expect(await store.surfaceSession('P1', one.cacheKey), isNull);
    await store.rememberSurfaceSession('P1', one.cacheKey, 'session-one');
    await store.saveAnswers('session-one', {'q1': 'a1'});
    final restarted = XinobiULocalStore(SharedPreferences.getInstance());
    expect(await restarted.surfaceSession('P1', one.cacheKey), 'session-one');
    expect(await restarted.answers('session-one'), {'q1': 'a1'});
    expect(await restarted.surfaceSession('P1', two.cacheKey), isNull);
    expect(await restarted.surfaceSession('P2', one.cacheKey), isNull);
    expect(await restarted.sessionFor('P1', 'V1'), 'old-session');
  });
  testWidgets(
    'loading is distinct; no fallback colour becomes available while a surface request is pending',
    (tester) async {
      final pending = Completer<SingleSourceSurface?>();
      await pumpMethod(tester, load: () => pending.future);
      await tester.pump();
      expect(find.text('Kontrol ediliyor…'), findsWidgets);
      expect(find.text('Görsel yükle →'), findsNothing);
      pending.complete(parse(bundle()));
      await tester.pumpAndSettle();
      expect(find.text('Görsel yükle →'), findsOneWidget);
    },
  );
  testWidgets(
    'surface failure retries and null means not approved; method selection survives retry',
    (tester) async {
      var failed = true;
      await pumpMethod(
        tester,
        load: () async {
          if (failed) throw const CatalogException('Fixture service error');
          return parse(bundle());
        },
      );
      await tester.pumpAndSettle();
      expect(find.text('Tekrar dene'), findsOneWidget);
      await tester.scrollUntilVisible(find.text('Kendi desenini yükle'), 100);
      await Scrollable.ensureVisible(
        tester.element(find.text('Kendi desenini yükle')),
        alignment: 0.25,
      );
      await tester.pumpAndSettle();
      await tester.tap(find.text('Kendi desenini yükle'));
      await tester.pumpAndSettle();
      failed = false;
      await tester.tap(find.text('Tekrar dene'));
      await tester.pumpAndSettle();
      expect(find.text('Desen yükle →'), findsOneWidget);
    },
  );
  testWidgets('product without an approved surface cannot continue', (
    tester,
  ) async {
    await pumpMethod(tester, load: () async => null);
    await tester.pumpAndSettle();
    expect(
      tester
          .widget<FilledButton>(
            find.widgetWithText(FilledButton, 'Kişiselleştirme kullanılamıyor'),
          )
          .onPressed,
      isNull,
    );
  });
  for (final platform in [TargetPlatform.android, TargetPlatform.iOS]) {
    for (final width in [320.0, 390.0, 768.0]) {
      testWidgets(
        '${platform.name} method is colour-free at $width and 200 percent text',
        (tester) async {
          await pumpMethod(
            tester,
            platform: platform,
            width: width,
            textScale: 2,
            load: () async => parse(bundle()),
          );
          await tester.pumpAndSettle();
          expect(find.byType(ChoiceChip), findsNothing);
          expect(tester.takeException(), isNull);
          await tester.tap(find.text('Görsel yükle →'));
          await tester.pumpAndSettle();
          expect(find.text('/xinobi-u/kendi-gorselin?urun=P1'), findsOneWidget);
          expect(tester.takeException(), isNull);
        },
      );
    }
  }
  testWidgets(
    'ordinary source selection never reads a normal catalog variant mask',
    (tester) async {
      final catalog = FakeCatalog();
      expect(
        await catalog.publishedSurface(productId: 'P1', variantId: 'V1'),
        isNull,
      );
      await pumpMethod(tester, load: () async => parse(bundle()));
      await tester.pumpAndSettle();
      await tester.scrollUntilVisible(find.text('Sorularla tasarla'), 100);
      await tester.tap(find.text('Sorularla tasarla'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Sorulara başla →'));
      await tester.pumpAndSettle();
      expect(find.text('/xinobi-u/anket?urun=P1'), findsOneWidget);
    },
  );
  testWidgets('leaving while product loads cannot start a session or read a disposed ref',(tester)async{
    final pending=Completer<ProductDetail>(),fake=FakeXinobiU();
    await tester.pumpWidget(ProviderScope(retry:noAutomaticRetry,overrides:[
      productProvider('P1').overrideWith((_)=>pending.future),
      singleSourceSurfaceProvider('P1').overrideWith((_)async=>parse(bundle())),
      xinobiURepositoryProvider.overrideWithValue(fake),
    ],child:const MaterialApp(home:QuestionnaireScreen(productId:'P1'))));
    await tester.pump();await tester.pumpWidget(const SizedBox());pending.complete(product());
    await tester.pumpAndSettle();expect(fake.created,0);expect(tester.takeException(),isNull);
  });
}
