import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'app/router.dart';
import 'app/theme.dart';

// Failed loads are retried only when the user taps "Tekrar dene"; Riverpod's automatic retry would repeat API calls in the background.
Duration? noAutomaticRetry(int retryCount, Object error) => null;

void main() => runApp(const ProviderScope(retry: noAutomaticRetry, child: XinobiApp()));

class XinobiApp extends StatefulWidget {
  const XinobiApp({super.key, this.initialLocation = '/'});
  final String initialLocation;

  @override
  State<XinobiApp> createState() => _XinobiAppState();
}

class _XinobiAppState extends State<XinobiApp> {
  late final GoRouter router = buildRouter(initialLocation: widget.initialLocation);

  @override
  void dispose() {
    router.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => MaterialApp.router(
        title: 'Xinobi',
        debugShowCheckedModeBanner: false,
        theme: buildTheme(),
        locale: const Locale('tr', 'TR'),
        supportedLocales: const [Locale('tr', 'TR')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        routerConfig: router,
      );
}
