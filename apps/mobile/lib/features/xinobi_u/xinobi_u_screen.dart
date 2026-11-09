import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../../widgets/xinobi_header.dart';
import '../catalog/catalog_repository.dart';

/// XINOBI U first selects a product family; the method follows, and the colour is chosen on the placement preview.
class XinobiUScreen extends ConsumerWidget {
  const XinobiUScreen({super.key, this.editorEntry = false});

  final bool editorEntry;

  static const query = ProductQuery(personalizable: true);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider(query));
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: editorEntry
          ? AppBar(title: const Text('Tasarım editörü'))
          : const XinobiHeader(),
      body: CustomScrollView(
        slivers: [
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(
              XinobiTokens.gutterMobile,
              24,
              XinobiTokens.gutterMobile,
              16,
            ),
            sliver: SliverToBoxAdapter(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Semantics(
                    header: true,
                    child: Text(
                      editorEntry ? 'Tasarlamak için ürün seç' : 'XINOBI U',
                      style: text.headlineSmall,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Bir ürün. Binlerce olasılık. Önce ürününü, sonra tasarım yöntemini seç; yerleşimini önizlemede ayarla.',
                    style: text.bodyMedium,
                  ),
                ],
              ),
            ),
          ),
          ...products.when(
            loading: () => [
              const SliverFillRemaining(
                hasScrollBody: false,
                child: LoadingView(),
              ),
            ],
            error: (error, _) => [
              SliverFillRemaining(
                hasScrollBody: false,
                child: ErrorView(
                  error: error,
                  onRetry: () => ref.invalidate(productsProvider(query)),
                ),
              ),
            ],
            data: (page) => page.items.isEmpty
                ? [
                    const SliverFillRemaining(
                      hasScrollBody: false,
                      child: EmptyView(
                        'Şu anda kişiselleştirilebilir ürün yok.',
                      ),
                    ),
                  ]
                : [
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(
                        XinobiTokens.gutterMobile,
                        0,
                        XinobiTokens.gutterMobile,
                        24,
                      ),
                      sliver: productGrid(
                        page.items.toList(),
                        onTap: (product) => context.push(
                          '/xinobi-u/renk?urun=${Uri.encodeQueryComponent(product.id)}',
                        ),
                        showFavorite: true,
                        cardBuilder: (context, product) =>
                            _SingleSourceCard(product: product),footerBuilder: (context, product) => Text(
                          'XINOBI U ile kişiselleştir →',
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(fontWeight: FontWeight.w600),
                        ),
                        semanticsLabelBuilder: (product) =>
                            '${product.name}, XINOBI U ile kişiselleştir',
                      ),
                    ),
                  ],
          ),
        ],
      ),
    );
  }
}
class _SingleSourceCard extends ConsumerWidget {
  const _SingleSourceCard({required this.product});
  final ProductSummary product;
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final surface = ref.watch(singleSourceSurfaceProvider(product.id));
    final ready = surface.asData?.value;
    final message = surface.isLoading
        ? 'Ürün yüzeyi kontrol ediliyor…'
        : surface.hasError
        ? 'Ürün yüzeyi yüklenemedi.'
        : ready == null
        ? 'Onaylı yüzey henüz hazır değil.'
        : 'XINOBI U ile kişiselleştir →';
    return ProductCard(
      product: product,
      showColors: false,
      image: surface.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (_, _) => const Icon(Icons.broken_image_outlined),
        data: (value) => value == null
            ? const Icon(Icons.image_not_supported_outlined)
            : RemoteImage(value.sourceUrl, cacheWidth: 600),
      ),
      semanticsLabel: '${product.name}, $message',
      footer: Text(message,style:Theme.of(context).textTheme.bodySmall),
      onTap: () => context.push(
        '/xinobi-u/renk?urun=${Uri.encodeQueryComponent(product.id)}',
      ),
    );
  }
}
