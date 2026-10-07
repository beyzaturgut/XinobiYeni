import 'dart:io' show Platform;

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../core/api_config.dart';

/// Read access to the shared catalog contract (/api/v1/catalog, /api/v1/content). Web and mobile read the same data.
abstract interface class CatalogRepository {
  Future<HomeContent> home();
  Future<CategoryList> categories();
  Future<ProductPage> products(ProductQuery query);
  Future<ProductDetail> product(String id);
}

@immutable
class ProductQuery {
  const ProductQuery({this.category, this.search, this.personalizable});
  final String? category;
  final String? search;
  final bool? personalizable;

  @override
  bool operator ==(Object other) =>
      other is ProductQuery && other.category == category && other.search == search && other.personalizable == personalizable;

  @override
  int get hashCode => Object.hash(category, search, personalizable);
}

/// User-facing failure; [message] is safe to show, technical details stay out of the UI.
class CatalogException implements Exception {
  const CatalogException(this.message);
  final String message;
  @override
  String toString() => message;
}

class ApiCatalogRepository implements CatalogRepository {
  ApiCatalogRepository(XinobiApiClient client)
      : _catalog = client.getCatalogApi(),
        _content = client.getContentApi();

  final CatalogApi _catalog;
  final ContentApi _content;
  // The contract caps pageSize at 100; paging UI follows when catalogs grow past it.
  static const pageSize = 100;

  @override
  Future<HomeContent> home() => _call(() => _content.getHomeContent());

  @override
  Future<CategoryList> categories() => _call(() => _catalog.listCatalogCategories());

  @override
  Future<ProductPage> products(ProductQuery query) => _call(() => _catalog.listCatalogProducts(
        category: query.category,
        q: (query.search?.trim().isEmpty ?? true) ? null : query.search!.trim(),
        personalizable: query.personalizable,
        pageSize: pageSize,
      ));

  @override
  Future<ProductDetail> product(String id) => _call(() => _catalog.getCatalogProduct(id: id), notFound: 'Bu ürün artık yayında değil.');

  Future<T> _call<T>(Future<Response<T>> Function() request, {String? notFound}) async {
    try {
      final data = (await request()).data;
      if (data == null) throw const CatalogException('Beklenmeyen boş yanıt alındı.');
      return data;
    } on DioException catch (error) {
      final status = error.response?.statusCode;
      if (status == 404 && notFound != null) throw CatalogException(notFound);
      if (status == 503) throw const CatalogException('Katalog şu anda kullanılamıyor. Biraz sonra tekrar deneyin.');
      throw const CatalogException('Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.');
    }
  }
}

final apiClientProvider = Provider<XinobiApiClient>((ref) => XinobiApiClient(
      basePathOverride: apiBaseUrl(isAndroid: !kIsWeb && Platform.isAndroid),
      // Auth interceptors are added with real sign-in (Faz03 03.03, ADR-004).
      interceptors: const [],
    ));

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) => ApiCatalogRepository(ref.watch(apiClientProvider)));

final homeProvider = FutureProvider<HomeContent>((ref) => ref.watch(catalogRepositoryProvider).home());
final categoriesProvider = FutureProvider<CategoryList>((ref) => ref.watch(catalogRepositoryProvider).categories());
final productsProvider = FutureProvider.family<ProductPage, ProductQuery>((ref, query) => ref.watch(catalogRepositoryProvider).products(query));
final productProvider = FutureProvider.family<ProductDetail, String>((ref, id) => ref.watch(catalogRepositoryProvider).product(id));
