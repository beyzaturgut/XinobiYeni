import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'surface_preview.dart';

/// A saved image and its product placement have separate lifetimes. Retain the
/// placement when the customer returns through Tasarımlarım on this device.
class DesignPlacementStore {
  static String _key(String design, String product, String variant) =>
      'xinobi-design-placement:${jsonEncode([design, product, variant])}';

  static Future<DesignPlacement?> load(String design, String product, String variant) async {
    final raw = (await SharedPreferences.getInstance()).getString(_key(design, product, variant));
    if (raw == null) return null;
    try { return DesignPlacement.fromJson(jsonDecode(raw)); } on FormatException { return null; }
  }

  static Future<void> save(String design, String product, String variant, DesignPlacement placement) async {
    await (await SharedPreferences.getInstance()).setString(_key(design, product, variant), jsonEncode(placement.toJson()));
  }
}
