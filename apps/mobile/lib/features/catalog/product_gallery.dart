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
  const ProductGallery(
      {super.key, required this.productName, required this.images, required this.selected, required this.onSelected, this.preload = const []});

  final String productName;
  final List<GalleryImage> images;

  /// Photos to load ahead of time (every colour's photo), so a colour change shows its photo without waiting.
  final List<String> preload;
  final String? selected;
  final ValueChanged<String> onSelected;

  @override
  State<ProductGallery> createState() => _ProductGalleryState();
}

class _ProductGalleryState extends State<ProductGallery> {
  late PageController pages = PageController(initialPage: index);
  final requested = <String>{};

  /// Stage photos decode at screen width so every colour's photo fits in the image cache at once.
  int get stageWidth => (MediaQuery.sizeOf(context).width * MediaQuery.devicePixelRatioOf(context)).round();

  void precache() {
    final width = stageWidth;
    for (final url in {...widget.images.map((image) => image.url), ...widget.preload}) {
      if (requested.add('$width $url')) precacheImage(ResizeImage(NetworkImage(url), width: width), context, onError: (_, _) {});
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    precache();
  }

  int get index {
    final found = widget.images.indexWhere((image) => image.url == widget.selected);
    return found < 0 ? 0 : found;
  }

  @override
  void didUpdateWidget(ProductGallery oldWidget) {
    super.didUpdateWidget(oldWidget);
    precache();
    final target = index;
    if (pages.hasClients && pages.page?.round() != target) {
      // A colour or thumbnail choice shows its photo in this same frame: a fresh controller starts on it, so nothing slides
      // past and the counter never runs ahead of the photo.
      final previous = pages;
      pages = PageController(initialPage: target);
      WidgetsBinding.instance.addPostFrameCallback((_) => previous.dispose());
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
                // Keyed by controller: a swapped controller must start fresh instead of inheriting the old scroll offset.
                key: ObjectKey(pages),
                controller: pages,
                itemCount: images.length,
                onPageChanged: (page) => widget.onSelected(images[page].url),
                itemBuilder: (context, page) =>
                    RemoteImage(images[page].url, label: '${widget.productName}, ${images[page].label}', cacheWidth: stageWidth),
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
                    child: RemoteImage(thumb.url, cacheWidth: (72 * MediaQuery.devicePixelRatioOf(context)).round()),
                  ),
                ),
              );
            },
          ),
        ),
    ]);
  }
}
