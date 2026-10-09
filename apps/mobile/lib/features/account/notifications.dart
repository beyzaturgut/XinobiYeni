import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import 'auth.dart';
import 'orders.dart';

/// The account's in-app notifications (order, shipping, cancel and return events); null when signed out.
/// Rechecked every 30 seconds while something watches it, since the store moves orders along from the panel.
final inboxProvider = FutureProvider.autoDispose<Inbox?>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return null;
  final timer = Timer(const Duration(seconds: 30), ref.invalidateSelf);
  ref.onDispose(timer.cancel);
  return ref.read(authProvider.notifier).withSession((repository, token) => repository.inbox(token));
});

final unreadNotificationsProvider = Provider.autoDispose<int>((ref) => ref.watch(inboxProvider).value?.unread ?? 0);

String notificationDate(DateTime value) => orderDate(value);

/// /hesap/bildirimler
class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  Future<void> markRead(WidgetRef ref, List<String>? ids) async {
    await ref.read(authProvider.notifier).withSession((repository, token) => repository.markRead(token, ids));
    ref.invalidate(inboxProvider);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final inbox = ref.watch(inboxProvider);
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: const Text('Bildirimlerim'),
        actions: [
          if ((inbox.value?.unread ?? 0) > 0)
            TextButton(onPressed: () => markRead(ref, null), style: TextButton.styleFrom(foregroundColor: XinobiTokens.onHeader), child: const Text('Tümünü okundu say')),
        ],
      ),
      body: inbox.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(inboxProvider)),
        data: (value) {
          if (value == null) return const Center(child: Text('Bildirimlerini görmek için giriş yap.'));
          if (value.items.isEmpty) return const EmptyView('Henüz bildirimin yok.');
          return RefreshIndicator(
            onRefresh: () => ref.refresh(inboxProvider.future),
            child: ListView.separated(
              padding: const EdgeInsets.all(XinobiTokens.gutterMobile),
              itemCount: value.items.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = value.items[index];
                final orderId = Uri.tryParse(item.link ?? '')?.queryParameters['siparis'];
                return Material(
                  color: item.read ? XinobiTokens.surface : const Color(0xFFF6F6F6),
                  shape: RoundedRectangleBorder(
                    side: BorderSide(color: item.read ? XinobiTokens.line : XinobiTokens.teal),
                    borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall),
                  ),
                  child: ListTile(
                    title: Text(item.title, style: text.titleSmall?.copyWith(fontWeight: item.read ? FontWeight.w500 : FontWeight.w700)),
                    subtitle: Text('${item.body}\n${notificationDate(item.createdAt)}'),
                    isThreeLine: true,
                    trailing: item.read ? null : const Icon(Icons.circle, size: 10, semanticLabel: 'Okunmadı'),
                    onTap: () async {
                      if (!item.read) unawaited(markRead(ref, [item.id]));
                      if (orderId != null && context.mounted) await context.push('/hesap/siparisler/$orderId');
                    },
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

/// Header bell for signed-in customers with the unread count.
class NotificationBell extends ConsumerWidget {
  const NotificationBell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (ref.watch(authProvider) is! SignedIn) return const SizedBox.shrink();
    final unread = ref.watch(unreadNotificationsProvider);
    return IconButton(
      tooltip: unread > 0 ? 'Bildirimler, $unread okunmamış' : 'Bildirimler',
      color: XinobiTokens.onHeader,
      icon: ExcludeSemantics(
        child: Badge(isLabelVisible: unread > 0, label: Text(unread > 9 ? '9+' : '$unread'), backgroundColor: XinobiTokens.danger, child: const Icon(Icons.notifications_none)),
      ),
      onPressed: () => context.push('/hesap/bildirimler'),
    );
  }
}

