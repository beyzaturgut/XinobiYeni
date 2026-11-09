import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/core/api_config.dart';
import 'package:xinobi_mobile/core/formatting.dart';

void main() {
  test(
    'own-image preview uses exact identity and never creates a session URL',
    () {
      final uri = xinobiOwnImageUri(
        productId: 'P1',
        variantId: 'V2',
        override: 'http://127.0.0.1:3032',
      );
      expect(uri?.path, '/xinobi-u/kendi-gorselin/');
      expect(uri?.queryParameters, {
        'product': 'P1',

        'mobile': '1'
      });
      expect(
        xinobiOwnImageUri(
          productId: 'P1',
          variantId: '',
          override: 'https://web.test',
        ),
        isNotNull,
      );
      expect(
        xinobiOwnImageUri(
          productId: '../wrong',
          variantId: 'V2',
          override: 'https://web.test',
        ),
        isNull,
      );
      expect(
        xinobiOwnImageUri(productId: 'P1', variantId: 'V2', override: ''),
        isNull,
      );
    },
  );
  test(
    'API base URL reaches the host from emulators and honours overrides',
    () {
      expect(apiBaseUrl(isAndroid: true, override: ''), 'http://10.0.2.2:5003');
      expect(
        apiBaseUrl(isAndroid: false, override: ''),
        'http://127.0.0.1:5003',
      );
      expect(
        apiBaseUrl(isAndroid: true, override: 'https://api.xinobi.test/'),
        'https://api.xinobi.test',
      );
    },
  );

  test('published surface bundle is read from the web origin with exact identity', () {
    expect(
      xinobiPublishedSurfaceUri(productId: 'P1', variantId: 'V2', override: 'http://10.0.2.2:3000')?.toString(),
      'http://10.0.2.2:3000/assets/product-previews/P1/V2/inputs.json',
    );
    expect(xinobiPublishedSurfaceUri(productId: 'P1', variantId: '../V2', override: 'http://10.0.2.2:3000'), isNull);
    expect(xinobiPublishedSurfaceUri(productId: 'P1', variantId: 'V2', override: ''), isNull);
  });

  test('money is formatted like the web (tr-TR)', () {
    Money money(int minor) => Money(
      (b) => b
        ..amountMinor = minor
        ..currency = 'TRY',
    );
    expect(formatMoney(money(240000)), '₺2.400,00');
    expect(formatMoney(money(123456789)), '₺1.234.567,89');
    expect(formatMoney(money(5)), '₺0,05');
    expect(formatMoney(null), 'Fiyat tanımlanmadı');
  });

  test('stock text only shows counts for the last five items', () {
    Availability availability(String status, [int? remaining]) => Availability(
      (b) => b
        ..status = status
        ..remaining = remaining,
    );
    expect(availabilityText(availability('low_stock', 3)), 'Son 3 ürün');
    expect(availabilityText(availability('out_of_stock', 0)), 'Stokta yok');
    expect(availabilityText(availability('in_stock')), 'Stokta');
  });

  test('generated Dart tokens match design/tokens.json', () {
    final tokens = jsonDecode(
      File('../../design/tokens.json').readAsStringSync(),
    ) as Map<String, dynamic>;
    final generated = File('lib/app/design_tokens.g.dart').readAsStringSync();
    expect(
      generated,
      contains("version = '${tokens['version']}'"),
      reason: 'Run `pnpm tokens:mobile`.',
    );
    for (final entry in (tokens['color'] as Map<String, dynamic>).entries) {
      final hex = (entry.value as String).substring(1).toUpperCase();
      expect(
        generated,
        contains('Color ${entry.key} = Color(0xFF$hex)'),
        reason: 'Run `pnpm tokens:mobile`.',
      );
    }
    for (final entry in (tokens['header'] as Map<String, dynamic>).entries) {
      final name =
          'header${entry.key[0].toUpperCase()}${entry.key.substring(1)}';
      expect(
        generated,
        contains('$name = ${entry.value};'),
        reason: 'Run `pnpm tokens:mobile`.',
      );
    }
  });
}
