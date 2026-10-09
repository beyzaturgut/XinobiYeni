import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../app/design_tokens.g.dart';
import '../features/account/notifications.dart';
import '../features/news/news.dart';

/// Single 64px black strip (DES-HDR-01 rev.1, mobile revision): logo on the left; favourites and news on the right.
/// Search lives in the Ürünler tab.
class XinobiHeader extends ConsumerWidget implements PreferredSizeWidget {
  const XinobiHeader({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(XinobiTokens.headerHeight);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unread = ref.watch(unreadAnnouncementsProvider);
    return Material(
      color: XinobiTokens.header,
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: XinobiTokens.headerHeight,
          child: Padding(
            padding: const EdgeInsets.only(left: XinobiTokens.gutterMobile, right: 4),
            child: Row(
              children: [
                Semantics(
                  label: 'Xinobi, ana sayfa',
                  button: true,
                  excludeSemantics: true,
                  child: InkWell(
                    onTap: () => context.go('/'),
                    // The touch target must not depend on the image having decoded.
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(minWidth: XinobiTokens.headerTouchTarget, minHeight: XinobiTokens.headerTouchTarget),
                      child: Center(
                        widthFactor: 1,
                        child: Image.asset('assets/brand/xinobi-logo-white.png', height: XinobiTokens.headerLogoHeightMobile, excludeFromSemantics: true),
                      ),
                    ),
                  ),
                ),
                const Spacer(),
                const NotificationBell(),
                IconButton(
                  tooltip: 'Favorilerim',
                  color: XinobiTokens.onHeader,
                  icon: const Icon(Icons.favorite_border),
                  onPressed: () => context.push('/favoriler'),
                ),
                IconButton(
                  tooltip: unread > 0 ? 'Haber ve duyurular, $unread yeni' : 'Haber ve duyurular',
                  color: XinobiTokens.onHeader,
                  // The tooltip already says the count; the badge text would otherwise replace the button's name.
                  icon: ExcludeSemantics(
                    child: Badge(
                      isLabelVisible: unread > 0,
                      label: Text('$unread'),
                      backgroundColor: XinobiTokens.danger,
                      child: const Icon(Icons.mail_outline),
                    ),
                  ),
                  onPressed: () => context.push('/duyurular'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
