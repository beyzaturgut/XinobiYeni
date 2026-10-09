import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../account/account_widgets.dart';
import '../account/auth.dart';

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
    final controller = TextEditingController(text: design.name);
    final name = await showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Yeniden adlandır'),
        content: TextField(controller: controller, maxLength: 60, autofocus: true, decoration: accountField('Tasarım adı')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Vazgeç')),
          FilledButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Kaydet')),
        ],
      ),
    );
    controller.dispose();
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
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(maxCrossAxisExtent: 240, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.62),
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
