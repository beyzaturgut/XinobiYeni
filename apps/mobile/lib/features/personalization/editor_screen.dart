import 'package:flutter/material.dart';

import '../xinobi_u/mobile_preview_screen.dart';
import '../xinobi_u/xinobi_u_screen.dart';

/// Compatibility entry. New placements use the same source-coordinate renderer as web,
/// not the retired native colour-mask transfer or an arbitrary first sale variant.
/// Historical saved design/revision identifiers remain explicit and unchanged.
class EditorScreen extends StatelessWidget {
  const EditorScreen({
    super.key,
    this.productId,
    this.variantId,
    this.designId,
  });
  final String? productId, variantId, designId;

  @override
  Widget build(BuildContext context) => productId == null && designId == null
      ? const XinobiUScreen(editorEntry: true)
      : XinobiMobilePreviewScreen(
          key: ValueKey('$productId:$designId:$variantId'),
          productId: productId,
          variantId: variantId,
          designId: designId,
        );
}
