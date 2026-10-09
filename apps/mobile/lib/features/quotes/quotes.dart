import 'package:built_collection/built_collection.dart';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import '../account/account_widgets.dart';
import '../account/auth.dart';
import '../catalog/catalog_repository.dart';

/// [message] is the API's Turkish problem title, safe to show.
class QuoteException implements Exception {
  const QuoteException(this.message);
  final String message;
  @override
  String toString() => message;
}

/// Corporate quote requests (/api/v1/quotes): anyone may ask; tracking needs the code and the e-mail it was sent with.
class QuotesRepository {
  QuotesRepository(XinobiApiClient client) : _api = client.getQuotesApi();
  final QuotesApi _api;

  Future<QuoteOptions> options() => _call(() => _api.getQuoteOptions());
  /// [accessToken] links the request to the signed-in account (it then also appears under Tekliflerim).
  Future<Quote> create(CreateQuote request, String? accessToken) =>
      _call(() => _api.createQuote(createQuote: request, headers: accessToken == null ? null : {'Authorization': 'Bearer $accessToken'}));
  Future<Quote> track(String code, String email) => _call(() => _api.trackQuote(code: code.trim(), email: email.trim()));
  Future<Quote> message(Quote quote, String text) =>
      _call(() => _api.sendQuoteMessage(code: quote.code, trackQuoteMessage: TrackQuoteMessage((b) => b
        ..email = quote.email
        ..text = text)));
  Future<Quote> decide(Quote quote, bool accept, String? note) =>
      _call(() => _api.decideQuote(code: quote.code, quoteDecision: QuoteDecision((b) => b
        ..email = quote.email
        ..decision = accept ? 'accept' : 'reject'
        ..note = note)));

  Future<T> _call<T>(Future<Response<T>> Function() request) async {
    try {
      final data = (await request()).data;
      if (data == null) throw const QuoteException('Beklenmeyen boş yanıt alındı.');
      return data;
    } on DioException catch (error) {
      final body = error.response?.data;
      final title = body is Map ? body['title']?.toString() : null;
      throw QuoteException(title ?? (error.response == null ? 'Bağlantı kurulamadı. İnternet bağlantını kontrol et.' : 'İşlem tamamlanamadı.'));
    }
  }
}

final quotesRepositoryProvider = Provider<QuotesRepository>((ref) => QuotesRepository(ref.watch(apiClientProvider)));
final quoteOptionsProvider = FutureProvider<QuoteOptions>((ref) => ref.watch(quotesRepositoryProvider).options());
final myQuotesProvider = FutureProvider.autoDispose<List<Quote>>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return const [];
  return await ref.read(authProvider.notifier).withSession((repository, token) => repository.quotes(token)) ?? const [];
});

String quoteStatusText(String status) => switch (status) {
      'received' => 'Talep alındı',
      'reviewing' => 'İnceleniyor',
      'offered' => 'Teklif hazır',
      'accepted' => 'Kabul edildi',
      'rejected' => 'Reddedildi',
      'closed' => 'Kapandı',
      _ => status,
    };

class _Row {
  _Row(this.productId, this.quantity);
  String? productId;
  final TextEditingController quantity;
}

/// /kurumsal/teklif
class QuoteFormScreen extends ConsumerStatefulWidget {
  const QuoteFormScreen({super.key});
  @override
  ConsumerState<QuoteFormScreen> createState() => _QuoteFormScreenState();
}

class _QuoteFormScreenState extends ConsumerState<QuoteFormScreen> {
  final company = TextEditingController(), contact = TextEditingController(), email = TextEditingController(), phone = TextEditingController(), note = TextEditingController(), personalizationNote = TextEditingController();
  final rows = <_Row>[];
  bool personalization = false, busy = false;
  String? purpose, error;
  DateTime? desiredDate;

  @override
  void initState() {
    super.initState();
    if (ref.read(authProvider) case SignedIn(:final profile)) {
      contact.text = profile.name;
      email.text = profile.email;
    }
    rows.add(_Row(null, TextEditingController(text: '10')));
  }

  @override
  void dispose() {
    for (final controller in [company, contact, email, phone, note, personalizationNote, ...rows.map((row) => row.quantity)]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _submit(List<ProductSummary> products) async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final request = CreateQuote((b) => b
        ..company = company.text.trim()
        ..contactName = contact.text.trim()
        ..email = email.text.trim()
        ..phone = phone.text.trim().isEmpty ? null : phone.text.trim()
        ..items = ListBuilder([
          for (final row in rows)
            QuoteItemRequest((item) => item
              ..productId = row.productId ?? products.first.id
              ..quantity = int.tryParse(row.quantity.text) ?? 0),
        ])
        ..personalization = personalization
        ..personalizationNote = personalization && personalizationNote.text.trim().isNotEmpty ? personalizationNote.text.trim() : null
        ..desiredDate = desiredDate == null ? null : Date(desiredDate!.year, desiredDate!.month, desiredDate!.day)
        ..purpose = purpose
        ..note = note.text.trim().isEmpty ? null : note.text.trim());
      final token = ref.read(authProvider) is SignedIn ? await ref.read(authProvider.notifier).accessToken() : null;
      final quote = await ref.read(quotesRepositoryProvider).create(request, token);
      ref.invalidate(myQuotesProvider);
      if (!mounted) return;
      context.pushReplacement('/kurumsal/teklif/takip?kod=${Uri.encodeQueryComponent(quote.code)}&eposta=${Uri.encodeQueryComponent(quote.email)}');
    } on QuoteException catch (e) {
      setState(() => error = e.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final products = ref.watch(productsProvider(const ProductQuery()));
    final options = ref.watch(quoteOptionsProvider).value;
    return Scaffold(
      appBar: accountBar('Kurumsal teklif'),
      body: products.when(
        loading: () => const LoadingView(),
        error: (e, _) => ErrorView(error: e, onRetry: () => ref.invalidate(productsProvider(const ProductQuery()))),
        data: (page) {
          final items = page.items.toList();
          return ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
            Text('Toplu ürün, kurumsal hediye ve kişiselleştirme ihtiyacını tek talepte anlat. Talep bir sipariş değildir; birim fiyatlı teklif e-postayla gelir.', style: text.bodyMedium),
            const SizedBox(height: 16),
            TextField(controller: company, decoration: accountField('Firma adı'), textInputAction: TextInputAction.next),
            const SizedBox(height: 10),
            TextField(controller: contact, decoration: accountField('Yetkili kişi'), textInputAction: TextInputAction.next),
            const SizedBox(height: 10),
            TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: accountField('Kurumsal e-posta'), textInputAction: TextInputAction.next),
            const SizedBox(height: 10),
            TextField(controller: phone, keyboardType: TextInputType.phone, decoration: accountField('Telefon (isteğe bağlı)')),
            const SizedBox(height: 20),
            Text('Ürün ve adet', style: text.titleMedium),
            for (final row in rows)
              Padding(
                padding: const EdgeInsets.only(top: 10),
                child: Row(children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      isExpanded: true,
                      initialValue: row.productId ?? items.first.id,
                      decoration: accountField('Ürün'),
                      items: [for (final product in items) DropdownMenuItem(value: product.id, child: Text(product.name, overflow: TextOverflow.ellipsis))],
                      onChanged: (value) => setState(() => row.productId = value),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(width: 96, child: TextField(controller: row.quantity, keyboardType: TextInputType.number, decoration: accountField('Adet'))),
                  if (rows.length > 1) IconButton(tooltip: 'Ürünü kaldır', icon: const Icon(Icons.close), onPressed: () => setState(() => rows.remove(row))),
                ]),
              ),
            if (rows.length < (options?.maxItems ?? 10))
              Align(alignment: Alignment.centerLeft, child: TextButton.icon(onPressed: () => setState(() => rows.add(_Row(null, TextEditingController(text: '${options?.minQuantity ?? 10}')))), icon: const Icon(Icons.add), label: const Text('Ürün ekle'))),
            Text('Ürün başına en az ${options?.minQuantity ?? 10} adet.', style: text.bodySmall),
            const SizedBox(height: 16),
            SwitchListTile(contentPadding: EdgeInsets.zero, title: const Text('Kurumsal kişiselleştirme istiyorum'), subtitle: const Text('Logo, isim veya kampanya tasarımı'), value: personalization, onChanged: (value) => setState(() => personalization = value)),
            if (personalization) TextField(controller: personalizationNote, maxLength: 500, decoration: accountField('Kişiselleştirme notu')),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              isExpanded: true,
              initialValue: purpose,
              decoration: accountField('Kullanım amacı'),
              items: [for (final item in options?.purposes ?? BuiltList<String>()) DropdownMenuItem(value: item, child: Text(item))],
              onChanged: (value) => setState(() => purpose = value),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              icon: const Icon(Icons.event_outlined),
              label: Text(desiredDate == null ? 'Hedef teslim tarihi (isteğe bağlı)' : 'Hedef: ${desiredDate!.day}.${desiredDate!.month}.${desiredDate!.year}'),
              onPressed: () async {
                final now = DateTime.now();
                final date = await showDatePicker(context: context, firstDate: now, lastDate: now.add(const Duration(days: 700)), initialDate: desiredDate ?? now.add(const Duration(days: 30)));
                if (date != null) setState(() => desiredDate = date);
              },
            ),
            const SizedBox(height: 10),
            TextField(controller: note, maxLines: 4, maxLength: 2000, decoration: accountField('Notun')),
            FormErrorText(error),
            const SizedBox(height: 12),
            FilledButton(onPressed: busy ? null : () => _submit(items), child: Text(busy ? 'Gönderiliyor…' : 'Teklif talebini gönder')),
            const SizedBox(height: 8),
            TextButton(onPressed: () => context.push('/kurumsal/teklif/takip'), child: const Text('Mevcut talebimi takip et')),
          ]);
        },
      ),
    );
  }
}

/// /kurumsal/teklif/takip
class QuoteTrackScreen extends ConsumerStatefulWidget {
  const QuoteTrackScreen({super.key, this.code, this.email});
  final String? code;
  final String? email;
  @override
  ConsumerState<QuoteTrackScreen> createState() => _QuoteTrackScreenState();
}

class _QuoteTrackScreenState extends ConsumerState<QuoteTrackScreen> {
  late final code = TextEditingController(text: widget.code ?? '');
  late final email = TextEditingController(text: widget.email ?? '');
  final message = TextEditingController(), decisionNote = TextEditingController();
  Quote? quote;
  bool busy = false;
  String? error;

  @override
  void initState() {
    super.initState();
    if (widget.code != null && widget.email != null) WidgetsBinding.instance.addPostFrameCallback((_) => _run(() => ref.read(quotesRepositoryProvider).track(code.text, email.text)));
  }

  @override
  void dispose() {
    for (final controller in [code, email, message, decisionNote]) {
      controller.dispose();
    }
    super.dispose();
  }

  Future<void> _run(Future<Quote> Function() action) async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final result = await action();
      if (mounted) setState(() => quote = result);
    } on QuoteException catch (e) {
      if (mounted) setState(() => error = e.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final current = quote;
    final open = current != null && ['received', 'reviewing', 'offered'].contains(current.status);
    return Scaffold(
      appBar: accountBar('Teklif takibi'),
      body: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
        TextField(controller: code, decoration: accountField('Teklif kodu'), textCapitalization: TextCapitalization.characters),
        const SizedBox(height: 10),
        TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: accountField('Talebi gönderdiğin e-posta')),
        const SizedBox(height: 10),
        FilledButton(onPressed: busy ? null : () => _run(() => ref.read(quotesRepositoryProvider).track(code.text, email.text)), child: const Text('Teklifi getir')),
        FormErrorText(error),
        if (current != null) ...[
          const SizedBox(height: 20),
          Text('${current.code} · ${current.company}', style: text.titleLarge),
          Text(quoteStatusText(current.status), style: text.titleSmall),
          const SizedBox(height: 12),
          for (final item in current.items)
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(item.productName),
              subtitle: Text('${item.quantity} adet${item.unitPrice == null ? '' : ' × ${formatMoney(item.unitPrice)}'}'),
              trailing: item.lineTotal == null ? null : Text(formatMoney(item.lineTotal)),
            ),
          if (current.offer case final offer?) ...[
            const Divider(),
            Text('Toplam: ${formatMoney(offer.total)}', style: text.titleMedium),
            Text('Geçerlilik: ${offer.validUntil.day}.${offer.validUntil.month}.${offer.validUntil.year}', style: text.bodySmall),
            if (offer.note != null) Text('Satış ekibinin notu: ${offer.note}', style: text.bodySmall),
          ],
          if (current.status == 'offered') ...[
            const SizedBox(height: 12),
            TextField(controller: decisionNote, maxLength: 1000, decoration: accountField('Notun (isteğe bağlı)')),
            Row(children: [
              Expanded(child: FilledButton(onPressed: busy ? null : () => _run(() => ref.read(quotesRepositoryProvider).decide(current, true, decisionNote.text.trim().isEmpty ? null : decisionNote.text.trim())), child: const Text('Kabul et'))),
              const SizedBox(width: 8),
              Expanded(child: OutlinedButton(onPressed: busy ? null : () => _run(() => ref.read(quotesRepositoryProvider).decide(current, false, decisionNote.text.trim().isEmpty ? null : decisionNote.text.trim())), child: const Text('Reddet'))),
            ]),
            Text('Kabul ödeme başlatmaz; satış ekibi sipariş ve teslimat için seninle iletişime geçer.', style: text.bodySmall),
          ],
          const SizedBox(height: 16),
          Text('Mesajlar', style: text.titleMedium),
          if (current.messages.isEmpty) Text('Henüz mesaj yok.', style: text.bodySmall),
          for (final item in current.messages)
            Align(
              alignment: item.from == 'store' ? Alignment.centerRight : Alignment.centerLeft,
              child: Container(
                margin: const EdgeInsets.only(top: 8),
                padding: const EdgeInsets.all(10),
                constraints: const BoxConstraints(maxWidth: 300),
                decoration: BoxDecoration(color: item.from == 'store' ? XinobiTokens.teal : const Color(0xFFF3F3F3), borderRadius: BorderRadius.circular(10)),
                child: Text('${item.from == 'store' ? 'Xinobi satış' : current.contactName}\n${item.text}', style: text.bodyMedium?.copyWith(color: item.from == 'store' ? XinobiTokens.onHeader : XinobiTokens.ink)),
              ),
            ),
          if (open) ...[
            const SizedBox(height: 12),
            TextField(controller: message, maxLines: 3, maxLength: 2000, decoration: accountField('Mesajın')),
            OutlinedButton(
              onPressed: busy ? null : () async {
                final value = message.text.trim();
                if (value.length < 2) return;
                await _run(() => ref.read(quotesRepositoryProvider).message(current, value));
                message.clear();
              },
              child: const Text('Mesaj gönder'),
            ),
          ],
        ],
      ]),
    );
  }
}

/// /hesap/teklifler — requests sent while signed in or with the account's e-mail.
class MyQuotesScreen extends ConsumerWidget {
  const MyQuotesScreen({super.key});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final quotes = ref.watch(myQuotesProvider);
    return Scaffold(
      appBar: accountBar('Tekliflerim'),
      floatingActionButton: FloatingActionButton.extended(onPressed: () => context.push('/kurumsal/teklif'), icon: const Icon(Icons.add), label: const Text('Yeni talep')),
      body: quotes.when(
        loading: () => const LoadingView(),
        error: (e, _) => ErrorView(error: e, onRetry: () => ref.invalidate(myQuotesProvider)),
        data: (items) => items.isEmpty
            ? const EmptyView('Henüz kurumsal teklif talebin yok.')
            : ListView(children: [
                for (final quote in items)
                  ListTile(
                    title: Text('${quote.code} · ${quote.company}'),
                    subtitle: Text('${quote.items.map((item) => '${item.productName} × ${item.quantity}').join(', ')}\n${quoteStatusText(quote.status)}'),
                    isThreeLine: true,
                    trailing: quote.offer == null ? null : Text(formatMoney(quote.offer!.total)),
                    onTap: () => context.push('/kurumsal/teklif/takip?kod=${Uri.encodeQueryComponent(quote.code)}&eposta=${Uri.encodeQueryComponent(quote.email)}'),
                  ),
              ]),
      ),
    );
  }
}
