import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../app/theme.dart';
import '../../core/formatting.dart';
import '../../widgets/common.dart';
import '../favorites/favorite_button.dart';

// Mobile versions of the web home sections (apps/web/src/components/personalization-feature.tsx,
// titanium-feature.tsx and the featured/values/story blocks in app/page.tsx), using the web's ≤700 px values.

const _gutter = EdgeInsets.symmetric(horizontal: XinobiTokens.gutterMobile);

/// "Sen anlat. AI tasarlasın." — the designed XINOBI U block that replaced the raster banner on the web (529c107, 7e96a8e).
class XinobiUFeature extends StatelessWidget {
  const XinobiUFeature({super.key});

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(color: XinobiTokens.surface, border: Border(bottom: BorderSide(color: Color(0xFFEDEDEB)))),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 28, XinobiTokens.gutterMobile, 28),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('XINOBI U · AI İLE KİŞİYE ÖZEL TASARIM', style: inter(10, weight: 700, letterSpacing: .08, color: const Color(0xFF080808))),
          const SizedBox(height: 14),
          Semantics(
            header: true,
            child: Text('Sen anlat.\nAI tasarlasın.', style: inter(36, weight: 750, height: 1.03, letterSpacing: -.055, color: const Color(0xFF080808))),
          ),
          const SizedBox(height: 16),
          Text('Birkaç soruyu yanıtla. Sana özel tasarımını oluştur, ürün üzerinde dene.', style: inter(16, height: 1.4, color: const Color(0xFF080808))),
          const SizedBox(height: 18),
          FilledButton(
            onPressed: () => context.go('/xinobi-u'),
            style: FilledButton.styleFrom(
              backgroundColor: XinobiTokens.cta,
              foregroundColor: XinobiTokens.surface,
              minimumSize: const Size(0, 56),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Flexible(child: Text('Tasarımını keşfet', overflow: TextOverflow.ellipsis, style: inter(16, weight: 650, color: XinobiTokens.surface))),
              const SizedBox(width: 30),
              const ExcludeSemantics(child: Text('→', style: TextStyle(fontSize: 24, height: 1))),
            ]),
          ),
          const SizedBox(height: 22),
          const Divider(height: 1, color: Color(0xFFDDDDDD)),
          const SizedBox(height: 18),
          const _Steps(),
          const SizedBox(height: 28),
          const _Visual(),
        ]),
      ),
    );
  }
}

class _Steps extends StatelessWidget {
  const _Steps();
  @override
  Widget build(BuildContext context) {
    const steps = [(Icons.description_outlined, 'Soruları yanıtla'), (Icons.auto_awesome_outlined, 'AI tasarlasın'), (Icons.view_in_ar_outlined, 'Üründe dene')];
    return Semantics(
      label: 'Nasıl çalışır: 1 Soruları yanıtla, 2 AI tasarlasın, 3 Üründe dene',
      excludeSemantics: true,
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        for (var i = 0; i < steps.length; i++) ...[
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Icon(steps[i].$1, size: 30, color: XinobiTokens.ink),
              const SizedBox(height: 5),
              Text('0${i + 1}', style: inter(12, weight: 700)),
              Text(steps[i].$2, style: inter(12)),
            ]),
          ),
          if (i < steps.length - 1) Padding(padding: const EdgeInsets.only(top: 14, right: 8), child: Text('›', style: inter(28, color: const Color(0xFFAAAAAA)))),
        ],
      ]),
    );
  }
}

/// Product with the sample design, a sample question card and the generated artwork, as on the web.
class _Visual extends StatelessWidget {
  const _Visual();
  @override
  Widget build(BuildContext context) {
    return ExcludeSemantics(
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Container(
          height: 370,
          decoration: const BoxDecoration(
            gradient: RadialGradient(center: Alignment(-.3, .7), radius: 1.1, colors: [Color(0xFFFAFAFA), Color(0xFFE7E8EA), Color(0xFFD7D9DD)], stops: [0, .45, 1]),
          ),
          child: Stack(children: [
            Positioned.fill(
              left: 64,
              top: 38,
              child: Image.asset('assets/home/japanese-wave-product.png', fit: BoxFit.contain, semanticLabel: 'Japon dalga deseni uygulanmış Xinobi çay makinesi'),
            ),
            Positioned(
              top: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(color: XinobiTokens.surface, borderRadius: BorderRadius.circular(24)),
                child: Text('Ürün üzerinde önizleme', style: inter(10, weight: 600)),
              ),
            ),
            Positioned(
              left: 10,
              top: 85,
              width: 145,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xF2FFFFFF), borderRadius: BorderRadius.circular(12)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('Sana nasıl bir tasarım yakışır?', style: inter(13, weight: 650, height: 1.2)),
                  const SizedBox(height: 10),
                  Text('Hangi tarz sana daha yakın?', style: inter(10)),
                  const SizedBox(height: 6),
                  for (final (symbol, label, chosen) in const [('◌', 'Minimal', false), ('♧', 'Doğadan ilham', false), ('∿', 'Soyut', true)])
                    Container(
                      margin: const EdgeInsets.only(top: 7),
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: chosen ? const Color(0xFFFFEDF0) : null,
                        border: Border.all(color: chosen ? XinobiTokens.cta : const Color(0xFFD6D6DA)),
                        borderRadius: BorderRadius.circular(7),
                      ),
                      child: Row(children: [
                        SizedBox(width: 22, child: Text(symbol, style: inter(18, height: 1))),
                        const SizedBox(width: 6),
                        Flexible(child: Text(label, style: inter(10, weight: 500))),
                      ]),
                    ),
                ]),
              ),
            ),
            Positioned(
              right: 10,
              bottom: 14,
              width: 90,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: XinobiTokens.surface, borderRadius: BorderRadius.circular(12)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('AI tasarımın', style: inter(11, weight: 700)),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    // Share the full-bleed artwork with the web marketing card.
                    child: AspectRatio(aspectRatio: 1, child: Image.asset('assets/home/japanese-wave-artwork.png', fit: BoxFit.cover)),
                  ),
                ]),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

/// Titanium coating feature; the photo is editable in the admin (content.titaniumImage → featureImageUrl).
class TitaniumFeature extends StatelessWidget {
  const TitaniumFeature({super.key, required this.imageUrl});
  final String? imageUrl;

  @override
  Widget build(BuildContext context) {
    const panel = Color(0xFF19191B);
    const gold = Color(0xFFAE7D43);
    return Padding(
      padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 0, XinobiTokens.gutterMobile, 40),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: ColoredBox(
          color: panel,
          child: Stack(children: [
            if (imageUrl != null)
              Positioned.fill(
                child: Opacity(
                  opacity: .25,
                  child: ColorFiltered(colorFilter: const ColorFilter.matrix(_grayscale70), child: RemoteImage(imageUrl, fit: BoxFit.cover)),
                ),
              ),
            const Positioned.fill(
              child: DecoratedBox(decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xEE19191B), Color(0xE019191B)]))),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(22, 28, 22, 28),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Wrap(spacing: 8, runSpacing: 8, crossAxisAlignment: WrapCrossAlignment.center, children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 7),
                    decoration: BoxDecoration(color: gold.withValues(alpha: .15), borderRadius: BorderRadius.circular(4)),
                    child: Text('TİTANYUM KAPLAMA SERİSİ', style: inter(10, weight: 650, letterSpacing: .07, color: gold)),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(color: const Color(0x8868071F), borderRadius: BorderRadius.circular(20)),
                    child: Text('YENİ NESİL', style: inter(10, weight: 650, color: const Color(0xFFF41440))),
                  ),
                ]),
                const SizedBox(height: 16),
                Semantics(
                  header: true,
                  child: Text('Dayanıklılığın Zarif Hali: Titanyum Kaplama Teknolojisi.',
                      style: inter(30, weight: 650, height: 1.23, letterSpacing: -.04, color: XinobiTokens.surface)),
                ),
                const SizedBox(height: 16),
                Text(
                  'Çizilmelere, korozyona ve zamana meydan okuyan titanyum zırh, sessiz zarafetle buluştu. Saf metalurjik saflık ve kusursuz ısı dengesi mutfağınızda.',
                  style: inter(15, height: 1.6, color: const Color(0xFFB8B7BC)),
                ),
                const SizedBox(height: 24),
                for (final (name, note, color) in const [
                  ('Titanium Gold', 'Sıcak mat ışıltı', Color(0xFFA77A40)),
                  ('Rose Titan', 'Zarif pembe tını', Color(0xFFB66F80)),
                  ('Silver Titan', 'Doğal metalurji', Color(0xFFA0AFC2)),
                ])
                  Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: const Color(0x05FFFFFF), border: Border.all(color: const Color(0x26FFFFFF)), borderRadius: BorderRadius.circular(9)),
                    child: Row(children: [
                      Container(width: 12, height: 12, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
                      const SizedBox(width: 6),
                      Expanded(child: Text(name, style: inter(12, weight: 500, color: XinobiTokens.surface))),
                      Text(note, style: inter(11, color: const Color(0xFFBAB9BF))),
                    ]),
                  ),
                const SizedBox(height: 14),
                FilledButton(
                  onPressed: () => context.go('/urunler'),
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFFE60032),
                    foregroundColor: XinobiTokens.surface,
                    padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  child: Row(mainAxisSize: MainAxisSize.min, children: [
                    Flexible(child: Text('Titanyum Serisini Keşfet', overflow: TextOverflow.ellipsis, style: inter(14, weight: 600, color: XinobiTokens.surface))),
                    const SizedBox(width: 24),
                    const ExcludeSemantics(child: Text('→', style: TextStyle(fontSize: 22, height: 1))),
                  ]),
                ),
                const SizedBox(height: 16),
                Text('✧  LEKE TUTMAZ', style: inter(12, letterSpacing: .05, color: gold)),
                if (imageUrl != null) ...[
                  const SizedBox(height: 28),
                  AspectRatio(aspectRatio: 1680 / 936, child: RemoteImage(imageUrl, label: 'Bronz ve altın titanyum kaplamalı Xinobi çay makineleri')),
                  const SizedBox(height: 16),
                  Align(
                    alignment: Alignment.centerRight,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(color: const Color(0x8819191B), border: Border.all(color: const Color(0x26FFFFFF)), borderRadius: BorderRadius.circular(20)),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(width: 8, height: 8, decoration: const BoxDecoration(color: Color(0xFF9E7445), shape: BoxShape.circle)),
                        const SizedBox(width: 6),
                        Text('Grade 5 Titanyum Kaplama', style: inter(11, color: const Color(0xFFC8C7CE))),
                      ]),
                    ),
                  ),
                ],
              ]),
            ),
          ]),
        ),
      ),
    );
  }
}

/// 70 % grayscale, like the web's `filter: grayscale(.7)`.
const List<double> _grayscale70 = [
  .5126, .5152, .0722, 0, 0, //
  .1488, .8784, .0722, 0, 0, //
  .1488, .5152, .4360, 0, 0, //
  0, 0, 0, 1, 0,
];

/// Section heading in the web style: small uppercase eyebrow, then a light headline.
class SectionHeading extends StatelessWidget {
  const SectionHeading({super.key, required this.eyebrow, required this.title});
  final String eyebrow;
  final String title;
  @override
  Widget build(BuildContext context) => Padding(
        padding: _gutter,
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(eyebrow.toUpperCase(), style: inter(12, weight: 700, letterSpacing: .14, color: XinobiTokens.teal)),
          const SizedBox(height: 18),
          Semantics(header: true, child: Text(title, style: inter(35, height: 1.2, letterSpacing: -.045))),
        ]),
      );
}

/// "Öne çıkanlar": swipeable large cards, as the web shows them under 768 px.
class FeaturedProducts extends StatelessWidget {
  const FeaturedProducts({super.key, required this.products});
  final List<ProductSummary> products;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width * .9;
    return Padding(
      padding: const EdgeInsets.only(top: 56, bottom: 24),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const SectionHeading(eyebrow: 'Öne çıkanlar', title: 'Form ve işlev, tek çizgide.'),
        const SizedBox(height: 28),
        SizedBox(
          height: width * 3 / 4 + 170,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: _gutter,
            itemCount: products.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (context, i) => SizedBox(width: width, child: _FeaturedCard(product: products[i])),
          ),
        ),
      ]),
    );
  }
}

class _FeaturedCard extends StatelessWidget {
  const _FeaturedCard({required this.product});
  final ProductSummary product;

  @override
  Widget build(BuildContext context) {
    void open() => context.push('/urunler/${Uri.encodeComponent(product.id)}');
    return Stack(children: [
      Semantics(
        button: true,
        label: '${product.name}, ${formatMoney(product.priceFrom)}${product.inStock ? '' : ', stokta yok'}',
        onTap: open,
        excludeSemantics: true,
        child: InkWell(
          onTap: open,
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: AspectRatio(
                aspectRatio: 4 / 3,
                child: Stack(children: [
                  Positioned.fill(child: ColoredBox(color: XinobiTokens.surface, child: RemoteImage(product.imageUrl))),
                  if (product.colorCount > 1)
                    Positioned(
                      left: 12,
                      top: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(color: XinobiTokens.surface, border: Border.all(color: const Color(0xFFDDDDDD)), borderRadius: BorderRadius.circular(20)),
                        child: Text('• ${product.colorCount} renk', style: inter(12)),
                      ),
                    ),
                ]),
              ),
            ),
            const SizedBox(height: 21),
            Text(product.category.toUpperCase(), style: inter(11, weight: 700, letterSpacing: .14, color: XinobiTokens.teal)),
            const SizedBox(height: 8),
            Text(product.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: inter(24, weight: 500, letterSpacing: -.02)),
            const SizedBox(height: 6),
            Text([formatMoney(product.priceFrom), if (!product.inStock) 'Stokta yok'].join(' · '), style: inter(14, color: const Color(0xFF5D5D5D))),
            const SizedBox(height: 16),
            Row(mainAxisSize: MainAxisSize.min, children: [
              Text('Ürünü incele', style: inter(14, weight: 500)),
              const SizedBox(width: 7),
              const Icon(Icons.arrow_forward, size: 17),
            ]),
          ]),
        ),
      ),
      Positioned(top: 4, right: 4, child: FavoriteButton(productId: product.id, productName: product.name, onImage: true)),
    ]);
  }
}

/// Three brand values and the "Xinobi Dünyası" statement that close the web home.
class ValuesAndStory extends StatelessWidget {
  const ValuesAndStory({super.key});

  @override
  Widget build(BuildContext context) {
    const values = [
      ('01', 'Ürün merkezli', 'Gerçek ürün, doğru varyant ve açık bilgi.\nAbartısız mühendislik, saf malzeme kalitesi.'),
      ('02', 'Size özgü', 'Kişisel seçimlerinize alan açan tasarım.\nYapay zekâ ile her eve biricik dokunuşlar.'),
      ('03', 'Tek deneyim', 'Web ve mobilde aynı sakin akış.\nKarmaşadan uzak, pürüzsüz müşteri yolculuğu.'),
    ];
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 24, XinobiTokens.gutterMobile, 24),
        // Stretch so every value card spans the full width, whatever the length of its text.
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          for (final (number, title, text) in values)
            Container(
              margin: const EdgeInsets.only(bottom: 34),
              padding: const EdgeInsets.only(top: 20),
              decoration: const BoxDecoration(border: Border(top: BorderSide(color: Color(0xFFA6A6A6)))),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(number, style: inter(11, color: XinobiTokens.teal)),
                const SizedBox(height: 13),
                Text(title, style: inter(22, weight: 500)),
                const SizedBox(height: 6),
                Text(text, style: inter(15, height: 1.5, color: const Color(0xFF5D5D5D))),
              ]),
            ),
        ]),
      ),
      Padding(
        padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 32, XinobiTokens.gutterMobile, 56),
        child: Column(children: [
          Text('XINOBI DÜNYASI', textAlign: TextAlign.center, style: inter(12, weight: 700, letterSpacing: .14, color: XinobiTokens.teal)),
          const SizedBox(height: 18),
          Semantics(
            header: true,
            child: Text('Teknoloji görünür olmak için değil, hayatınıza uyum sağlamak için.',
                textAlign: TextAlign.center, style: inter(35, height: 1.2, letterSpacing: -.045)),
          ),
        ]),
      ),
    ]);
  }
}
