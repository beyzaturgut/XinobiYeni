import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart' hide DesignPlacement;

import '../catalog/catalog_repository.dart';
import '../personalization/surface_preview.dart';

/// Same shape and limits as the web cart (`xinobi-cart-v1`): variant lines, 1–99 each, at most 100 lines, stored on this device.
/// [designId]/[designName] make a personalised line with one of the customer's saved designs; the same colour with another design
/// (or none) is a separate line. Prices and stock always come from the current catalog; checkout re-checks them on the server.
class CartLine {
  const CartLine({required this.productId, required this.variantId, required this.quantity, this.designId, this.designName, this.designPlacement});
  final String productId;
  final String variantId;
  final int quantity;
  final String? designId;
  final String? designName;
  final DesignPlacement? designPlacement;

  CartLine withQuantity(int value, {DesignPlacement? placement}) => CartLine(productId: productId, variantId: variantId, quantity: value, designId: designId, designName: designName, designPlacement: placement ?? designPlacement);
  bool same(String product, String variant, [String? design]) => productId == product && variantId == variant && designId == design;
  Map<String, Object> toJson() => {
        'productId': productId,
        'variantId': variantId,
        'quantity': quantity,
        'designId': ?designId,
        'designName': ?designName,
        'designPlacement': ?designPlacement?.toJson(),
      };
}

/// Units of one colour across all its lines; stock limits the colour, not each design.
int variantUnits(List<CartLine> lines, String variantId) => lines.where((line) => line.variantId == variantId).fold(0, (sum, line) => sum + line.quantity);

class CartException implements Exception {
  const CartException(this.message);
  final String message;
  @override
  String toString() => message;
}

const cartStorageKey = 'xinobi-cart-v1';
const maxCartLines = 100;
const maxLineQuantity = 99;

bool _text(Object? value, int max) => value is String && value.isNotEmpty && value.length <= max;

List<CartLine> parseCart(String? raw) {
  try {
    final rows = jsonDecode(raw ?? '[]');
    if (rows is! List) return [];
    return rows
        .whereType<Map>()
        .where((row) => row['productId'] is String && row['variantId'] is String && row['quantity'] is int && row['quantity'] > 0 && row['quantity'] <= maxLineQuantity)
        .where((row) => row['designId'] == null || (_text(row['designId'], 64) && _text(row['designName'], 60)))
        .take(maxCartLines)
        .map((row) => CartLine(
            productId: row['productId'] as String,
            variantId: row['variantId'] as String,
            quantity: row['quantity'] as int,
            designId: row['designId'] as String?,
            designName: row['designName'] as String?,
            designPlacement: DesignPlacement.fromJson(row['designPlacement'])))
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

  /// Adds [quantity] units (one by default); [maxQuantity] is the contract's per-variant limit (stock, capped at 99), shared by all lines of the colour.
  Future<void> add(String productId, String variantId, int maxQuantity, {String? designId, String? designName, DesignPlacement? designPlacement, int quantity = 1}) async {
    if (quantity < 1 || quantity > maxLineQuantity) throw const CartException('Geçerli adet girin.');
    final existing = state.where((line) => line.same(productId, variantId, designId)).firstOrNull;
    final limit = maxQuantity.clamp(0, maxLineQuantity);
    if (variantUnits(state, variantId) + quantity > limit || (existing?.quantity ?? 0) + quantity > maxLineQuantity) {
      throw const CartException('Bu renk için sepetteki adet mevcut stok sınırına ulaştı.');
    }
    if (existing == null && state.length >= maxCartLines) throw const CartException('Sepette en fazla 100 farklı ürün olabilir.');
    await _write(existing == null
        ? [...state, CartLine(productId: productId, variantId: variantId, quantity: quantity, designId: designId, designName: designName, designPlacement: designPlacement)]
        : [for (final line in state) line.same(productId, variantId, designId) ? line.withQuantity(line.quantity + quantity, placement: designPlacement) : line]);
  }

  Future<void> setQuantity(String productId, String variantId, int quantity, {String? designId}) async {
    if (quantity < 0 || quantity > maxLineQuantity) throw const CartException('Geçerli adet girin.');
    await _write(quantity == 0
        ? state.where((line) => !line.same(productId, variantId, designId)).toList()
        : [for (final line in state) line.same(productId, variantId, designId) ? line.withQuantity(quantity) : line]);
  }

  Future<void> remove(String productId, String variantId, {String? designId}) => setQuantity(productId, variantId, 0, designId: designId);

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

/// [units] is how many of the line's colour the whole cart holds (several lines may share a colour).
CartItem resolveCartLine(CartLine line, ProductDetail? product, [int? units]) {
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
  return [for (final line in lines) resolveCartLine(line, products[line.productId], variantUnits(lines, line.variantId))];
});
