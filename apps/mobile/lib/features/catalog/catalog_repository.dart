import 'dart:io' show Platform;

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../core/api_config.dart';
import '../../core/user_facing_error.dart';

/// Read access to the shared catalog contract (/api/v1/catalog, /api/v1/content). Web and mobile read the same data.
abstract interface class CatalogRepository {
  Future<HomeContent> home();
  Future<CategoryList> categories();
  Future<ProductPage> products(ProductQuery query);
  Future<ProductDetail> product(String id);
  Future<bool?> acceptedPreviewAvailable({required String productId, required String variantId});
  /// The published approved surface of a colour (product photo and mask aligned to it), or null when there is none.
  Future<PublishedSurface?> publishedSurface({required String productId, required String variantId});
  Future<AnnouncementList> announcements();
  Future<ReviewPage> reviews(String productId, {int page = 1});
  Future<ReviewSummaryList> reviewSummaries(List<String> productIds);
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

/// A colour's approved surface as the web package publishes it: the product photo and the mask drawn on it.
@immutable
class PublishedSurface {
  const PublishedSurface({required this.sourceUrl, required this.maskUrl});
  final String sourceUrl;
  final String maskUrl;
}

/// User-facing failure; [message] is safe to show, technical details stay out of the UI.
class CatalogException implements UserFacingException {
  const CatalogException(this.message);
  @override
  final String message;
  static const notFoundMessage = 'Bu ürün artık yayında değil.';
  @override
  String toString() => message;
}

class ApiCatalogRepository implements CatalogRepository {
  ApiCatalogRepository(XinobiApiClient client)
      : _catalog = client.getCatalogApi(),
        _content = client.getContentApi(),
        _preview = Dio(BaseOptions(connectTimeout: const Duration(seconds: 5), receiveTimeout: const Duration(seconds: 10)));

  final CatalogApi _catalog;
  final ContentApi _content;
  final Dio _preview;
  // The contract caps pageSize at 100; paging UI follows when catalogs grow past it.
  static const pageSize = 100;

  @override
  Future<HomeContent> home() => _call(() => _content.getHomeContent());

  @override
  Future<AnnouncementList> announcements() => _call(() => _content.listAnnouncements());

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
  Future<ReviewPage> reviews(String productId, {int page = 1}) => _call(() => _catalog.listProductReviews(id: productId, page: page));

  @override
  Future<ReviewSummaryList> reviewSummaries(List<String> productIds) => _call(() => _catalog.listReviewSummaries(ids: productIds.join(',')));

  @override
  Future<ProductDetail> product(String id) => _call(() => _catalog.getCatalogProduct(id: id), notFound: CatalogException.notFoundMessage);

  @override
  Future<bool?> acceptedPreviewAvailable({required String productId, required String variantId}) async {
    final uri = xinobiAcceptedSurfaceUri(productId: productId, variantId: variantId);
    if (uri == null) return null;
    try {
      final response = await _preview.getUri(uri);
      final body = response.data;
      if (response.statusCode == 200 &&
          body is Map &&
          body['productReference'] == productId &&
          body['variantReference'] == variantId &&
          body['previewAvailable'] == true &&
          body['inputs'] is Map) {
        return true;
      }
    } on DioException {
      // The development check runs only beside the QA tools; the published bundle below answers everywhere else.
    }
    try {
      return await publishedSurface(productId: productId, variantId: variantId) != null;
    } on DioException {
      return null;
    }
  }

  @override
  Future<PublishedSurface?> publishedSurface({required String productId, required String variantId}) async {
    final uri = xinobiPublishedSurfaceUri(productId: productId, variantId: variantId);
    if (uri == null) return null;
    final Response<dynamic> response;
    try {
      response = await _preview.getUri(uri);
    } on DioException catch (error) {
      if (error.response?.statusCode == 404) return null;
      rethrow;
    }
    final body = response.data;
    if (response.statusCode != 200 || body is! Map) return null;
    final inputs = body['inputs'];
    if (body['scope'] != 'representative-preview' || body['productReference'] != productId || body['variantReference'] != variantId || inputs is! Map) return null;
    final source = inputs['source'], mask = inputs['mask'];
    final prefix = '/assets/product-previews/$productId/$variantId/';
    String? url(Object? item) => item is Map && item['url'] is String && (item['url'] as String).startsWith(prefix) ? uri.resolve(item['url'] as String).toString() : null;
    final sourceUrl = url(source), maskUrl = url(mask);
    return sourceUrl == null || maskUrl == null ? null : PublishedSurface(sourceUrl: sourceUrl, maskUrl: maskUrl);
  }

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
      // The generated 3 s receive timeout is too short for calls that wait on SMTP (e-mail verification); same limit as the web.
      dio: Dio(BaseOptions(
        baseUrl: apiBaseUrl(isAndroid: !kIsWeb && Platform.isAndroid),
        connectTimeout: const Duration(seconds: 5),
        receiveTimeout: const Duration(seconds: 20),
      )),
      // Auth interceptors are added with real sign-in (Faz03 03.03, ADR-004).
      interceptors: const [],
    ));

final catalogRepositoryProvider = Provider<CatalogRepository>((ref) => ApiCatalogRepository(ref.watch(apiClientProvider)));

final homeProvider = FutureProvider<HomeContent>((ref) => ref.watch(catalogRepositoryProvider).home());
final categoriesProvider = FutureProvider<CategoryList>((ref) => ref.watch(catalogRepositoryProvider).categories());
final productsProvider = FutureProvider.family<ProductPage, ProductQuery>((ref, query) => ref.watch(catalogRepositoryProvider).products(query));
final productProvider = FutureProvider.family<ProductDetail, String>((ref, id) => ref.watch(catalogRepositoryProvider).product(id));
/// First page of approved reviews with the rating summary; null where reviews are unavailable (they are optional on the page).
final productReviewsProvider = FutureProvider.autoDispose.family<ReviewPage?, String>((ref, id) async {
  try {
    return await ref.watch(catalogRepositoryProvider).reviews(id);
  } on CatalogException {
    return null;
  }
});
final acceptedSurfaceProvider = FutureProvider.family<bool?, ({String productId, String variantId})>((ref, key) => ref.watch(catalogRepositoryProvider).acceptedPreviewAvailable(productId: key.productId, variantId: key.variantId));
/// A colour's published approved surface; null when it has none or the web origin is not configured.
final publishedSurfaceProvider = FutureProvider.family<PublishedSurface?, ({String productId, String variantId})>((ref, key) async {
  try {
    return await ref.watch(catalogRepositoryProvider).publishedSurface(productId: key.productId, variantId: key.variantId);
  } on DioException {
    return null;
  }
});
