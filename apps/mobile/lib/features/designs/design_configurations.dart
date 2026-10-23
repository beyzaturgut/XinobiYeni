import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import '../account/auth.dart';
import '../personalization/native_commerce_bridge.dart';
import 'designs.dart';

final designConfigurationsProvider = FutureProvider.autoDispose<List<MyDesignConfiguration>>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return [];
  final reply = await ref.read(nativeCommerceBridgeProvider).account({'path': '/me/design-configurations', 'method': 'GET'});
  if (reply['status'] != 200) throw const AccountException('designs_unavailable', 'Tasarım yerleşimleri yüklenemedi.');
  return (reply['body'] as List).map((item) => standardSerializers.deserializeWith(MyDesignConfiguration.serializer, item)!).toList();
});

String configurationPreviewPath(String id, int revision) => '/api/v1/me/design-configurations/${Uri.encodeComponent(id)}/revisions/$revision/preview';

class ConfigurationPreview extends ConsumerWidget {
  const ConfigurationPreview({super.key, required this.configurationId, required this.revision, required this.label, required this.fallback});
  final String configurationId, label;
  final int revision;
  final Widget fallback;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ref.watch(designImageProvider(configurationPreviewPath(configurationId, revision))).when(
      loading: () => const SizedBox.expand(),
      error: (_, _) => fallback,
      data: (image) => image == null ? fallback : Image(image: image, fit: BoxFit.contain, semanticLabel: label, errorBuilder: (_, _, _) => fallback),
    );
  }
}

class PersonalizedFavorites extends ConsumerWidget {
  const PersonalizedFavorites({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (ref.watch(authProvider) is! SignedIn) return const SizedBox.shrink();
    return ref.watch(designConfigurationsProvider).when(
      loading: () => const Padding(padding: EdgeInsets.all(16), child: LinearProgressIndicator()),
      error: (_, _) => TextButton(onPressed: () => ref.invalidate(designConfigurationsProvider), child: const Text('Tasarım favorilerini yeniden yükle')),
      data: (items) => Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Padding(padding: EdgeInsets.all(16), child: Text('Tasarım favorilerim')),
        if (!items.any((item) => item.favorite)) const Padding(padding: EdgeInsets.all(16), child: Text('Önizlemede “Favorilere ekle” ile kişisel tasarımlarını saklayabilirsin.')),
        for (final item in items.where((item) => item.favorite)) ListTile(
          leading: SizedBox(width: 72, height: 72, child: ConfigurationPreview(configurationId: item.id, revision: item.revision, label: 'Kişisel tasarımın, düzenlemek için aç', fallback: PrivateDesignImage(path: designImagePath(item.designId), label: 'Tasarım'))),
          title: Text(ref.watch(myDesignsProvider).value?.where((design) => design.id == item.designId).firstOrNull?.name ?? 'Kişisel tasarım'),
          subtitle: const Text('Önizle ve düzenle'),
          onTap: () => context.push(Uri(path: '/tasarim-editoru', queryParameters: {'tasarim': item.designId, 'urun': item.productId, 'renk': item.variantId, 'configuration': item.id, 'revision': '${item.revision}'}).toString()),
          trailing: IconButton(tooltip: 'Tasarımı favorilerden çıkar', icon: const Icon(Icons.favorite), onPressed: () async {
            try {
            final reply = await ref.read(nativeCommerceBridgeProvider).account({'path': '/me/design-configurations/${item.id}/favorite', 'method': 'PUT', 'body': {'favorite': false}});
            if (reply['status'] == 204) { ref.invalidate(designConfigurationsProvider); }
            else if (context.mounted) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Favori kaldırılamadı. Yeniden deneyin.'))); }
            } catch (_) { if (context.mounted) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Favori kaldırılamadı. Yeniden deneyin.'))); } }
          }),
        ),
      ]),
    );
  }
}
