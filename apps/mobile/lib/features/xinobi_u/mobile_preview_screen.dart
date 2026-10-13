import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import '../../core/api_config.dart';

class XinobiMobilePreviewScreen extends StatefulWidget {
  const XinobiMobilePreviewScreen({
    super.key,
    this.sessionId,
    this.previewUri,
    this.productId,
    this.variantId,
  });

  /// The design session is resolved by the web route. The generated artwork
  /// URL is deliberately not passed through Flutter or the WebView.
  final String? sessionId;
  final String? productId;
  final String? variantId;

  /// Optional injection point for a widget test. Production uses the single
  /// build-time URL from [xinobiMobilePreviewUri].
  final Uri? previewUri;

  @override
  State<XinobiMobilePreviewScreen> createState() =>
      _XinobiMobilePreviewScreenState();
}

class _XinobiMobilePreviewScreenState extends State<XinobiMobilePreviewScreen> {
  WebViewController? _controller;
  bool _loading = true;
  bool _canGoBack = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final ownImage = widget.productId != null || widget.variantId != null;
    _createController(
      widget.previewUri ??
          (ownImage
              ? xinobiOwnImageUri(
                  productId: widget.productId ?? '',
                  variantId: widget.variantId ?? '',
                )
              : xinobiMobilePreviewUri(sessionId: widget.sessionId)),
    );
  }

  void _createController(Uri? uri) {
    if (uri == null) {
      _error = 'Mobil önizleme adresi yapılandırılmamış. APK için XINOBI_WEB_PREVIEW_URL verin.';
      return;
    }
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
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
        appBar: AppBar(
          title: const Text('Ürün önizlemesi'),
          actions: [
            IconButton(
              tooltip: 'Yeniden yükle',
              onPressed: _controller == null ? null : _retry,
              icon: const Icon(Icons.refresh),
            ),
          ],
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
