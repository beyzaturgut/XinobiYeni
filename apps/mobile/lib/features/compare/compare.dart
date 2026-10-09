import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../catalog/catalog_repository.dart';

/// Products picked for comparison, on this device (same key and limit as the web).
const compareStorageKey = 'xinobi-compare';
const maxCompare = 4;

class CompareController extends Notifier<List<String>> {
  @override
  List<String> build() {
    _load();
    return const [];
  }

  Future<void> _load() async {
    try {
      final rows = jsonDecode((await SharedPreferences.getInstance()).getString(compareStorageKey) ?? '[]');
      if (state.isEmpty && rows is List) state = List.unmodifiable(rows.whereType<String>().toSet().take(maxCompare));
    } on FormatException {
      // A damaged value starts an empty list.
    }
  }

  Future<void> _write(List<String> ids) async {
    state = List.unmodifiable(ids);
    await (await SharedPreferences.getInstance()).setString(compareStorageKey, jsonEncode(ids));
  }

  /// Returns false when the list is full and [productId] was not added.
  Future<bool> toggle(String productId) async {
    if (state.contains(productId)) {
      await _write(state.where((id) => id != productId).toList());
      return true;
    }
    if (state.length >= maxCompare) return false;
    await _write([...state, productId]);
    return true;
  }

  Future<void> clear() => _write(const []);
}

final compareProvider = NotifierProvider<CompareController, List<String>>(CompareController.new);

/// The compared products as published now; ones no longer published are dropped.
final compareItemsProvider = FutureProvider.autoDispose<List<ProductDetail>>((ref) async {
  final ids = ref.watch(compareProvider);
  final repository = ref.watch(catalogRepositoryProvider);
  final items = <ProductDetail>[];
  for (final id in ids) {
    try {
      items.add(await repository.product(id));
    } on CatalogException catch (error) {
      if (error.message != CatalogException.notFoundMessage) rethrow;
    }
  }
  return items;
});

/// Rating per product id; empty when reviews are unavailable.
final compareRatingsProvider = FutureProvider.autoDispose<Map<String, ReviewSummary>>((ref) async {
  final ids = ref.watch(compareProvider);
  if (ids.isEmpty) return const {};
  try {
    final list = await ref.watch(catalogRepositoryProvider).reviewSummaries(ids);
    return {for (final item in list.items) item.productId: item};
  } on CatalogException {
    return const {};
  }
});
