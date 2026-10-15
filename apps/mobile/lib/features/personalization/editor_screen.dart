import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../account/auth.dart';
import '../catalog/catalog_repository.dart';
import '../designs/designs.dart';
import 'surface_preview.dart';

/// Picks an image from the gallery; replaceable in tests.
typedef GalleryPick = Future<({Uint8List bytes, String name})?> Function();

final galleryPickerProvider = Provider<GalleryPick>((ref) => () async {
      final file = await ImagePicker().pickImage(source: ImageSource.gallery, maxWidth: 2400, maxHeight: 2400, imageQuality: 92);
      if (file == null) return null;
      return (bytes: await file.readAsBytes(), name: file.name);
    });

/// /tasarim-editoru — the mobile editor: a saved design or an own image on the colour's approved surface (Ürün yüzeyleri),
/// covering it or placed with size, rotation and drag. "Temsilidir": a digital preview, not a print proof.
class EditorScreen extends ConsumerStatefulWidget {
  const EditorScreen({super.key, this.productId, this.variantId, this.designId});
  final String? productId;
  final String? variantId;
  final String? designId;
  @override
  ConsumerState<EditorScreen> createState() => _EditorScreenState();
}

class _EditorScreenState extends ConsumerState<EditorScreen> {
  String? productId;
  String? variantId;
  MyDesign? saved;
  ({Uint8List bytes, String name})? picked;
  DesignPlacement placement = const DesignPlacement.place();
  bool busy = false;
  String? message;

  @override
  void initState() {
    super.initState();
    productId = widget.productId;
    variantId = widget.variantId;
  }

  Future<void> _pick() async {
    final image = await ref.read(galleryPickerProvider)();
    if (image == null || !mounted) return;
    if (image.bytes.lengthInBytes > 8 * 1024 * 1024) {
      setState(() => message = 'Görsel en fazla 8 MB olabilir.');
      return;
    }
    setState(() {
      picked = image;
      saved = null;
      message = null;
    });
  }

  Future<void> _chooseSaved(List<MyDesign> designs) async {
    final chosen = await showModalBottomSheet<MyDesign>(
      context: context,
      builder: (context) => ListView(children: [
        const ListTile(title: Text('Tasarımlarımdan seç')),
        for (final design in designs)
          ListTile(
            leading: SizedBox(width: 48, height: 48, child: DesignImage(design: design)),
            title: Text(design.name),
            subtitle: Text(design.productName),
            onTap: () => Navigator.pop(context, design),
          ),
      ]),
    );
    if (chosen != null) {
      setState(() {
        saved = chosen;
        picked = null;
        message = null;
      });
    }
  }

  Future<void> _save() async {
    final image = picked;
    if (image == null || productId == null) return;
    setState(() {
      busy = true;
      message = null;
    });
    try {
      final design = await ref.read(authProvider.notifier).withSession((repository, token) => repository.uploadDesign(token, image.bytes, image.name, productId!, variantId));
      ref.invalidate(myDesignsProvider);
      if (!mounted) return;
      setState(() {
        saved = design;
        picked = null;
        message = 'Tasarım hesabına kaydedildi.';
      });
    } on AccountException catch (error) {
      setState(() => message = error.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final signedIn = ref.watch(authProvider) is SignedIn;
    final products = ref.watch(productsProvider(const ProductQuery(personalizable: true)));
    final designs = ref.watch(myDesignsProvider).value ?? const <MyDesign>[];
    // A design opened from Tasarımlarım stays chosen until the customer picks another image.
    final current = saved ?? (picked == null ? designs.where((design) => design.id == widget.designId).firstOrNull : null);
    final detail = productId == null ? null : ref.watch(productProvider(productId!)).value;
    final variants = detail?.variants.toList() ?? const <VariantDetail>[];
    final variant = variants.where((item) => item.id == variantId).firstOrNull ?? variants.where((item) => item.surfaceMaskUrl != null).firstOrNull ?? variants.firstOrNull;
    final designImage = picked != null ? MemoryImage(picked!.bytes) : current == null ? null : ref.watch(designImageProvider(current.imageUrl)).value;
    // Catalog colours without a mask on the API use the approved surface the web package publishes.
    final published = variant == null || variant.surfaceMaskUrl != null || productId == null ? null : ref.watch(publishedSurfaceProvider((productId: productId!, variantId: variant.id))).value;
    final mask = variant?.surfaceMaskUrl ?? published?.maskUrl;
    final productImage = variant?.surfaceMaskUrl != null ? variant?.imageUrl : published?.sourceUrl ?? variant?.imageUrl;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: const Text('Tasarım editörü'),
      ),
      body: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
        products.when(
          loading: () => const LinearProgressIndicator(),
          error: (error, _) => Text(error.toString()),
          data: (page) => DropdownButtonFormField<String>(
            isExpanded: true,
            initialValue: page.items.any((item) => item.id == productId) ? productId : null,
            decoration: const InputDecoration(labelText: 'Ürün', border: OutlineInputBorder()),
            items: [for (final item in page.items) DropdownMenuItem(value: item.id, child: Text(item.name, overflow: TextOverflow.ellipsis))],
            onChanged: (value) => setState(() {
              productId = value;
              variantId = null;
            }),
          ),
        ),
        if (variants.isNotEmpty) ...[
          const SizedBox(height: 12),
          Text('Renk', style: text.labelLarge),
          Wrap(spacing: 8, children: [
            for (final item in variants)
              ChoiceChip(
                label: Text(item.color),
                selected: item.id == variant?.id,
                onSelected: (_) => setState(() => variantId = item.id),
              ),
          ]),
        ],
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: OutlinedButton.icon(onPressed: _pick, icon: const Icon(Icons.photo_library_outlined), label: const Text('Galeriden seç'))),
          const SizedBox(width: 8),
          Expanded(child: OutlinedButton.icon(onPressed: signedIn && designs.isNotEmpty ? () => _chooseSaved(designs) : null, icon: const Icon(Icons.collections_outlined), label: const Text('Tasarımlarım'))),
        ]),
        if (designImage == null) ...[
          const SizedBox(height: 8),
          Text('Başlamak için galeriden bir görsel seç.', style: text.bodySmall),
        ],
        const SizedBox(height: 16),
        AspectRatio(
          aspectRatio: 1,
          child: ColoredBox(
            color: XinobiTokens.surface,
            child: variant == null
                ? const Center(child: Text('Bir ürün seç.'))
                : mask == null || productImage == null
                    ? Stack(fit: StackFit.expand, children: [
                        RemoteImage(variant.imageUrl),
                        const Align(alignment: Alignment.bottomCenter, child: Padding(padding: EdgeInsets.all(8), child: Text('Bu renk için onaylı tasarım yüzeyi yok; başka bir renk seç.', textAlign: TextAlign.center))),
                      ])
                    : designImage == null
                        ? RemoteImage(variant.imageUrl)
                        : LayoutBuilder(
                            builder: (context, constraints) => GestureDetector(
                              onPanUpdate: placement.cover
                                  ? null
                                  : (details) => setState(() => placement = placement.copyWith(
                                      offset: placement.offset + Offset(details.delta.dx / constraints.maxWidth, details.delta.dy / constraints.maxHeight))),
                              child: Semantics(
                                label: '${detail?.name ?? ''} ${variant.color} üzerinde tasarımın temsili önizlemesi',
                                image: true,
                                child: SurfacePreview(
                                  product: NetworkImage(productImage),
                                  design: designImage,
                                  mask: NetworkImage(mask),
                                  placement: placement,
                                  fallback: const Center(child: CircularProgressIndicator(semanticsLabel: 'Önizleme hazırlanıyor')),
                                ),
                              ),
                            ),
                          ),
          ),
        ),
        const SizedBox(height: 8),
        Text('Temsilidir. Dijital önizlemedir; baskı ölçüsü ve renk onayı değildir.', style: text.bodySmall),
        if (designImage != null && mask != null) ...[
          const SizedBox(height: 12),
          SegmentedButton<bool>(
            segments: const [ButtonSegment(value: false, label: Text('Yerleştir')), ButtonSegment(value: true, label: Text('Yüzeyi kapla'))],
            selected: {placement.cover},
            onSelectionChanged: (value) => setState(() => placement = value.first ? const DesignPlacement.cover() : const DesignPlacement.place()),
          ),
          if (!placement.cover) ...[
            Text('Boyut', style: text.labelLarge),
            Slider(value: placement.scale, min: 0.1, max: 1.2, label: '${(placement.scale * 100).round()}%', onChanged: (value) => setState(() => placement = placement.copyWith(scale: value))),
            Text('Döndür: ${degrees(placement.rotation).round()}°', style: text.labelLarge),
            Slider(value: placement.rotation, min: -3.1416, max: 3.1416, onChanged: (value) => setState(() => placement = placement.copyWith(rotation: value))),
            Text('Görseli taşımak için önizlemede sürükle.', style: text.bodySmall),
          ],
        ],
        if (message != null) Padding(padding: const EdgeInsets.only(top: 12), child: Semantics(liveRegion: true, child: Text(message!))),
        const SizedBox(height: 16),
        if (picked != null)
          signedIn
              ? FilledButton(onPressed: busy || productId == null ? null : _save, child: Text(busy ? 'Kaydediliyor…' : 'Tasarımımı kaydet'))
              : OutlinedButton(onPressed: () => context.go('/hesap'), child: const Text('Kaydetmek için giriş yap')),
        if (current != null && picked == null) ...[
          FilledButton.icon(onPressed: () => addDesignToCart(context, ref, current, variantId: variant?.id, placement: placement), icon: const Icon(Icons.add_shopping_cart), label: const Text('Sepete ekle')),
          const SizedBox(height: 8),
          Text('“${current.name}” Tasarımlarım’da kayıtlı.', style: text.bodySmall),
        ],
      ]),
    );
  }
}
