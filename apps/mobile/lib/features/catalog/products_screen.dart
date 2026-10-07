import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../../widgets/xinobi_header.dart';
import 'catalog_repository.dart';

class ProductsScreen extends ConsumerStatefulWidget {
  const ProductsScreen({super.key, this.initialCategory, this.focusSearch = false});
  final String? initialCategory;
  final bool focusSearch;

  @override
  ConsumerState<ProductsScreen> createState() => _ProductsScreenState();
}

class _ProductsScreenState extends ConsumerState<ProductsScreen> {
  late String? category = widget.initialCategory;
  String search = '';
  final searchField = TextEditingController();
  final searchFocus = FocusNode();
  Timer? debounce;

  @override
  void initState() {
    super.initState();
    if (widget.focusSearch) WidgetsBinding.instance.addPostFrameCallback((_) => searchFocus.requestFocus());
  }

  @override
  void didUpdateWidget(ProductsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initialCategory != oldWidget.initialCategory) setState(() => category = widget.initialCategory);
    if (widget.focusSearch && !oldWidget.focusSearch) searchFocus.requestFocus();
  }

  @override
  void dispose() {
    debounce?.cancel();
    searchField.dispose();
    searchFocus.dispose();
    super.dispose();
  }

  void onSearchChanged(String value) {
    debounce?.cancel();
    debounce = Timer(const Duration(milliseconds: 350), () => setState(() => search = value));
  }

  @override
  Widget build(BuildContext context) {
    final query = ProductQuery(category: category, search: search);
    final products = ref.watch(productsProvider(query));
    final categories = ref.watch(categoriesProvider).asData?.value.items.where((item) => item.productCount > 0).toList() ?? const [];
    return Scaffold(
      appBar: const XinobiHeader(),
      body: CustomScrollView(slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 20, XinobiTokens.gutterMobile, 8),
          sliver: SliverToBoxAdapter(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Semantics(header: true, child: Text('Ürünler', style: Theme.of(context).textTheme.headlineSmall)),
              const SizedBox(height: 12),
              TextField(
                controller: searchField,
                focusNode: searchFocus,
                onChanged: onSearchChanged,
                textInputAction: TextInputAction.search,
                decoration: InputDecoration(
                  labelText: 'Ürünlerde ara',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: XinobiTokens.surface,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(XinobiTokens.headerSearchRadius)),
                ),
              ),
              const SizedBox(height: 12),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(children: [
                  _chip('Tümü', category == null, () => setState(() => category = null)),
                  for (final item in categories) _chip(item.name, category == item.name, () => setState(() => category = item.name)),
                ]),
              ),
            ]),
          ),
        ),
        ...products.when(
          loading: () => [const SliverFillRemaining(hasScrollBody: false, child: LoadingView())],
          error: (error, _) => [
            SliverFillRemaining(hasScrollBody: false, child: ErrorView(error: error, onRetry: () => ref.invalidate(productsProvider(query))))
          ],
          data: (page) => page.items.isEmpty
              ? [const SliverFillRemaining(hasScrollBody: false, child: EmptyView('Aramanıza uygun ürün bulunamadı. Filtreleri değiştirip tekrar deneyin.'))]
              : [
                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: XinobiTokens.gutterMobile, vertical: 4),
                    sliver: SliverToBoxAdapter(
                      child: Semantics(liveRegion: true, child: Text('${page.total} ürün', style: Theme.of(context).textTheme.bodySmall)),
                    ),
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 8, XinobiTokens.gutterMobile, 32),
                    sliver: productGrid(page.items.toList()),
                  ),
                ],
        ),
      ]),
    );
  }

  Widget _chip(String label, bool selected, VoidCallback onTap) => Padding(
        padding: const EdgeInsets.only(right: 8),
        child: ChoiceChip(label: Text(label), selected: selected, onSelected: (_) => onTap()),
      );
}
