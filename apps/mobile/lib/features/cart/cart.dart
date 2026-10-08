import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../catalog/catalog_repository.dart';

/// Same shape and limits as the web cart (`xinobi-cart-v1`): variant lines, 1–99 each, at most 100 lines, stored on this device.
/// Prices and stock always come from the current catalog; checkout (Faz05) re-checks them on the server.
class CartLine {
  const CartLine({required this.productId, required this.variantId, required this.quantity});
  final String productId;
  final String variantId;
  final int quantity;

  CartLine withQuantity(int value) => CartLine(productId: productId, variantId: variantId, quantity: value);
  bool same(String product, String variant) => productId == product && variantId == variant;
  Map<String, Object> toJson() => {'productId': productId, 'variantId': variantId, 'quantity': quantity};
}

class CartException implements Exception {
  const CartException(this.message);
  final String message;
  @override
  String toString() => message;
}

const cartStorageKey = 'xinobi-cart-v1';
const maxCartLines = 100;
const maxLineQuantity = 99;

List<CartLine> parseCart(String? raw) {
  try {
    final rows = jsonDecode(raw ?? '[]');
    if (rows is! List) return [];
    return rows
        .whereType<Map>()
        .where((row) => row['productId'] is String && row['variantId'] is String && row['quantity'] is int && row['quantity'] > 0 && row['quantity'] <= maxLineQuantity)
        .take(maxCartLines)
        .map((row) => CartLine(productId: row['productId'] as String, variantId: row['variantId'] as String, quantity: row['quantity'] as int))
        .toList();
  } on FormatException {
    return [];
  }
}

class CartController extends Notifier<List<CartLine>> {
  @override
  List<CartLine> build() {
    _load();
    return const [];
  }

  Future<void> _load() async {
    final stored = parseCart((await SharedPreferences.getInstance()).getString(cartStorageKey));
    // Only adopt the stored cart if nothing changed in the meantime.
    if (state.isEmpty) state = stored;
  }

  Future<void> _write(List<CartLine> lines) async {
    state = List.unmodifiable(lines);
    await (await SharedPreferences.getInstance()).setString(cartStorageKey, jsonEncode(lines.map((line) => line.toJson()).toList()));
  }

  /// Adds one unit; [maxQuantity] is the contract's per-variant limit (stock, capped at 99).
  Future<void> add(String productId, String variantId, int maxQuantity) async {
    final existing = state.where((line) => line.same(productId, variantId)).firstOrNull;
    final limit = maxQuantity.clamp(0, maxLineQuantity);
    if ((existing?.quantity ?? 0) >= limit) throw const CartException('Bu renk için sepetteki adet mevcut stok sınırına ulaştı.');
    if (existing == null && state.length >= maxCartLines) throw const CartException('Sepette en fazla 100 farklı ürün olabilir.');
    await _write(existing == null
        ? [...state, CartLine(productId: productId, variantId: variantId, quantity: 1)]
        : [for (final line in state) line.same(productId, variantId) ? line.withQuantity(line.quantity + 1) : line]);
  }

  Future<void> setQuantity(String productId, String variantId, int quantity) async {
    if (quantity < 0 || quantity > maxLineQuantity) throw const CartException('Geçerli adet girin.');
    await _write(quantity == 0
        ? state.where((line) => !line.same(productId, variantId)).toList()
        : [for (final line in state) line.same(productId, variantId) ? line.withQuantity(quantity) : line]);
  }

  Future<void> remove(String productId, String variantId) => setQuantity(productId, variantId, 0);

  /// After a placed order.
  Future<void> clear() => _write(const []);
}

final cartProvider = NotifierProvider<CartController, List<CartLine>>(CartController.new);
final cartCountProvider = Provider<int>((ref) => ref.watch(cartProvider).fold(0, (sum, line) => sum + line.quantity));

enum CartProblem { none, productGone, variantGone, noPrice, outOfStock, overStock }

class CartItem {
  const CartItem({required this.line, this.product, this.variant, required this.problem});
  final CartLine line;
  final ProductDetail? product;
  final VariantDetail? variant;
  final CartProblem problem;

  int get lineTotalMinor => problem == CartProblem.none ? variant!.price!.amountMinor * line.quantity : 0;

  String? get problemText => switch (problem) {
        CartProblem.none => null,
        CartProblem.productGone => 'Bu ürün artık yayında değil. Sepetten çıkar.',
        CartProblem.variantGone => 'Bu renk artık satışta değil. Sepetten çıkar.',
        CartProblem.noPrice => 'Bu renk için fiyat tanımlanmadı; şu anda satın alınamaz.',
        CartProblem.outOfStock => 'Bu renk stokta yok. Sepetten çıkar.',
        CartProblem.overStock => 'Stokta en fazla ${variant!.maxQuantity} adet var. Adedi azalt.',
      };
}

CartItem resolveCartLine(CartLine line, ProductDetail? product) {
  if (product == null) return CartItem(line: line, problem: CartProblem.productGone);
  final variant = product.variants.where((item) => item.id == line.variantId).firstOrNull;
  if (variant == null) return CartItem(line: line, product: product, problem: CartProblem.variantGone);
  final problem = variant.price == null
      ? CartProblem.noPrice
      : variant.maxQuantity <= 0
          ? CartProblem.outOfStock
          : line.quantity > variant.maxQuantity
              ? CartProblem.overStock
              : CartProblem.none;
  return CartItem(line: line, product: product, variant: variant, problem: problem);
}

/// Resolves every line against the live catalog; a product that 404s marks its lines as gone instead of failing the cart.
final cartItemsProvider = FutureProvider<List<CartItem>>((ref) async {
  final lines = ref.watch(cartProvider);
  final repository = ref.watch(catalogRepositoryProvider);
  final products = <String, ProductDetail?>{};
  for (final id in lines.map((line) => line.productId).toSet()) {
    try {
      products[id] = await repository.product(id);
    } on CatalogException catch (error) {
      if (error.message != CatalogException.notFoundMessage) rethrow;
      products[id] = null;
    }
  }
  return [for (final line in lines) resolveCartLine(line, products[line.productId])];
});
