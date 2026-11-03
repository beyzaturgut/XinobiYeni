import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../account/auth.dart';
import '../catalog/catalog_repository.dart';

/// Where earlier builds kept favourites on the device (the web's old key too). They move to the account at the next
/// sign-in, like the web does with its old browser list, and the key is removed afterwards.
const favoritesStorageKey = 'xinobi-demo-favorites';
const maxFavorites = 200;
const favoritesSignInMessage = 'Favorilere eklemek için giriş yap.';

List<String> parseFavorites(String? raw) {
  try {
    final rows = jsonDecode(raw ?? '[]');
    if (rows is! List) return [];
    return rows.whereType<String>().where((id) => id.isNotEmpty).toSet().take(maxFavorites).toList();
  } on FormatException {
    return [];
  }
}

/// The account's favourite product ids (/api/v1/me/favorites), the same list the web shows; empty when signed out.
class FavoritesController extends AsyncNotifier<List<String>> {
  AuthController get _session => ref.read(authProvider.notifier);

  @override
  Future<List<String>> build() async {
    // Only a different account reloads the list, not a profile refresh of the same one.
    final account = ref.watch(authProvider.select((state) => state is SignedIn ? state.profile.id : null));
    if (account == null) return const [];
    await _moveDeviceFavorites();
    return await _session.withSession((repository, token) => repository.favorites(token)) ?? const [];
  }

  Future<void> _moveDeviceFavorites() async {
    final preferences = await SharedPreferences.getInstance();
    if (!preferences.containsKey(favoritesStorageKey)) return;
    for (final id in parseFavorites(preferences.getString(favoritesStorageKey))) {
      try {
        await _session.withSession((repository, token) => repository.addFavorite(token, id));
      } on AccountException catch (error) {
        // An unpublished product cannot be a favourite any more; anything else keeps the list for the next try.
        if (error.code != 'product_not_found') rethrow;
      }
    }
    await preferences.remove(favoritesStorageKey);
  }

  /// Returns true when the product is a favourite afterwards. Throws [AccountException], `sign_in_required` when signed out.
  Future<bool> toggle(String productId) async {
    if (ref.read(authProvider) is! SignedIn) throw const AccountException('sign_in_required', favoritesSignInMessage);
    final remove = (state.value ?? const []).contains(productId);
    await _session.withSession((repository, token) => remove ? repository.deleteFavorite(token, productId) : repository.addFavorite(token, productId));
    final current = state.value ?? const [];
    state = AsyncData(List.unmodifiable(remove ? current.where((id) => id != productId) : [...current.where((id) => id != productId), productId]));
    return !remove;
  }

  Future<void> clear() async {
    try {
      for (final id in [...?state.value]) {
        await _session.withSession((repository, token) => repository.deleteFavorite(token, id));
      }
      state = const AsyncData([]);
    } on AccountException {
      // Part of the list may be gone; show what the account really holds.
      ref.invalidateSelf();
      rethrow;
    }
  }
}

final favoritesProvider = AsyncNotifierProvider<FavoritesController, List<String>>(FavoritesController.new);
final isFavoriteProvider = Provider.family<bool, String>((ref, id) => ref.watch(favoritesProvider).value?.contains(id) ?? false);

/// A favourite resolved against the live catalog; [product] is null when the product is no longer published.
typedef FavoriteItem = ({String id, ProductDetail? product});

final favoriteItemsProvider = FutureProvider<List<FavoriteItem>>((ref) async {
  final ids = await ref.watch(favoritesProvider.future);
  final repository = ref.watch(catalogRepositoryProvider);
  final items = <FavoriteItem>[];
  // Newest first, as the list grows at the end.
  for (final id in ids.reversed) {
    try {
      items.add((id: id, product: await repository.product(id)));
    } on CatalogException catch (error) {
      if (error.message != CatalogException.notFoundMessage) rethrow;
      items.add((id: id, product: null));
    }
  }
  return items;
});

/// Opens sign-in above the current page and comes back to it once signed in. True when signed in afterwards.
Future<bool> signInAbove(BuildContext context, WidgetRef ref) async {
  final subscription = ref.listenManual(authProvider, (previous, next) {
    if (next is SignedIn && context.mounted && context.canPop()) context.pop();
  });
  try {
    await context.push('/giris');
  } finally {
    subscription.close();
  }
  return ref.read(authProvider) is SignedIn;
}

/// The heart's action everywhere: signed out it explains and opens sign-in (the web sends to /hesap), then saves the
/// product; a failed request is reported instead of silently leaving the heart as it was.
Future<void> toggleFavorite(BuildContext context, WidgetRef ref, String productId) async {
  final messenger = ScaffoldMessenger.of(context);
  void show(String message) => messenger
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(content: Text(message)));
  try {
    if (ref.read(authProvider) is! SignedIn) {
      show(favoritesSignInMessage);
      if (!await signInAbove(context, ref)) return;
      if ((await ref.read(favoritesProvider.future)).contains(productId)) return;
    }
    show(await ref.read(favoritesProvider.notifier).toggle(productId) ? 'Favorilere eklendi.' : 'Favorilerden çıkarıldı.');
  } on AccountException catch (error) {
    show(error.message);
  }
}
