import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../personalization/native_commerce_bridge.dart';
import '../designs/design_configurations.dart';
import '../account/auth.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import '../../app/design_tokens.g.dart';
import '../../core/api_config.dart';

class XinobiMobilePreviewScreen extends ConsumerStatefulWidget {
  const XinobiMobilePreviewScreen({
    super.key,
    this.sessionId,
    this.designId, this.configurationId, this.revision, this.cartLine,
    this.previewUri,
    this.productId,
    this.variantId,
    this.pattern = false,
  });

  /// The design session is resolved by the web route. The generated artwork
  /// URL is deliberately not passed through Flutter or the WebView.
  final String? sessionId;
  final String? designId, configurationId, cartLine;
  final int? revision;
  final String? productId;
  final String? variantId;

  /// Opens the own-image flow on the pattern upload instead of the image upload.
  final bool pattern;

  /// Optional injection point for a widget test. Production uses the single
  /// build-time URL from [xinobiMobilePreviewUri].
  final Uri? previewUri;

  @override
  ConsumerState<XinobiMobilePreviewScreen> createState() =>
      _XinobiMobilePreviewScreenState();
}

class _XinobiMobilePreviewScreenState extends ConsumerState<XinobiMobilePreviewScreen> {
  WebViewController? _controller;
  Uri? _trustedUri;
  bool _loading = true;
  bool _canGoBack = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final ownImage = widget.productId != null || widget.variantId != null;
    _createController(
      widget.previewUri ??
          (widget.designId != null ? xinobiSavedDesignUri(designId: widget.designId!, variantId: widget.variantId, configurationId: widget.configurationId, revision: widget.revision, line: widget.cartLine) : ownImage
              ? xinobiOwnImageUri(
                  productId: widget.productId ?? '',
                  variantId: widget.variantId ?? '',
                  pattern: widget.pattern,
                )
              : xinobiMobilePreviewUri(sessionId: widget.sessionId)),
    );
  }

  void _createController(Uri? uri) {
    if (uri == null) {
      _error = 'Mobil önizleme adresi yapılandırılmamış. APK için XINOBI_WEB_PREVIEW_URL verin.';
      return;
    }
    _trustedUri = uri;
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      // The page is part of the app: no browser pinch zoom and no grey flash before the first paint.
      ..enableZoom(false)
      ..setBackgroundColor(XinobiTokens.surface)
      ..addJavaScriptChannel('XinobiCommerce', onMessageReceived: (message) async {
        final current = await _controller?.currentUrl();
        if (current == null || Uri.tryParse(current)?.origin != _trustedUri?.origin) return;
        Map<String, dynamic> request;
        try {
          if(message.message.length > 12 * 1024 * 1024) return;
          request = jsonDecode(message.message) as Map<String, dynamic>;
        } catch (_) { return; }
        final Map<String, dynamic> reply;
        if (request['action'] == 'login') {
          if (mounted && ref.read(authProvider) is! SignedIn) {
            final subscription = ref.listenManual(authProvider, (previous, next) {
              if (next is SignedIn && mounted && context.canPop()) context.pop();
            });
            try { await context.push('/hesap'); } finally { subscription.close(); }
          }
          reply = {'id': request['id'], 'status': 204};
        } else {
          reply = await ref.read(nativeCommerceBridgeProvider).handle(message.message);
        }
        if (!mounted || Uri.tryParse(await _controller?.currentUrl() ?? '')?.origin != _trustedUri?.origin) return;
        if(request['action'] == 'account' && (request['payload'] as Map?)?['method'] != 'GET') { ref.invalidate(designConfigurationsProvider); }
        await _controller?.runJavaScript('window.dispatchEvent(new CustomEvent("xinobi-commerce-response", {detail: ${jsonEncode(reply)}}));');
      })
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: (request) {
            final target = Uri.tryParse(request.url);
            if (target == null || !['http', 'https'].contains(target.scheme) || target.origin != uri.origin) return NavigationDecision.prevent;
            final path = target.path.replaceAll(RegExp(r'/$'), '');
            if (['/sepet', '/favoriler', '/hesap', '/hesap/tasarimlarim', '/xinobi-u'].contains(path)) {
              if (mounted) context.go(path);
              return NavigationDecision.prevent;
            }
            return path.startsWith('/xinobi-u/') || path.startsWith('/hesap/tasarimlarim') ? NavigationDecision.navigate : NavigationDecision.prevent;
          },
          onPageStarted: (_) {
            if (mounted) {
              setState(() {
                _loading = true;
                _error = null;
              });
            }
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _loading = false);
            _updateHistoryState();
          },
          onWebResourceError: (error) {
            if (error.isForMainFrame != false && mounted) {
              setState(() {
                _loading = false;
                _error = 'Önizleme yüklenemedi. İnternet bağlantısını ve web adresini kontrol edip yeniden deneyin.';
              });
            }
          },
        ),
      );
    _controller = controller;
    _configureAndLoad(controller, uri);
  }

  Future<void> _configureAndLoad(WebViewController controller, Uri uri) async {
    try {
      final platform = controller.platform;
      if (platform is AndroidWebViewController) {
        await platform.setOnShowFileSelector((params) async {
          try {
            final current = await controller.currentUrl();
            final currentUri = current == null ? null : Uri.tryParse(current);
            if (currentUri == null ||
                !['http', 'https'].contains(currentUri.scheme) ||
                currentUri.origin != uri.origin) {
              return [];
            }
            return await const MethodChannel('xinobi_u/file_picker')
                    .invokeListMethod<String>('pickImage') ??
                [];
          } on PlatformException {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Görsel seçici açılamadı. Yeniden deneyin.'),
                ),
              );
            }
            return [];
          }
        });
      }
      await controller.loadRequest(uri);
    } on PlatformException {
      if (mounted) {
        setState(() {
          _loading = false;
          _error = 'Önizleme açılamadı. Yeniden deneyin.';
        });
      }
    }
  }

  Future<void> _updateHistoryState() async {
    final controller = _controller;
    if (controller == null) return;
    final canGoBack = await controller.canGoBack();
    if (mounted && canGoBack != _canGoBack) {
      setState(() => _canGoBack = canGoBack);
    }
  }

  Future<void> _retry() async {
    final controller = _controller;
    if (controller == null) {
      if (mounted) {
        setState(
          () => _error = 'Mobil önizleme adresi yapılandırılmamış. APK için XINOBI_WEB_PREVIEW_URL verin.',
        );
      }
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    await controller.reload();
  }

  Future<void> _handleBack() async {
    final controller = _controller;
    if (controller != null && await controller.canGoBack()) {
      await controller.goBack();
      await _updateHistoryState();
      return;
    }
    if (mounted) context.pop();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_canGoBack,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) _handleBack();
      },
      child: Scaffold(
        // Same app bar as the native XINOBI U steps; reloading is offered only on the error view, like other screens.
        appBar: AppBar(
          backgroundColor: XinobiTokens.header,
          foregroundColor: XinobiTokens.onHeader,
          toolbarHeight: XinobiTokens.headerHeight,
          title: Text(widget.productId != null || widget.designId != null ? 'XINOBI U' : 'Ürün önizlemesi'),
        ),
        body: SafeArea(
          top: false,
          child: Stack(
            children: [
              if (_controller != null) WebViewWidget(controller: _controller!),
              if (_loading && _error == null) const LinearProgressIndicator(),
              if (_error != null)
                _PreviewError(message: _error!, onRetry: _retry),
            ],
          ),
        ),
      ),
    );
  }
}

class _PreviewError extends StatelessWidget {
  const _PreviewError({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Theme.of(context).scaffoldBackgroundColor,
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.cloud_off_outlined, size: 40),
              const SizedBox(height: 12),
              Text(message, textAlign: TextAlign.center),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: onRetry,
                icon: const Icon(Icons.refresh),
                label: const Text('Tekrar dene'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
