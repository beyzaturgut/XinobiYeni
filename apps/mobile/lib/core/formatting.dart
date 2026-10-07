import 'package:xinobi_api_client/xinobi_api_client.dart';

/// Formats a contract [Money] the way the web shows prices (tr-TR, e.g. `₺2.400,00`).
String formatMoney(Money? money) {
  if (money == null) return 'Fiyat tanımlanmadı';
  final negative = money.amountMinor < 0;
  final minor = money.amountMinor.abs();
  final whole = (minor ~/ 100).toString();
  final grouped = StringBuffer();
  for (var i = 0; i < whole.length; i++) {
    if (i > 0 && (whole.length - i) % 3 == 0) grouped.write('.');
    grouped.write(whole[i]);
  }
  final cents = (minor % 100).toString().padLeft(2, '0');
  final symbol = money.currency == 'TRY' ? '₺' : '${money.currency} ';
  return '${negative ? '-' : ''}$symbol$grouped,$cents';
}

/// Customer-facing stock text; mirrors the web rule (counts only for the last five items).
String availabilityText(Availability availability) => switch (availability.status) {
      'out_of_stock' => 'Stokta yok',
      'low_stock' => 'Son ${availability.remaining} ürün',
      _ => 'Stokta',
    };
