import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../catalog/catalog_repository.dart';

/// Same storage as the web (`xinobi-demo-favorites`): product ids on this device only, newest first.
/// Moves to the account with the SQL store; until then favourites are not shared between web and mobile.
const favoritesStorageKey = 'xinobi-demo-favorites';
const maxFavorites = 200;

List<String> parseFavorites(String? raw) {
  try {
    final rows = jsonDecode(raw ?? '[]');
    if (rows is! List) return [];
    return rows.whereType<String>().where((id) => id.isNotEmpty).toSet().take(maxFavorites).toList();
  } on FormatException {
    return [];
  }
}

class FavoritesController extends Notifier<List<String>> {
  @override
  List<String> build() {
    _load();
    return const [];
  }

  Future<void> _load() async {
    final stored = parseFavorites((await SharedPreferences.getInstance()).getString(favoritesStorageKey));
    if (state.isEmpty) state = stored;
  }

  Future<void> _write(List<String> ids) async {
    state = List.unmodifiable(ids);
    await (await SharedPreferences.getInstance()).setString(favoritesStorageKey, jsonEncode(ids));
  }

  /// Returns true when the product is a favourite afterwards.
  Future<bool> toggle(String productId) async {
    if (state.contains(productId)) {
      await _write(state.where((id) => id != productId).toList());
      return false;
    }
    // The oldest favourite drops off instead of refusing the newest.
    await _write([productId, ...state].take(maxFavorites).toList());
    return true;
  }

  Future<void> clear() => _write(const []);
}

final favoritesProvider = NotifierProvider<FavoritesController, List<String>>(FavoritesController.new);
final isFavoriteProvider = Provider.family<bool, String>((ref, id) => ref.watch(favoritesProvider).contains(id));

/// A favourite resolved against the live catalog; [product] is null when the product is no longer published.
typedef FavoriteItem = ({String id, ProductDetail? product});

final favoriteItemsProvider = FutureProvider<List<FavoriteItem>>((ref) async {
  final ids = ref.watch(favoritesProvider);
  final repository = ref.watch(catalogRepositoryProvider);
  final items = <FavoriteItem>[];
  for (final id in ids) {
    try {
      items.add((id: id, product: await repository.product(id)));
    } on CatalogException catch (error) {
      if (error.message != CatalogException.notFoundMessage) rethrow;
      items.add((id: id, product: null));
    }
  }
  return items;
});
