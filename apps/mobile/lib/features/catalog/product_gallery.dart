import 'package:flutter/material.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';

class GalleryImage {
  const GalleryImage(this.url, this.label, {this.colour = false});
  final String url;
  final String label;

  /// The selected colour's photo: shown on the stage, left out of the thumbnail strip.
  final bool colour;
}

/// Gallery order shared with the web (packages/commerce `productGallery`): the product photo, the selected colour's photo,
/// then the extra photos, duplicates dropped. Choosing a colour never removes the other photos.
List<GalleryImage> productGallery(ProductDetail product, VariantDetail? variant) {
  final items = <GalleryImage>[];
  void add(String? url, String label, {bool colour = false}) {
    if (url != null && url.isNotEmpty && !items.any((item) => item.url == url)) items.add(GalleryImage(url, label, colour: colour));
  }

  add(product.originalImageUrl, 'Ürün görseli');
  add(variant?.imageUrl, '${variant?.color ?? 'Seçili'} rengi', colour: true);
  for (final (index, url) in product.gallery.indexed) {
    add(url, 'Ek görsel ${index + 1}');
  }
  if (items.isEmpty) add(product.imageUrl, 'Ürün görseli');
  return items;
}

/// Swipeable photo stage with a thumbnail strip. [selected] is controlled by the caller so a colour change can jump to its photo.
class ProductGallery extends StatefulWidget {
  const ProductGallery({super.key, required this.productName, required this.images, required this.selected, required this.onSelected});

  final String productName;
  final List<GalleryImage> images;
  final String? selected;
  final ValueChanged<String> onSelected;

  @override
  State<ProductGallery> createState() => _ProductGalleryState();
}

class _ProductGalleryState extends State<ProductGallery> {
  late final PageController pages = PageController(initialPage: index);

  int get index {
    final found = widget.images.indexWhere((image) => image.url == widget.selected);
    return found < 0 ? 0 : found;
  }

  @override
  void didUpdateWidget(ProductGallery oldWidget) {
    super.didUpdateWidget(oldWidget);
    final target = index;
    if (pages.hasClients && pages.page?.round() != target) {
      // A colour or thumbnail choice switches straight to its photo instead of sliding past the photos in between.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted && pages.hasClients) pages.jumpToPage(target);
      });
    }
  }

  @override
  void dispose() {
    pages.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final images = widget.images;
    final current = index;
    // The strip lists the product's own photos only; colour photos are reached through the colour swatches.
    final thumbs = images.where((image) => !image.colour).toList();
    if (images.isEmpty) {
      return AspectRatio(aspectRatio: 1, child: RemoteImage(null, label: widget.productName));
    }
    return Column(children: [
      AspectRatio(
        aspectRatio: 1,
        child: ColoredBox(
          color: XinobiTokens.surface,
          child: Stack(children: [
            Positioned.fill(
              child: PageView.builder(
                controller: pages,
                itemCount: images.length,
                onPageChanged: (page) => widget.onSelected(images[page].url),
                itemBuilder: (context, page) => RemoteImage(images[page].url, label: '${widget.productName}, ${images[page].label}'),
              ),
            ),
            if (images.length > 1)
              Positioned(
                right: 12,
                bottom: 12,
                child: Semantics(
                  liveRegion: true,
                  child: DecoratedBox(
                    decoration: BoxDecoration(color: XinobiTokens.surface.withValues(alpha: .92), borderRadius: BorderRadius.circular(999)),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      child: Text('${current + 1} / ${images.length}', style: Theme.of(context).textTheme.bodySmall),
                    ),
                  ),
                ),
              ),
          ]),
        ),
      ),
      if (images.length > 1 && thumbs.isNotEmpty)
        SizedBox(
          height: 80,
          child: ListView.separated(
            padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 8, XinobiTokens.gutterMobile, 0),
            scrollDirection: Axis.horizontal,
            itemCount: thumbs.length,
            separatorBuilder: (_, _) => const SizedBox(width: 8),
            itemBuilder: (context, position) {
              final thumb = thumbs[position];
              final selected = thumb.url == images[current].url;
              return Semantics(
                button: true,
                selected: selected,
                label: '${thumb.label} göster',
                excludeSemantics: true,
                onTap: () => widget.onSelected(thumb.url),
                child: InkWell(
                  onTap: () => widget.onSelected(thumb.url),
                  borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall),
                  child: Container(
                    width: 72,
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      color: XinobiTokens.surface,
                      borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall),
                      border: Border.all(color: selected ? XinobiTokens.ink : XinobiTokens.line, width: selected ? 2 : 1),
                    ),
                    child: RemoteImage(thumb.url),
                  ),
                ),
              );
            },
          ),
        ),
    ]);
  }
}
