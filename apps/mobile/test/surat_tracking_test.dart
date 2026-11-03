import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';
import 'package:xinobi_mobile/features/account/orders.dart';

void main() {
  testWidgets('missing shipment stays empty', (tester) async {
    await tester.pumpWidget(ProviderScope(retry: (_, _) => null, overrides: [suratTrackingProvider('fixture').overrideWith((ref) async => null)], child: const MaterialApp(home: Scaffold(body: SuratOrderTracking(orderId: 'fixture')))));
    await tester.pumpAndSettle();
    expect(find.text('Sürat Kargo takibi'), findsNothing);
  });
  testWidgets('stale return tracking remains distinct at large text', (tester) async {
    final data = SuratTrackingView((b) => b
      ..reference = 'FIXTURE'
      ..registrationState = 'registered'
      ..environment = 'Production'
      ..result = 'unavailable'
      ..items.add(SuratTrackingItem((i) => i..state = 'return_delivered'..trackingNumber = 'TEST-TRACK')));
    await tester.pumpWidget(ProviderScope(retry: (_, _) => null, overrides: [suratTrackingProvider('fixture').overrideWith((ref) async => data)], child: MaterialApp(home: Scaffold(body: MediaQuery(data: const MediaQueryData(textScaler: TextScaler.linear(2)), child: const SingleChildScrollView(child: SuratOrderTracking(orderId: 'fixture')))))));
    await tester.pumpAndSettle();
    expect(find.text('İade teslim alındı'), findsOneWidget);
    expect(find.textContaining('Son alınan bilgi'), findsOneWidget);
    expect(find.text('Teslim edildi'), findsNothing);
    expect(tester.takeException(), isNull);
  });
  testWidgets('failure offers retry without inventing delivery', (tester) async {
    await tester.pumpWidget(ProviderScope(retry: (_, _) => null, overrides: [suratTrackingProvider('fixture').overrideWith((ref) async => throw Exception('fixture failure'))], child: const MaterialApp(home: Scaffold(body: SuratOrderTracking(orderId: 'fixture')))));
    await tester.pumpAndSettle();
    expect(find.text('Kargo takip bilgileri şu anda alınamıyor.'), findsOneWidget);
    expect(find.text('Takibi tekrar dene'), findsOneWidget);
  });
}
