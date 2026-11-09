import 'package:flutter/foundation.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

/// Approved product-level surface, independent of sale colours/SKUs. Raw dimensions are never a display canvas.
@immutable
class SingleSourceSurface {
  const SingleSourceSurface({
    required this.productId,
    required this.surfaceId,
    required this.sourceRevision,
    required this.width,
    required this.height,
    required this.sourceSha256,
    required this.maskSha256,
    required this.sourceUrl,
    required this.maskUrl,
  });
  final String productId,
      surfaceId,
      sourceSha256,
      maskSha256,
      sourceUrl,
      maskUrl;
  final int sourceRevision, width, height;
  String get cacheKey =>
      '$productId:$sourceRevision:$surfaceId:$sourceSha256:$maskSha256';
  double get aspectRatio => width / height;

  factory SingleSourceSurface.fromContract(
    SingleSourcePublication value,
    String productId,
    Uri apiBase,
  ) {
    final input = value.inputs, sha = RegExp(r'^[a-f0-9]{64}$');
    if (!['http', 'https'].contains(apiBase.scheme) ||
        apiBase.host.isEmpty ||
        apiBase.userInfo.isNotEmpty ||
        value.schemaVersion != 1 ||
        value.scope != 'single-source-preview' ||
        value.productReference != productId ||
        value.sourceRevision < 1 ||
        !RegExp('^source-${value.sourceRevision}-mask-[a-f0-9]{32}\$')
            .hasMatch(value.surfaceId) ||
        input.width <= 0 ||
        input.height <= 0 ||
        !sha.hasMatch(input.surfaceVersion) ||
        !sha.hasMatch(input.sourceMediaVersion) ||
        input.brandingRequired != false ||
        input.branding != null) {
      throw const FormatException('Invalid product surface');
    }
    final root =
        '/api/v1/product-surfaces/${Uri.encodeComponent(productId)}/${value.surfaceId}';
    String media(SurfaceMedia item, String role, String hash) {
      if (item.sha256 != hash || item.url != '$root/$role?v=$hash') {
        throw const FormatException('Mixed product surface');
      }
      return apiBase.resolve(item.url).toString();
    }

    return SingleSourceSurface(
      productId: productId,
      surfaceId: value.surfaceId,
      sourceRevision: value.sourceRevision,
      width: input.width,
      height: input.height,
      sourceSha256: input.sourceMediaVersion,
      maskSha256: input.surfaceVersion,
      sourceUrl: media(input.source_, 'source', input.sourceMediaVersion),
      maskUrl: media(input.mask, 'mask', input.surfaceVersion),
    );
  }
}

const singleSourcePlacementHint =
    'Üründe yerleştirdikten sonra tasarımını kaydedebilir veya sepete ekleyebilirsin.';
