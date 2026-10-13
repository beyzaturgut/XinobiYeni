import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../catalog/catalog_repository.dart';

/// Colour selection for one XINOBI U product family. A variant must be chosen
/// explicitly and must have its own accepted surface before the questionnaire
/// can start.
class XinobiUVariantSelectionScreen extends ConsumerStatefulWidget {
  const XinobiUVariantSelectionScreen({super.key, required this.productId});

  final String productId;

  @override
  ConsumerState<XinobiUVariantSelectionScreen> createState() =>
      _XinobiUVariantSelectionScreenState();
}

class _XinobiUVariantSelectionScreenState
    extends ConsumerState<XinobiUVariantSelectionScreen> {
  String? selectedVariantId;
  bool _openingQuestionnaire = false;

  void _openQuestionnaire(ProductDetail detail, VariantDetail variant) {
    if (_openingQuestionnaire) return;
    setState(() => _openingQuestionnaire = true);
    context
        .push(
          '/xinobi-u/anket?urun=${Uri.encodeQueryComponent(detail.id)}&renk=${Uri.encodeQueryComponent(variant.id)}',
        )
        .whenComplete(() {
          if (mounted) setState(() => _openingQuestionnaire = false);
        });
  }

  void _openOwnImage(ProductDetail detail, VariantDetail variant) {
    if (_openingQuestionnaire) return;
    setState(() => _openingQuestionnaire = true);
    context
        .push(
          '/xinobi-u/kendi-gorselin?urun=${Uri.encodeQueryComponent(detail.id)}&renk=${Uri.encodeQueryComponent(variant.id)}',
        )
        .whenComplete(() {
          if (mounted) setState(() => _openingQuestionnaire = false);
        });
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(productProvider(widget.productId));
    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: const Text('XINOBI U'),
      ),
      body: state.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(
          error: error,
          onRetry: () => ref.invalidate(productProvider(widget.productId)),
        ),
        data: (detail) => _SelectionBody(
          detail: detail,
          selectedVariantId: selectedVariantId,
          onVariantSelected: (variant) =>
              setState(() => selectedVariantId = variant.id),
          onOpenQuestionnaire: (variant) => _openQuestionnaire(detail, variant),
          onOpenOwnImage: (variant) => _openOwnImage(detail, variant),
          openingQuestionnaire: _openingQuestionnaire,
        ),
      ),
    );
  }
}

class _SelectionBody extends ConsumerWidget {
  const _SelectionBody({
    required this.detail,
    required this.selectedVariantId,
    required this.onVariantSelected,
    required this.onOpenQuestionnaire,
    required this.onOpenOwnImage,
    required this.openingQuestionnaire,
  });

  final ProductDetail detail;
  final String? selectedVariantId;
  final ValueChanged<VariantDetail> onVariantSelected;
  final ValueChanged<VariantDetail> onOpenQuestionnaire;
  final ValueChanged<VariantDetail> onOpenOwnImage;
  final bool openingQuestionnaire;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final variants = detail.variants.toList();
    final selected = variants
        .where((variant) => variant.id == selectedVariantId)
        .firstOrNull;
    final readiness = selected == null
        ? null
        : ref.watch(
            acceptedSurfaceProvider((
              productId: detail.id,
              variantId: selected.id,
            )),
          );
    final catalogMaskReady = selected?.surfaceMaskUrl?.isNotEmpty == true;
    final remoteMaskReady = readiness?.asData?.value == true;
    final hasApprovedMask =
        selected != null && (catalogMaskReady || remoteMaskReady);
    final remoteUnsupported =
        selected != null &&
        !catalogMaskReady &&
        readiness?.hasValue == true &&
        readiness?.asData?.value == false;
    final remoteCheckFailed =
        selected != null &&
        !catalogMaskReady &&
        readiness?.hasValue == true &&
        readiness?.asData?.value == null;
    final text = Theme.of(context).textTheme;
    final image = selected?.imageUrl ?? detail.imageUrl;

    return ListView(
      padding: const EdgeInsets.fromLTRB(
        XinobiTokens.gutterMobile,
        24,
        XinobiTokens.gutterMobile,
        40,
      ),
      children: [
        if (image != null)
          SizedBox(height: 280, child: RemoteImage(image, label: detail.name)),
        const SizedBox(height: 16),
        Text(detail.category, style: text.bodySmall),
        const SizedBox(height: 4),
        Semantics(
          header: true,
          child: Text(detail.name, style: text.headlineSmall),
        ),
        const SizedBox(height: 8),
        Text('Desenin uygulanacağı rengi seç.', style: text.bodyMedium),
        const SizedBox(height: 20),
        Text('Renk: ${selected?.color ?? 'seçin'}', style: text.bodyMedium),
        const SizedBox(height: 10),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final variant in variants)
              _CircularVariantSwatch(
                variant: variant,
                selected: variant.id == selectedVariantId,
                onTap: () => onVariantSelected(variant),
              ),
          ],
        ),
        if (selected != null) ...[
          const SizedBox(height: 16),
          SizedBox(
            height: 180,
            child: RemoteImage(
              selected.imageUrl ?? detail.imageUrl,
              label: '${selected.color} ürün görseli',
            ),
          ),
          const SizedBox(height: 8),
          if (remoteUnsupported)
            Text(
              'Bu renk için kişiselleştirme henüz kullanılamıyor.',
              style: text.bodySmall,
            )
          else if (!catalogMaskReady &&
              (readiness?.hasError == true || remoteCheckFailed))
            Text(
              'Bu renk şu anda kullanılamıyor. Tekrar dene.',
              style: text.bodySmall,
            )
          else if (!catalogMaskReady && readiness?.isLoading == true)
            Text('Kontrol ediliyor…', style: text.bodySmall),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: hasApprovedMask && !openingQuestionnaire
                  ? () => onOpenQuestionnaire(selected)
                  : !catalogMaskReady &&
                        (readiness?.hasError == true || remoteCheckFailed)
                  ? () => ref.invalidate(
                      acceptedSurfaceProvider((
                        productId: detail.id,
                        variantId: selected.id,
                      )),
                    )
                  : null,
              child: Text(
                hasApprovedMask
                    ? 'Sorulara başla →'
                    : remoteUnsupported
                    ? 'Bu renk desteklenmiyor'
                    : readiness?.hasError == true || remoteCheckFailed
                    ? 'Tekrar dene'
                    : 'Kontrol ediliyor…',
              ),
            ),
          ),
          const SizedBox(height: 20),
          OutlinedButton(
            onPressed: hasApprovedMask && !openingQuestionnaire
                ? () => onOpenOwnImage(selected)
                : null,
            child: const Text('Kendi görselinizi ekleyin'),
          ),
          const SizedBox(height: 8),
          Text(
            'Dilediğiniz fotoğrafı veya görseli yükleyerek ürününüzü kişiselleştirin.',
            style: text.bodySmall,
          ),
        ],
      ],
    );
  }
}

class _CircularVariantSwatch extends StatelessWidget {
  const _CircularVariantSwatch({
    required this.variant,
    required this.selected,
    required this.onTap,
  });

  final VariantDetail variant;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final hex = variant.hex;
    final color = hex != null && RegExp(r'^#[0-9a-fA-F]{6}$').hasMatch(hex)
        ? Color(int.parse('FF${hex.substring(1)}', radix: 16))
        : XinobiTokens.line;
    return Semantics(
      button: true,
      selected: selected,
      label: '${variant.color} rengini seç',
      onTap: onTap,
      excludeSemantics: true,
      child: InkResponse(
        onTap: onTap,
        radius: 26,
        child: SizedBox(
          width: 48,
          height: 64,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: selected ? XinobiTokens.ink : XinobiTokens.line,
                    width: selected ? 3 : 1,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                variant.color,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: Theme.of(context).textTheme.labelSmall,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
