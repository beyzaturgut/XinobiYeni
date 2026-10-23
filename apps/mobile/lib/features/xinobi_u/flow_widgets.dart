import 'package:flutter/material.dart';

import '../../app/theme.dart';
import '../../widgets/common.dart';

// Colours of the XINOBI U / product detail designs (web: flow.module.css, detail.module.css).
const flowInk = Color(0xFF111111);
const flowBody = Color(0xFF3D3D3D);
const flowMuted = Color(0xFF5F5F5F);
const flowStage = Color(0xFFF3F3F1);
const flowLine = Color(0xFFE0E0E0);

final flowTitle = inter(24, weight: 600, height: 1.1, letterSpacing: -.02, color: flowInk);

final flowPrimaryButton = FilledButton.styleFrom(
  minimumSize: const Size(0, 48),
  backgroundColor: flowInk,
  foregroundColor: Colors.white,
  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
  // Not inheriting, like Material's own label styles, so state changes animate between the two.
  textStyle: inter(15, weight: 600).copyWith(inherit: false),
);

final flowSecondaryButton = OutlinedButton.styleFrom(
  minimumSize: const Size(0, 48),
  padding: const EdgeInsets.symmetric(horizontal: 20),
  foregroundColor: flowInk,
  side: const BorderSide(color: Color(0xFFD6D6D6)),
  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
  textStyle: inter(15, weight: 500).copyWith(inherit: false),
);

/// Small upper-case label above a step or product title.
class FlowKicker extends StatelessWidget {
  const FlowKicker(this.text, {super.key});
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Text(text.toUpperCase(), style: inter(11, weight: 600, letterSpacing: .12, color: flowMuted)),
      );
}

/// The four-step indicator of the own-design flow; [current] is the zero-based active step.
class XinobiUSteps extends StatelessWidget {
  const XinobiUSteps({super.key, required this.current});
  final int current;

  static const _labels = ['Ürün', 'Yöntem', 'Yükleme', 'Önizleme'];

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Kişiselleştirme adımları: ${current + 1}. adım, ${_labels[current]}',
      excludeSemantics: true,
      child: Wrap(spacing: 14, runSpacing: 6, children: [
        for (var index = 0; index < _labels.length; index++)
          Row(mainAxisSize: MainAxisSize.min, children: [
            Container(
              width: 22,
              height: 22,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: index < current ? flowInk : null,
                shape: BoxShape.circle,
                border: index < current ? null : Border.all(color: index == current ? flowInk : const Color(0xFFBDBDBD), width: index == current ? 2 : 1),
              ),
              child: index < current
                  ? const Icon(Icons.check, size: 13, color: Colors.white)
                  : Text('${index + 1}', style: inter(11, color: index == current ? flowInk : flowMuted)),
            ),
            const SizedBox(width: 6),
            Text(_labels[index], style: inter(12, weight: index == current ? 600 : 400, color: index == current ? flowInk : flowMuted)),
          ]),
      ]),
    );
  }
}

/// The selected product: photo on the warm grey stage, name and a way back to the product list.
class FlowProductCard extends StatelessWidget {
  const FlowProductCard({super.key, required this.name, required this.imageUrl, required this.onOtherProduct});
  final String name;
  final String? imageUrl;
  final VoidCallback onOtherProduct;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(border: Border.all(color: const Color(0xFFE6E6E6)), borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Container(
          height: 150,
          color: flowStage,
          padding: const EdgeInsets.all(12),
          // Modulating by the stage colour drops the photo's white background (like the web's mix-blend-mode) and keeps transparency.
          child: imageUrl == null
              ? null
              : ColorFiltered(colorFilter: const ColorFilter.mode(flowStage, BlendMode.modulate), child: RemoteImage(imageUrl, label: name)),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 8, 10),
          child: Row(children: [
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('SEÇTİĞİN ÜRÜN', style: inter(11, weight: 600, letterSpacing: .12, color: flowMuted)),
                const SizedBox(height: 2),
                Text(name, style: inter(16, weight: 600, color: flowInk)),
              ]),
            ),
            TextButton(onPressed: onOtherProduct, child: Text('Başka ürün seç →', style: inter(13, weight: 500, color: flowInk))),
          ]),
        ),
      ]),
    );
  }
}
