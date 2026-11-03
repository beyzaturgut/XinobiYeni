import 'dart:math' as math;
import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart' hide DesignPlacement;

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../account/account_widgets.dart';
import '../account/auth.dart';
import '../cart/cart.dart';
import '../catalog/catalog_repository.dart';
import '../personalization/surface_preview.dart';
import 'design_configurations.dart';
import '../personalization/design_placement_store.dart';

/// The account's saved designs (K-21), newest first; empty when signed out.
final myDesignsProvider = FutureProvider.autoDispose<List<MyDesign>>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return const [];
  return await ref.read(authProvider.notifier).withSession((repository, token) => repository.designs(token)) ?? const [];
});

/// Design images are private: the request carries the account's bearer token.
final designImageProvider = FutureProvider.autoDispose.family<ImageProvider?, String>((ref, path) async {
  if (ref.watch(authProvider) is! SignedIn) return null;
  return ref.read(authProvider.notifier).withSession((repository, token) async {
    try {
      final dio = ref.read(apiClientProvider).dio;
      final uri = Uri.parse(repository.designImageUrl(path));
      if (!['http', 'https'].contains(uri.scheme) || uri.origin != Uri.parse(dio.options.baseUrl).origin) throw const AccountException('invalid_image', 'Tasarım görseli adresi doğrulanamadı.');
      final response = await dio.get<List<int>>(uri.toString(), options: Options(responseType: ResponseType.bytes, headers: {'Authorization': 'Bearer $token'}));
      return MemoryImage(Uint8List.fromList(response.data!));
    } on DioException catch (error) {
      if (error.response?.statusCode == 401) throw const AccountException('unauthorized', 'Oturum sona erdi.');
      throw const AccountException('image_unavailable', 'Tasarım görseli yüklenemedi.');
    }
  });
});

String designImagePath(String id) => '/api/v1/me/designs/${Uri.encodeComponent(id)}/image';

/// Puts the design's product in [variantId], its own colour or the first one in stock into the cart; checkout re-checks
/// ownership, product and stock.
Future<void> addDesignToCart(BuildContext context, WidgetRef ref, MyDesign design, {String? variantId, DesignPlacement? placement}) async {
  final messenger = ScaffoldMessenger.of(context);
  final router = GoRouter.of(context);
  try {
    final product = await ref.read(catalogRepositoryProvider).product(design.productId);
    final variant = (variantId != null ? [variantId] : [design.variantId]).nonNulls.map((id) => product.variants.where((item) => item.id == id && item.maxQuantity > 0).firstOrNull).nonNulls.firstOrNull ??
        (placement != null || variantId != null ? null : product.variants.where((item) => item.maxQuantity > 0 && item.price != null).firstOrNull);
    if (variant == null) throw const CartException('Bu ürün şu anda stokta yok.');
    final selectedPlacement = placement ?? await DesignPlacementStore.load(design.id, product.id, variant.id);
    if (selectedPlacement != null) await DesignPlacementStore.save(design.id, product.id, variant.id, selectedPlacement);
    await ref.read(cartProvider.notifier).add(product.id, variant.id, variant.maxQuantity, designId: design.id, designName: design.name, designPlacement: selectedPlacement);
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
  const DesignOnProduct({super.key, required this.designId, required this.label, this.productId, this.variant, this.placement, this.configurationId, this.configurationRevision});
  final String designId;
  final String? configurationId;
  final int? configurationRevision;
  final String? productId;
  final String label;
  final VariantDetail? variant;
  final DesignPlacement? placement;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (configurationId != null && configurationRevision != null) { return ConfigurationPreview(
      configurationId: configurationId!, revision: configurationRevision!, label: label,
      fallback: DesignOnProduct(designId: designId, productId: productId, variant: variant, placement: placement, label: label),
    ); }
    final path = designImagePath(designId);
    final published = variant == null || variant!.surfaceMaskUrl != null || productId == null ? null : ref.watch(publishedSurfaceProvider((productId: productId!, variantId: variant!.id))).value;
    final product = variant?.surfaceMaskUrl != null ? variant?.imageUrl : published?.sourceUrl;
    final mask = variant?.surfaceMaskUrl ?? published?.maskUrl;
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
            placement: placement ?? (upload ? const DesignPlacement.place() : const DesignPlacement.cover()),
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
    final messenger = ScaffoldMessenger.of(context);
    final renamed = await showDialog<bool>(
      context: context,
      builder: (context) => _RenameDesignDialog(design: design),
    );
    if (renamed == true) messenger.showSnackBar(const SnackBar(content: Text('Tasarım adı güncellendi.')));
  }

  Future<void> _delete(BuildContext context, WidgetRef ref, MyDesign design) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('“${design.name}” silinsin mi?'),
        actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Vazgeç')), FilledButton(onPressed: () => Navigator.pop(context, true), child: const Text('Sil'))],
      ),
    );
    if (ok != true || !context.mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    try {
      await ref.read(authProvider.notifier).withSession((repository, token) => repository.deleteDesign(token, design.id));
      ref.invalidate(myDesignsProvider);
      messenger.showSnackBar(SnackBar(content: Text('“${design.name}” silindi.')));
    } on AccountException catch (error) {
      messenger.showSnackBar(SnackBar(content: Text(error.message)));
    }
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
            : LayoutBuilder(builder: (context, constraints) {
                // Columns of at least 160 px keep the three 48 px actions on one row (one column on a 320 px phone);
                // the square preview plus both two-line captions and the action row set the height at any text size.
                const spacing = 12.0, minTile = 160.0, maxTile = 240.0;
                final available = constraints.maxWidth - 2 * XinobiTokens.gutterMobile;
                final widest = ((available + spacing) / (maxTile + spacing)).ceil();
                final narrowest = ((available + spacing) / (minTile + spacing)).floor();
                final columns = math.max(1, math.min(widest, narrowest));
                final tile = (available - spacing * (columns - 1)) / columns;
                return GridView.builder(
                padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, XinobiTokens.gutterMobile, XinobiTokens.gutterMobile, 96),
                gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: columns, mainAxisSpacing: spacing, crossAxisSpacing: spacing, mainAxisExtent: tile + 80 * bodyTextFactor(context) + 64),
                itemCount: items.length,
                itemBuilder: (context, index) {
                  final design = items[index];
                  return Container(
                    decoration: BoxDecoration(border: Border.all(color: XinobiTokens.line), borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      AspectRatio(
                        aspectRatio: 1,
                        child: InkWell(onTap: () => context.push('/tasarim-editoru?tasarim=${design.id}&urun=${Uri.encodeQueryComponent(design.productId)}${design.variantId == null ? '' : '&renk=${Uri.encodeQueryComponent(design.variantId!)}'}'), child: Stack(fit: StackFit.expand, children: [
                          DesignImage(design: design),
                          Positioned(left: 6, bottom: 6, child: Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), color: XinobiTokens.surface, child: Text('Temsilidir', style: text.labelSmall))),
                        ])),
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
                        IconButton(tooltip: '${design.name} tasarımıyla sepete ekle', icon: const Icon(Icons.add_shopping_cart), onPressed: () => context.push('/tasarim-editoru?tasarim=${design.id}&urun=${Uri.encodeQueryComponent(design.productId)}${design.variantId == null ? '' : '&renk=${Uri.encodeQueryComponent(design.variantId!)}'}')),
                        // Rename and delete share a menu so each action keeps a 48 px target on a narrow phone.
                        PopupMenuButton<void Function()>(
                          tooltip: '${design.name} için diğer işlemler',
                          icon: const Icon(Icons.more_vert),
                          onSelected: (action) => action(),
                          itemBuilder: (_) => [
                            PopupMenuItem(value: () => _rename(context, ref, design), child: const ListTile(contentPadding: EdgeInsets.zero, leading: Icon(Icons.edit_outlined), title: Text('Yeniden adlandır'))),
                            PopupMenuItem(value: () => _delete(context, ref, design), child: const ListTile(contentPadding: EdgeInsets.zero, leading: Icon(Icons.delete_outline, color: XinobiTokens.danger), title: Text('Sil'))),
                          ],
                        ),
                      ]),
                    ]),
                  );
                },
              );
              }),
      ),
    );
  }
}

class _RenameDesignDialog extends ConsumerStatefulWidget {
  const _RenameDesignDialog({required this.design});
  final MyDesign design;
  @override
  ConsumerState<_RenameDesignDialog> createState() => _RenameDesignDialogState();
}

/// Saves inside the dialog, so a refused name stays editable with the reason under it instead of being lost.
class _RenameDesignDialogState extends ConsumerState<_RenameDesignDialog> {
  late final controller = TextEditingController(text: widget.design.name);
  bool busy = false;
  String? error;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  Future<void> save() async {
    final name = controller.text.trim();
    if (busy) return;
    if (name.isEmpty) {
      setState(() => error = 'Tasarım adı boş olamaz.');
      return;
    }
    if (name == widget.design.name) {
      Navigator.pop(context, false);
      return;
    }
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final saved = await ref.read(authProvider.notifier).withSession((repository, token) => repository.renameDesign(token, widget.design.id, name));
      ref.invalidate(myDesignsProvider);
      if (mounted) Navigator.pop(context, saved != null);
    } on AccountException catch (problem) {
      if (mounted) setState(() => error = problem.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: const Text('Yeniden adlandır'),
    content: Column(mainAxisSize: MainAxisSize.min, children: [
      TextField(controller: controller, maxLength: 60, autofocus: true, enabled: !busy, onSubmitted: (_) => save(), decoration: accountField('Tasarım adı')),
      FormErrorText(error),
    ]),
    actions: [
      TextButton(onPressed: busy ? null : () => Navigator.pop(context, false), child: const Text('Vazgeç')),
      FilledButton(onPressed: busy ? null : save, child: Text(busy ? 'Kaydediliyor…' : 'Kaydet')),
    ],
  );
}
