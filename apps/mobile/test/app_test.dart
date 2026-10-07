import 'package:built_collection/built_collection.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/catalog/catalog_repository.dart';
import 'package:xinobi_mobile/main.dart';

Money _try(int minor) => Money((b) => b
  ..amountMinor = minor
  ..currency = 'TRY');

ProductSummary _summary(String id, String name, String category, {int? price, bool inStock = true, int colors = 1}) => ProductSummary((b) => b
  ..id = id
  ..name = name
  ..category = category
  ..description = ''
  ..personalizable = category.contains('Çay')
  ..colorCount = colors
  ..priceFrom = price == null ? null : _try(price).toBuilder()
  ..inStock = inStock);

final _tea = _summary('P1', 'Çay Makinesi 101', 'Çay makineleri', price: 240000, colors: 2);
final _coffee = _summary('P2', 'Kahve Makinesi 101', 'Kahve makineleri', inStock: false);

VariantDetail _variant(String id, String color, String hex, {int? price, required String status, int? remaining}) => VariantDetail((b) => b
  ..id = id
  ..sku = id
  ..color = color
  ..hex = hex
  ..price = price == null ? null : _try(price).toBuilder()
  ..availability.status = status
  ..availability.remaining = remaining
  ..purchasable = price != null && status != 'out_of_stock'
  ..maxQuantity = status == 'out_of_stock' ? 0 : (remaining ?? 8));

class FakeCatalog implements CatalogRepository {
  int homeCalls = 0;
  bool failHome = false;
  final queries = <ProductQuery>[];
  List<AnnouncementItem> news = [];

  @override
  Future<AnnouncementList> announcements() async => AnnouncementList((b) => b.items.addAll(news));

  @override
  Future<HomeContent> home() async {
    homeCalls++;
    if (failHome) throw const CatalogException('Katalog şu anda kullanılamıyor. Biraz sonra tekrar deneyin.');
    return HomeContent((b) => b
      ..accentColor = '#0B6C68'
      ..categories.add(CategoryHighlight((c) => c
        ..category = 'Çay makineleri'
        ..imageAlt = 'Çay Makinesi 101 · Lacivert'
        ..productCount = 1
        ..description = ''))
      ..featuredProducts.addAll([_tea, _coffee]));
  }

  @override
  Future<CategoryList> categories() async => CategoryList((b) => b.items.addAll([
        CategoryItem((c) => c
          ..name = 'Çay makineleri'
          ..productCount = 1),
        CategoryItem((c) => c
          ..name = 'Kahve makineleri'
          ..productCount = 1),
      ]));

  @override
  Future<ProductPage> products(ProductQuery query) async {
    queries.add(query);
    final items = [_tea, _coffee].where((p) => query.category == null || p.category == query.category).where((p) => query.personalizable != true || p.personalizable);
    return ProductPage((b) => b
      ..items = ListBuilder<ProductSummary>(items)
      ..page = 1
      ..pageSize = 100
      ..total = items.length);
  }

  @override
  Future<ProductDetail> product(String id) async => ProductDetail((b) => b
    ..id = 'P1'
    ..name = 'Çay Makinesi 101'
    ..category = 'Çay makineleri'
    ..description = 'Örnek ürün açıklaması'
    ..seoTitle = ''
    ..personalizable = true
    ..variants.addAll([
      _variant('V1', 'Lacivert', '#1D2B4F', price: 240000, status: 'in_stock'),
      _variant('V2', 'Kırmızı', '#B3261E', status: 'low_stock', remaining: 2),
    ]));
}

Future<FakeCatalog> pumpApp(WidgetTester tester, {String location = '/', FakeCatalog? catalog}) async {
  final fake = catalog ?? FakeCatalog();
  // Phone-sized viewport (390×844 pt), like the web's mobile checks.
  tester.view.physicalSize = const Size(1170, 2532);
  tester.view.devicePixelRatio = 3;
  addTearDown(tester.view.reset);
  await tester.pumpWidget(ProviderScope(
    retry: noAutomaticRetry,
    overrides: [catalogRepositoryProvider.overrideWithValue(fake)],
    child: XinobiApp(initialLocation: location),
  ));
  await tester.pumpAndSettle();
  return fake;
}

void main() {
  testWidgets('home shows categories and featured products from the contract', (tester) async {
    await pumpApp(tester);
    // Same sections and copy as the web home.
    expect(find.text('Sen anlat.\nAI tasarlasın.'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Çay makineleri'), 300, scrollable: find.byType(Scrollable).first);
    // Screen readers can activate merged tiles, not just see them.
    expect(tester.getSemantics(find.bySemanticsLabel('Çay makineleri, 1 ürün')), isSemantics(isButton: true, hasTapAction: true));
    await tester.scrollUntilVisible(find.text('Form ve işlev, tek çizgide.'), 300, scrollable: find.byType(Scrollable).first);
    expect(find.text('ÖNE ÇIKANLAR'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Çay Makinesi 101'), 200, scrollable: find.byType(Scrollable).first);
    expect(find.text('₺2.400,00'), findsOneWidget);
    expect(find.text('• 2 renk'), findsOneWidget);
    expect(find.text('Kahve Makinesi 101'), findsOneWidget, reason: 'The second featured card sits next to the first.');
    expect(tester.getSemantics(find.bySemanticsLabel('Çay Makinesi 101, ₺2.400,00')), isSemantics(isButton: true, hasTapAction: true));
    await tester.scrollUntilVisible(find.text('Teknoloji görünür olmak için değil, hayatınıza uyum sağlamak için.'), 300, scrollable: find.byType(Scrollable).first);
    expect(find.text('Ürün merkezli'), findsOneWidget);
    expect(find.text('Ana sayfa'), findsOneWidget);
    expect(find.text('XINOBI U'), findsWidgets);
  });

  testWidgets('home failure offers a working retry', (tester) async {
    final fake = FakeCatalog()..failHome = true;
    await pumpApp(tester, catalog: fake);
    expect(find.text('Katalog şu anda kullanılamıyor. Biraz sonra tekrar deneyin.'), findsOneWidget);
    fake.failHome = false;
    await tester.tap(find.text('Tekrar dene'));
    await tester.pumpAndSettle();
    expect(fake.homeCalls, 2);
    expect(find.text('ÖNE ÇIKANLAR'), findsNothing, reason: 'Below the fold; the page loaded instead of the error.');
    expect(find.text('Sen anlat.\nAI tasarlasın.'), findsOneWidget);
  });

  testWidgets('product list filters by category chip', (tester) async {
    final fake = await pumpApp(tester, location: '/urunler');
    expect(find.text('2 ürün'), findsOneWidget);
    final coffee = find.widgetWithText(ChoiceChip, 'Kahve makineleri');
    await tester.ensureVisible(coffee);
    await tester.pumpAndSettle();
    await tester.tap(coffee);
    await tester.pumpAndSettle();
    expect(find.text('1 ürün'), findsOneWidget);
    expect(fake.queries.last.category, 'Kahve makineleri');
  });

  testWidgets('XINOBI U lists only personalizable products', (tester) async {
    final fake = await pumpApp(tester, location: '/xinobi-u');
    expect(fake.queries.last.personalizable, isTrue);
    expect(find.text('Çay Makinesi 101'), findsOneWidget);
    expect(find.text('Kahve Makinesi 101'), findsNothing);
  });

  testWidgets('product detail switches price and stock with the selected colour', (tester) async {
    await pumpApp(tester, location: '/urunler/P1');
    expect(find.text('₺2.400,00'), findsOneWidget);
    expect(find.text('Stokta'), findsOneWidget);
    expect(tester.getSemantics(find.bySemanticsLabel('Kırmızı rengini seç')), isSemantics(isButton: true, hasTapAction: true, isSelected: false));
    await tester.tap(find.bySemanticsLabel('Kırmızı rengini seç'));
    await tester.pumpAndSettle();
    expect(find.text('Renk: Kırmızı'), findsOneWidget);
    expect(find.text('Fiyat tanımlanmadı'), findsOneWidget);
    expect(find.text('Son 2 ürün'), findsOneWidget);
    expect(find.text('Bu renk için henüz fiyat tanımlanmadı.'), findsOneWidget);
  });
}
