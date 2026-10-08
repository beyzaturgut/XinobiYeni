import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../app/theme.dart';
import '../../widgets/common.dart';
import '../../widgets/xinobi_header.dart';
import '../catalog/catalog_repository.dart';
import 'home_sections.dart';

/// Home follows the web home (apps/web/src/app/page.tsx): slider → XINOBI U → categories → titanium → featured → values and story.
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
      appBar: const XinobiHeader(),
      body: home.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(homeProvider)),
        data: (content) => RefreshIndicator(
          onRefresh: () => ref.refresh(homeProvider.future),
          child: CustomScrollView(slivers: [
            if (content.slides.isNotEmpty) SliverToBoxAdapter(child: _Slider(slides: content.slides.toList())),
            const SliverToBoxAdapter(child: XinobiUFeature()),
            if (content.categories.isNotEmpty) SliverToBoxAdapter(child: _CategoryRail(categories: content.categories.toList())),
            SliverToBoxAdapter(child: TitaniumFeature(imageUrl: content.featureImageUrl)),
            if (content.featuredProducts.isNotEmpty) SliverToBoxAdapter(child: FeaturedProducts(products: content.featuredProducts.toList())),
            const SliverToBoxAdapter(child: ValuesAndStory()),
          ]),
        ),
      ),
    );
  }
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
    // Web under 600 px: 42vw square photos on warm gray, name below, 20 px apart, no section heading.
    final size = MediaQuery.sizeOf(context).width * .42;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 30),
      child: SizedBox(
        height: size + 64,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: XinobiTokens.gutterMobile),
          itemCount: categories.length,
          separatorBuilder: (_, _) => const SizedBox(width: 20),
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
                  width: size,
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: SizedBox.square(dimension: size, child: ColoredBox(color: XinobiTokens.mediaWarm, child: RemoteImage(category.imageUrl))),
                    ),
                    const SizedBox(height: 12),
                    Text(category.category, maxLines: 2, overflow: TextOverflow.ellipsis, style: inter(17, weight: 600, height: 1.5, letterSpacing: -.025, color: const Color(0xFF303030))),
                  ]),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
