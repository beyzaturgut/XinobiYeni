import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../../widgets/xinobi_header.dart';
import '../catalog/catalog_repository.dart';

/// Home follows the web order (Analiz2 §5.1): slider → XINOBI U → categories → featured products.
///
/// Admin uploads wide desktop banners (~2.5:1) with text baked in; until a mobile image field exists (Faz04 slider media),
/// mobile shows them close to their own ratio so the text is not cropped.
const _bannerAspect = 2.4;

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final home = ref.watch(homeProvider);
    return Scaffold(
      appBar: XinobiHeader(onSearch: () => context.go('/urunler?ara=1')),
      body: home.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(homeProvider)),
        data: (content) => RefreshIndicator(
          onRefresh: () => ref.refresh(homeProvider.future),
          child: CustomScrollView(slivers: [
            if (content.slides.isNotEmpty) SliverToBoxAdapter(child: _Slider(slides: content.slides.toList())),
            if (content.xinobiUBannerUrl != null)
              SliverToBoxAdapter(
                child: Semantics(
                  button: true,
                  label: 'XINOBI U ile ürününü kişiselleştir',
                  onTap: () => context.go('/xinobi-u'),
                  excludeSemantics: true,
                  child: InkWell(
                    onTap: () => context.go('/xinobi-u'),
                    child: AspectRatio(aspectRatio: _bannerAspect, child: RemoteImage(content.xinobiUBannerUrl, fit: BoxFit.cover)),
                  ),
                ),
              ),
            if (content.categories.isNotEmpty) ...[
              _sectionTitle(context, 'Kategoriler'),
              SliverToBoxAdapter(child: _CategoryRail(categories: content.categories.toList())),
            ],
            if (content.featuredProducts.isNotEmpty) ...[
              _sectionTitle(context, 'Öne çıkanlar'),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 0, XinobiTokens.gutterMobile, 32),
                sliver: productGrid(content.featuredProducts.toList()),
              ),
            ],
          ]),
        ),
      ),
    );
  }

  Widget _sectionTitle(BuildContext context, String title) => SliverPadding(
        padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 28, XinobiTokens.gutterMobile, 12),
        sliver: SliverToBoxAdapter(child: Semantics(header: true, child: Text(title, style: Theme.of(context).textTheme.titleLarge))),
      );
}

class _Slider extends StatefulWidget {
  const _Slider({required this.slides});
  final List<HomeSlide> slides;
  @override
  State<_Slider> createState() => _SliderState();
}

class _SliderState extends State<_Slider> {
  final controller = PageController();
  var index = 0;

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Swipe-only: no autoplay, so reduced-motion users are never surprised (Faz02 slider rules).
    return Column(children: [
      AspectRatio(
        aspectRatio: _bannerAspect,
        child: PageView.builder(
          controller: controller,
          itemCount: widget.slides.length,
          onPageChanged: (value) => setState(() => index = value),
          itemBuilder: (context, i) {
            final slide = widget.slides[i];
            // Video slides show their poster frame until the native player lands; the URL is kept for it.
            return RemoteImage(slide.type == 'image' ? slide.url : null, label: slide.alt.isEmpty ? null : slide.alt, fit: BoxFit.cover);
          },
        ),
      ),
      if (widget.slides.length > 1)
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Semantics(
            label: '${widget.slides.length} görselden ${index + 1}. görsel',
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var i = 0; i < widget.slides.length; i++)
                  Container(
                    width: i == index ? 20 : 8,
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    decoration: BoxDecoration(
                      color: i == index ? XinobiTokens.ink : XinobiTokens.line,
                      borderRadius: BorderRadius.circular(XinobiTokens.radiusPill),
                    ),
                  ),
              ],
            ),
          ),
        ),
    ]);
  }
}

class _CategoryRail extends StatelessWidget {
  const _CategoryRail({required this.categories});
  final List<CategoryHighlight> categories;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 188,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: XinobiTokens.gutterMobile),
        itemCount: categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final category = categories[i];
          void open() => context.go('/urunler?kategori=${Uri.encodeQueryComponent(category.category)}');
          return Semantics(
            button: true,
            label: '${category.category}, ${category.productCount} ürün',
            onTap: open,
            excludeSemantics: true,
            child: InkWell(
              onTap: open,
              child: SizedBox(
                width: 128,
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  SizedBox(width: 128, height: 128, child: ColoredBox(color: const Color(0xFFECECE8), child: RemoteImage(category.imageUrl))),
                  const SizedBox(height: 8),
                  Expanded(child: Text(category.category, maxLines: 2, overflow: TextOverflow.ellipsis, style: Theme.of(context).textTheme.bodyMedium)),
                ]),
              ),
            ),
          );
        },
      ),
    );
  }
}
