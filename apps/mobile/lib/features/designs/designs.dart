import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../account/account_widgets.dart';
import '../account/auth.dart';
import '../cart/cart.dart';
import '../catalog/catalog_repository.dart';
import '../personalization/surface_preview.dart';

/// The account's saved designs (K-21), newest first; empty when signed out.
final myDesignsProvider = FutureProvider.autoDispose<List<MyDesign>>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return const [];
  return await ref.read(authProvider.notifier).withSession((repository, token) => repository.designs(token)) ?? const [];
});

/// Design images are private: the request carries the account's bearer token.
final designImageProvider = FutureProvider.autoDispose.family<ImageProvider?, String>((ref, path) async {
  final token = await ref.read(authProvider.notifier).accessToken();
  if (token == null) return null;
  return NetworkImage(ref.read(accountRepositoryProvider).designImageUrl(path), headers: {'Authorization': 'Bearer $token'});
});

String designImagePath(String id) => '/api/v1/me/designs/${Uri.encodeComponent(id)}/image';

/// Puts the design's product in [variantId], its own colour or the first one in stock into the cart; checkout re-checks
/// ownership, product and stock.
Future<void> addDesignToCart(BuildContext context, WidgetRef ref, MyDesign design, {String? variantId}) async {
  final messenger = ScaffoldMessenger.of(context);
  final router = GoRouter.of(context);
  try {
    final product = await ref.read(catalogRepositoryProvider).product(design.productId);
    final variant = [variantId, design.variantId].nonNulls.map((id) => product.variants.where((item) => item.id == id && item.maxQuantity > 0).firstOrNull).nonNulls.firstOrNull ??
        product.variants.where((item) => item.maxQuantity > 0 && item.price != null).firstOrNull;
    if (variant == null) throw const CartException('Bu ürün şu anda stokta yok.');
    await ref.read(cartProvider.notifier).add(product.id, variant.id, variant.maxQuantity, designId: design.id, designName: design.name);
    messenger.showSnackBar(SnackBar(
      content: Text('“${design.name}” tasarımlı ${product.name} (${variant.color}) sepete eklendi.'),
      action: SnackBarAction(label: 'Sepete git', onPressed: () => router.go('/sepet')),
    ));
  } on CartException catch (error) {
    messenger.showSnackBar(SnackBar(content: Text(error.message)));
  } on CatalogException catch (error) {
    messenger.showSnackBar(SnackBar(content: Text(error.message)));
  }
}

/// A saved design worn on its colour's approved surface, placed as the editor starts (an AI pattern covers it, an uploaded
/// image sits at the default size); colours without an approved surface show the design itself. Labelled "Temsilidir".
class DesignOnProduct extends ConsumerWidget {
  const DesignOnProduct({super.key, required this.designId, required this.label, this.variant});
  final String designId;
  final String label;
  final VariantDetail? variant;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final path = designImagePath(designId);
    final product = variant?.imageUrl, mask = variant?.surfaceMaskUrl;
    final design = ref.watch(designImageProvider(path)).value;
    if (product == null || mask == null) return PrivateDesignImage(path: path, label: label);
    final upload = ref.watch(myDesignsProvider).value?.where((item) => item.id == designId).firstOrNull?.kind == 'upload';
    return Stack(fit: StackFit.expand, children: [
      if (design == null)
        const ColoredBox(color: XinobiTokens.mediaWarm)
      else
        Semantics(
          label: label,
          image: true,
          child: SurfacePreview(
            product: NetworkImage(product),
            design: design,
            mask: NetworkImage(mask),
            placement: upload ? const DesignPlacement.place() : const DesignPlacement.cover(),
            fallback: const ColoredBox(color: XinobiTokens.mediaWarm),
          ),
        ),
      Positioned(left: 2, bottom: 2, child: Container(padding: const EdgeInsets.symmetric(horizontal: 3), color: XinobiTokens.surface, child: Text('Temsilidir', style: Theme.of(context).textTheme.labelSmall?.copyWith(fontSize: 9)))),
    ]);
  }
}

/// A private design image by path (saved design or order line) with the "Temsilidir" label (K-12).
class PrivateDesignImage extends ConsumerWidget {
  const PrivateDesignImage({super.key, required this.path, required this.label});
  final String path;
  final String label;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final image = ref.watch(designImageProvider(path)).value;
    return Stack(fit: StackFit.expand, children: [
      image == null
          ? const ColoredBox(color: XinobiTokens.mediaWarm)
          : Image(image: image, fit: BoxFit.cover, semanticLabel: label, errorBuilder: (_, _, _) => const ColoredBox(color: XinobiTokens.mediaWarm)),
      Positioned(left: 2, bottom: 2, child: Container(padding: const EdgeInsets.symmetric(horizontal: 3), color: XinobiTokens.surface, child: Text('Temsilidir', style: Theme.of(context).textTheme.labelSmall?.copyWith(fontSize: 9)))),
    ]);
  }
}

class DesignImage extends ConsumerWidget {
  const DesignImage({super.key, required this.design, this.fit = BoxFit.cover});
  final MyDesign design;
  final BoxFit fit;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final image = ref.watch(designImageProvider(design.imageUrl)).value;
    return image == null
        ? const ColoredBox(color: XinobiTokens.mediaWarm)
        : Image(image: image, fit: fit, semanticLabel: design.name, errorBuilder: (_, _, _) => const ColoredBox(color: XinobiTokens.mediaWarm));
  }
}

/// /hesap/tasarimlarim
class DesignsScreen extends ConsumerWidget {
  const DesignsScreen({super.key});

  Future<void> _rename(BuildContext context, WidgetRef ref, MyDesign design) async {
    final name = await showDialog<String>(
      context: context,
      builder: (context) => _RenameDesignDialog(name: design.name),
    );
    if (name == null || name.isEmpty) return;
    await ref.read(authProvider.notifier).withSession((repository, token) => repository.renameDesign(token, design.id, name));
    ref.invalidate(myDesignsProvider);
  }

  Future<void> _delete(BuildContext context, WidgetRef ref, MyDesign design) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('“${design.name}” silinsin mi?'),
        actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Vazgeç')), FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Sil'))],
      ),
    );
    if (ok != true) return;
    await ref.read(authProvider.notifier).withSession((repository, token) => repository.deleteDesign(token, design.id));
    ref.invalidate(myDesignsProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final designs = ref.watch(myDesignsProvider);
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: accountBar('Tasarımlarım'),
      floatingActionButton: FloatingActionButton.extended(onPressed: () => context.push('/tasarim-editoru'), icon: const Icon(Icons.add_photo_alternate_outlined), label: const Text('Editörde tasarla')),
      body: designs.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(myDesignsProvider)),
        data: (items) => items.isEmpty
            ? const EmptyView('Henüz kayıtlı tasarımın yok. XINOBI U sonucunda ya da editörde “Tasarımımı kaydet” dediğinde burada görünür.')
            : GridView.builder(
                padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, XinobiTokens.gutterMobile, XinobiTokens.gutterMobile, 96),
                // Reserve room for both two-line captions and the action row,
                // including the device's accessibility text scale.
                gridDelegate: SliverGridDelegateWithMaxCrossAxisExtent(maxCrossAxisExtent: 240, mainAxisSpacing: 12, crossAxisSpacing: 12, mainAxisExtent: 240 + MediaQuery.textScalerOf(context).scale(80) + 64),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final design = items[index];
                  return Container(
                    decoration: BoxDecoration(border: Border.all(color: XinobiTokens.line), borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      AspectRatio(
                        aspectRatio: 1,
                        child: Stack(fit: StackFit.expand, children: [
                          DesignImage(design: design),
                          Positioned(left: 6, bottom: 6, child: Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), color: XinobiTokens.surface, child: Text('Temsilidir', style: text.labelSmall))),
                        ]),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(design.name, style: text.titleSmall, maxLines: 2, overflow: TextOverflow.ellipsis),
                          Text('${design.productName} · ${design.kind == 'ai' ? 'AI' : 'Kendi görselim'}', style: text.bodySmall, maxLines: 2, overflow: TextOverflow.ellipsis),
                        ]),
                      ),
                      const Spacer(),
                      Row(children: [
                        IconButton(tooltip: '${design.name} ürün üzerinde dene', icon: const Icon(Icons.view_in_ar_outlined), onPressed: () => context.push('/tasarim-editoru?tasarim=${design.id}&urun=${Uri.encodeQueryComponent(design.productId)}${design.variantId == null ? '' : '&renk=${Uri.encodeQueryComponent(design.variantId!)}'}')),
                        IconButton(tooltip: '${design.name} tasarımıyla sepete ekle', icon: const Icon(Icons.add_shopping_cart), onPressed: () => addDesignToCart(context, ref, design)),
                        IconButton(tooltip: '${design.name} yeniden adlandır', icon: const Icon(Icons.edit_outlined), onPressed: () => _rename(context, ref, design)),
                        IconButton(tooltip: '${design.name} sil', icon: const Icon(Icons.delete_outline), onPressed: () => _delete(context, ref, design)),
                      ]),
                    ]),
                  );
                },
              ),
      ),
    );
  }
}

class _RenameDesignDialog extends StatefulWidget {
  const _RenameDesignDialog({required this.name});
  final String name;
  @override
  State<_RenameDesignDialog> createState() => _RenameDesignDialogState();
}

class _RenameDesignDialogState extends State<_RenameDesignDialog> {
  late final controller = TextEditingController(text: widget.name);
  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
  @override
  Widget build(BuildContext context) => AlertDialog(
    title: const Text('Yeniden adlandır'),
    content: TextField(controller: controller, maxLength: 60, autofocus: true, decoration: accountField('Tasarım adı')),
    actions: [
      TextButton(onPressed: () => Navigator.pop(context), child: const Text('Vazgeç')),
      FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Kaydet')),
    ],
  );
}
