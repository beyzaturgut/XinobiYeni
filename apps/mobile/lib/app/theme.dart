import 'package:flutter/material.dart';

import 'design_tokens.g.dart';

/// Weight on the bundled variable fonts. Variable font files need an explicit `wght` variation.
TextStyle jost(double size, {double weight = XinobiTokens.headerWeight, double? height, Color? color}) => TextStyle(
      fontFamily: XinobiTokens.headerFamily,
      fontSize: size,
      height: height == null ? null : height / size,
      fontVariations: [FontVariation.weight(weight)],
      fontWeight: FontWeight.values[((weight / 100).round() - 1).clamp(0, 8)],
      color: color,
    );

/// Inter at an exact variable weight; page text on the web is Inter (Jost is only the header). [letterSpacing] is in em.
TextStyle inter(double size, {double weight = 400, double? height, double letterSpacing = 0, Color color = XinobiTokens.ink}) => TextStyle(
      fontFamily: XinobiTokens.bodyFamily,
      fontSize: size,
      height: height,
      letterSpacing: letterSpacing * size,
      fontVariations: [FontVariation.weight(weight)],
      fontWeight: FontWeight.values[((weight / 100).round() - 1).clamp(0, 8)],
      color: color,
    );

ThemeData buildTheme() {
  const scheme = ColorScheme.light(
    primary: XinobiTokens.teal,
    onPrimary: XinobiTokens.surface,
    secondary: XinobiTokens.ink,
    surface: XinobiTokens.surface,
    onSurface: XinobiTokens.ink,
    error: XinobiTokens.danger,
    outline: XinobiTokens.line,
  );
  final base = ThemeData(colorScheme: scheme, useMaterial3: true, fontFamily: XinobiTokens.bodyFamily);
  return base.copyWith(
    scaffoldBackgroundColor: XinobiTokens.canvas,
    textTheme: base.textTheme.copyWith(
      // Web page titles: Inter 24/380 with tight tracking; card titles Inter 500.
      headlineSmall: inter(24, weight: 380, height: 1.2, letterSpacing: -.025),
      titleLarge: inter(20, weight: 420, height: 1.3, letterSpacing: -.02),
      titleMedium: inter(17, weight: 500, height: 1.35, letterSpacing: -.02),
      bodyMedium: const TextStyle(fontSize: 15, height: 1.5, color: XinobiTokens.ink),
      bodySmall: const TextStyle(fontSize: 13, height: 1.45, color: XinobiTokens.muted),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: XinobiTokens.header,
      indicatorColor: const Color(0x33FFFFFF),
      height: XinobiTokens.headerHeight,
      labelTextStyle: WidgetStatePropertyAll(jost(12, color: XinobiTokens.onHeader)),
      iconTheme: const WidgetStatePropertyAll(IconThemeData(color: XinobiTokens.onHeader, size: XinobiTokens.headerIconSize)),
    ),
    chipTheme: base.chipTheme.copyWith(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(XinobiTokens.radiusPill)),
      side: const BorderSide(color: XinobiTokens.line),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size(XinobiTokens.headerTouchTarget, 48),
        backgroundColor: XinobiTokens.ink,
        foregroundColor: XinobiTokens.surface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall)),
        textStyle: inter(16, weight: 600),
      ),
    ),
  );
}
