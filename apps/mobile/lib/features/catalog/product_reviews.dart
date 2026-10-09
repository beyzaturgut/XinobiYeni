import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../account/account_widgets.dart';
import '../account/auth.dart';
import '../account/orders.dart';
import '../compare/compare_screen.dart' show stars;
import 'catalog_repository.dart';

/// The signed-in customer's own reviews; empty when signed out.
final myReviewsProvider = FutureProvider.autoDispose<List<MyReview>>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return const [];
  return await ref.read(authProvider.notifier).withSession((repository, token) => repository.myReviews(token)) ?? const [];
});

String reviewDate(DateTime value) {
  final local = value.toLocal();
  return '${local.day.toString().padLeft(2, '0')}.${local.month.toString().padLeft(2, '0')}.${local.year}';
}

/// Technical specs block for the product page.
class ProductSpecs extends StatelessWidget {
  const ProductSpecs({super.key, required this.specs});
  final List<ProductSpec> specs;
  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Semantics(header: true, child: Text('Teknik özellikler', style: text.titleLarge)),
      const SizedBox(height: 8),
      for (final spec in specs)
        Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: XinobiTokens.line))),
          child: Row(children: [
            Expanded(child: Text(spec.name, style: text.bodyMedium?.copyWith(color: XinobiTokens.muted))),
            Flexible(child: Text(spec.value, textAlign: TextAlign.right, style: text.bodyMedium?.copyWith(fontWeight: FontWeight.w600))),
          ]),
        ),
    ]);
  }
}

/// Rating summary, approved reviews and — for customers who received the product — a review form.
class ProductReviews extends ConsumerWidget {
  const ProductReviews({super.key, required this.productId, required this.productName});
  final String productId;
  final String productName;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final page = ref.watch(productReviewsProvider(productId)).value;
    if (page == null) return const SizedBox.shrink();
    final text = Theme.of(context).textTheme;
    final signedIn = ref.watch(authProvider) is SignedIn;
    final purchased = (ref.watch(ordersProvider).value ?? const []).any((order) => order.status == 'delivered' && order.lines.any((line) => line.productId == productId));
    final mine = (ref.watch(myReviewsProvider).value ?? const []).where((review) => review.productId == productId).firstOrNull;
    final summary = page.summary;
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Semantics(header: true, child: Text('Müşteri değerlendirmeleri', style: text.titleLarge)),
      const SizedBox(height: 8),
      if (summary.count > 0) ...[
        Semantics(
          label: '5 üzerinden ${summary.average}, ${summary.count} değerlendirme',
          child: ExcludeSemantics(child: Text('${stars(summary.average)}  ${summary.average} / 5 · ${summary.count} değerlendirme', style: text.titleSmall?.copyWith(color: const Color(0xFF8A6100)))),
        ),
        const SizedBox(height: 8),
        for (var star = 5; star >= 1; star--)
          Row(children: [
            SizedBox(width: 56, child: Text('$star yıldız', style: text.bodySmall)),
            Expanded(child: LinearProgressIndicator(value: summary.distribution[star - 1] / summary.count, minHeight: 6, color: const Color(0xFFC58B00), backgroundColor: XinobiTokens.line)),
            SizedBox(width: 28, child: Text(' ${summary.distribution[star - 1]}', style: text.bodySmall)),
          ]),
      ] else
        Text('Bu ürün için henüz yayınlanmış değerlendirme yok.', style: text.bodySmall),
      const SizedBox(height: 12),
      if (mine != null)
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: const BoxDecoration(color: Color(0xFFFAFAFA), border: Border(left: BorderSide(width: 3, color: XinobiTokens.teal))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text('Senin değerlendirmen · ${switch (mine.status) { 'approved' => 'Yayında', 'rejected' => 'Yayınlanmadı', _ => 'Onay bekliyor' }}', style: text.titleSmall),
            Text('${stars(mine.rating.toDouble())} ${mine.title ?? ''}'),
            Text(mine.body, style: text.bodySmall),
            if (mine.moderationNote != null) Text('Not: ${mine.moderationNote}', style: text.bodySmall),
          ]),
        ),
      if (signedIn && purchased)
        OutlinedButton(
          onPressed: () => showModalBottomSheet<void>(context: context, isScrollControlled: true, builder: (_) => ReviewForm(productId: productId, productName: productName, initial: mine)),
          child: Text(mine == null ? 'Ürünü değerlendir' : 'Değerlendirmeni düzenle'),
        )
      else if (!signedIn)
        Text('Ürünü teslim aldıysan giriş yaparak değerlendirebilirsin.', style: text.bodySmall),
      const SizedBox(height: 8),
      for (final review in page.items)
        Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: const BoxDecoration(border: Border(bottom: BorderSide(color: XinobiTokens.line))),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Semantics(label: '5 üzerinden ${review.rating}', child: ExcludeSemantics(child: Text('${stars(review.rating.toDouble())}  ${review.title ?? ''}', style: text.titleSmall))),
            const SizedBox(height: 4),
            Text(review.body, style: text.bodyMedium),
            const SizedBox(height: 4),
            Text('${review.authorName} · ${reviewDate(review.createdAt)}${review.color == null ? '' : ' · ${review.color}'} · Doğrulanmış satın alma', style: text.bodySmall),
            if (review.storeReply != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text('Xinobi yanıtı: ${review.storeReply}', style: text.bodySmall)),
          ]),
        ),
    ]);
  }
}

class ReviewForm extends ConsumerStatefulWidget {
  const ReviewForm({super.key, required this.productId, required this.productName, this.initial});
  final String productId;
  final String productName;
  final MyReview? initial;
  @override
  ConsumerState<ReviewForm> createState() => _ReviewFormState();
}

class _ReviewFormState extends ConsumerState<ReviewForm> {
  late int rating = widget.initial?.rating ?? 0;
  late final title = TextEditingController(text: widget.initial?.title ?? '');
  late final body = TextEditingController(text: widget.initial?.body ?? '');
  bool busy = false;
  String? error;

  @override
  void dispose() {
    title.dispose();
    body.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await ref.read(authProvider.notifier).withSession((repository, token) => repository.submitReview(token, SubmitReview((b) => b
        ..productId = widget.productId
        ..rating = rating
        ..title = title.text.trim().isEmpty ? null : title.text.trim()
        ..body = body.text.trim())));
      ref.invalidate(myReviewsProvider);
      if (!mounted) return;
      Navigator.of(context).pop();
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Değerlendirmen alındı; mağaza onayından sonra yayınlanacak.')));
    } on AccountException catch (e) {
      setState(() => error = e.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Padding(
      padding: EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 20, XinobiTokens.gutterMobile, 20 + MediaQuery.viewInsetsOf(context).bottom),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text('${widget.productName} ürününü değerlendir', style: text.titleLarge),
        const SizedBox(height: 12),
        Row(children: [
          for (var star = 1; star <= 5; star++)
            IconButton(
              tooltip: '$star yıldız',
              isSelected: star <= rating,
              color: const Color(0xFFC58B00),
              icon: const Icon(Icons.star_border, size: 32),
              selectedIcon: const Icon(Icons.star, size: 32),
              onPressed: () => setState(() => rating = star),
            ),
        ]),
        const SizedBox(height: 8),
        TextField(controller: title, maxLength: 80, decoration: accountField('Başlık (isteğe bağlı)')),
        TextField(controller: body, maxLength: 2000, maxLines: 4, onChanged: (_) => setState(() {}), decoration: accountField('Yorumun', helper: 'En az 10 karakter')),
        FormErrorText(error),
        const SizedBox(height: 8),
        FilledButton(onPressed: rating == 0 || body.text.trim().length < 10 || busy ? null : submit, child: Text(busy ? 'Gönderiliyor…' : 'Değerlendirmeyi gönder')),
        const SizedBox(height: 8),
        Text('Değerlendirmen mağaza onayından sonra adının baş harfiyle (ör. Ayşe Y.) yayınlanır.', style: text.bodySmall),
      ]),
    );
  }
}
