/// Base URL of the Xinobi API.
///
/// Override with `--dart-define=API_BASE_URL=https://…` for test or production builds.
/// Development defaults reach the API on the developer machine: the Android emulator sees the host as 10.0.2.2,
/// the iOS simulator shares the host loopback. The development API only accepts loopback connections, so a physical
/// device needs a reachable test environment (Faz03 03.10) and an explicit override.
String apiBaseUrl({
  required bool isAndroid,
  String override = const String.fromEnvironment('API_BASE_URL'),
}) {
  if (override.isNotEmpty) {
    return override.endsWith('/')
        ? override.substring(0, override.length - 1)
        : override;
  }
  return isAndroid ? 'http://10.0.2.2:5003' : 'http://127.0.0.1:5003';
}

/// The web preview origin is supplied at build time. There is deliberately no
/// loopback default because a customer APK cannot reach the developer machine.
/// A session query is resolved by the web route against the server-owned
/// product and variant; Flutter never selects a surface from URL parameters.
Uri? xinobiMobilePreviewUri({
  String? sessionId,
  String override = const String.fromEnvironment('XINOBI_WEB_PREVIEW_URL'),
}) {
  final value = override.trim();
  if (value.isEmpty) return null;
  final parsed = Uri.tryParse(value);
  if (parsed == null ||
      parsed.host.isEmpty ||
      (parsed.scheme != 'http' && parsed.scheme != 'https')) {
    return null;
  }
  final safeIdentifier = RegExp(r'^[A-Za-z0-9_-]{1,128}$');
  if (sessionId != null && !safeIdentifier.hasMatch(sessionId)) return null;
  final query = <String, String>{};
  if (sessionId != null) {
    query['session'] = sessionId;
  }
  return parsed.replace(
    path: '/xinobi-u/mobil-onizleme/',
    queryParameters: query.isEmpty ? null : query,
    fragment: '',
  );
}

/// Opens the shared local-artwork upload and placement steps with an exact catalog identity; [pattern] opens the pattern upload.
Uri? xinobiOwnImageUri({
  required String productId,
   String ?variantId,
  bool pattern = false,
  String override = const String.fromEnvironment('XINOBI_WEB_PREVIEW_URL'),
}) {
  final base = xinobiMobilePreviewUri(override: override);
  final identifier = RegExp(r'^[A-Za-z0-9_-]{1,128}$');
  if (base == null ||
      !identifier.hasMatch(productId) ) {
    return null;
  }
  return base.replace(
    path: '/xinobi-u/kendi-gorselin/',
    queryParameters: {
      'product': productId,
      if (pattern) 'mode': 'pattern',
      'mobile': '1',
    },
  );
}

/// The development accepted-surface check is served by the same web origin as
/// the WebView preview. It is used only to gate variant selection; the server
/// remains the source of truth for the actual rendering inputs.
Uri? xinobiAcceptedSurfaceUri({
  required String productId,
  required String variantId,
  String override = const String.fromEnvironment('XINOBI_WEB_PREVIEW_URL'),
}) {
  final value = override.trim();
  final parsed = Uri.tryParse(value);
  final safeIdentifier = RegExp(r'^[A-Za-z0-9_-]{1,128}$');
  if (parsed == null ||
      parsed.host.isEmpty ||
      (parsed.scheme != 'http' && parsed.scheme != 'https') ||
      !safeIdentifier.hasMatch(productId) ||
      !safeIdentifier.hasMatch(variantId)) {
    return null;
  }
  return parsed.replace(
    path:
        '/api/v1/dev/catalog-surfaces/${Uri.encodeComponent(productId)}/${Uri.encodeComponent(variantId)}/rendering-inputs/',
    query: null,
    fragment: '',
  );
}

/// The representative surface bundle the web package publishes for each approved colour
/// (`/assets/product-previews/<product>/<variant>/inputs.json`), on the same web origin as the preview.
Uri? xinobiPublishedSurfaceUri({
  required String productId,
  required String variantId,
  String override = const String.fromEnvironment('XINOBI_WEB_PREVIEW_URL'),
}) {
  final base = xinobiMobilePreviewUri(override: override);
  final identifier = RegExp(r'^[A-Za-z0-9_-]{1,128}$');
  if (base == null || !identifier.hasMatch(productId) || !identifier.hasMatch(variantId)) return null;
  return Uri(scheme: base.scheme, host: base.host, port: base.port, path: '/assets/product-previews/$productId/$variantId/inputs.json');
}

/// Reopens exactly the saved placement (and optionally one native cart row).
Uri? xinobiSavedDesignUri({required String designId, String? variantId, String? configurationId, int? revision, String? line,
  String override = const String.fromEnvironment('XINOBI_WEB_PREVIEW_URL')}) {
  final base = xinobiMobilePreviewUri(override: override);
  if (base == null || !RegExp(r'^[a-f0-9]{32}$').hasMatch(designId)) return null;
  return base.replace(path: '/hesap/tasarimlarim/onizleme/', queryParameters: {
    'id': designId, 'mobile': '1',
    'variant': ?variantId,
    'configuration': ?configurationId,
    if (revision != null) 'revision': '$revision',
    'line': ?line,
  });
}
