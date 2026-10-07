import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../../widgets/xinobi_header.dart';
import '../catalog/catalog_repository.dart';

/// XINOBI U entry: lists every personalizable product (K-18). The question flow is the next mobile task.
class XinobiUScreen extends ConsumerWidget {
  const XinobiUScreen({super.key});

  static const query = ProductQuery(personalizable: true);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider(query));
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: const XinobiHeader(),
      body: CustomScrollView(slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 24, XinobiTokens.gutterMobile, 16),
          sliver: SliverToBoxAdapter(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Semantics(header: true, child: Text('XINOBI U', style: text.headlineSmall)),
              const SizedBox(height: 6),
              Text('Bir ürün. Binlerce olasılık. Kişiselleştirmek istediğin ürünü seç.', style: text.bodyMedium),
            ]),
          ),
        ),
        ...products.when(
          loading: () => [const SliverFillRemaining(hasScrollBody: false, child: LoadingView())],
          error: (error, _) => [SliverFillRemaining(hasScrollBody: false, child: ErrorView(error: error, onRetry: () => ref.invalidate(productsProvider(query))))],
          data: (page) => page.items.isEmpty
              ? [const SliverFillRemaining(hasScrollBody: false, child: EmptyView('Şu anda kişiselleştirilebilir ürün yok.'))]
              : [
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 0, XinobiTokens.gutterMobile, 32),
                    sliver: productGrid(page.items.toList()),
                  ),
                ],
        ),
      ]),
    );
  }
}
