import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import 'news.dart';

class NewsScreen extends ConsumerStatefulWidget {
  const NewsScreen({super.key});
  @override
  ConsumerState<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends ConsumerState<NewsScreen> {
  /// What was read before this visit, so "Yeni" stays on new items while the page is open.
  Set<String>? readBefore;

  @override
  Widget build(BuildContext context) {
    final announcements = ref.watch(announcementsProvider);
    final seen = ref.watch(seenAnnouncementsProvider);
    final items = announcements.asData?.value;
    if (seen != null && items != null) {
      readBefore ??= seen;
      // Opening the page reads everything on it.
      // After the frame: providers must not change while widgets build.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) ref.read(seenAnnouncementsProvider.notifier).markRead(items.map((item) => item.id));
      });
    }
    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: const Text('Haber ve duyurular'),
      ),
      body: announcements.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(announcementsProvider)),
        data: (items) => RefreshIndicator(
          onRefresh: () => ref.refresh(announcementsProvider.future),
          child: items.isEmpty
              ? ListView(children: const [SizedBox(height: 120), EmptyView('Henüz haber veya duyuru yok.')])
              : ListView.separated(
                  padding: const EdgeInsets.all(XinobiTokens.gutterMobile),
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 12),
                  itemBuilder: (context, index) => _AnnouncementCard(item: items[index], isNew: !(readBefore ?? const {}).contains(items[index].id)),
                ),
        ),
      ),
    );
  }
}

String formatDate(DateTime value) {
  final local = value.toLocal();
  return '${local.day.toString().padLeft(2, '0')}.${local.month.toString().padLeft(2, '0')}.${local.year}';
}

class _AnnouncementCard extends StatelessWidget {
  const _AnnouncementCard({required this.item, required this.isNew});
  final AnnouncementItem item;
  final bool isNew;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Semantics(
      container: true,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: XinobiTokens.surface, border: Border.all(color: XinobiTokens.line)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Row(children: [
            Expanded(child: Text('${item.kind} · ${formatDate(item.publishedAt)}', style: text.bodySmall)),
            if (isNew)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                color: XinobiTokens.danger,
                child: Text('Yeni', style: text.labelSmall?.copyWith(color: XinobiTokens.onHeader)),
              ),
          ]),
          const SizedBox(height: 6),
          Semantics(header: true, child: Text(item.title, style: text.titleMedium)),
          const SizedBox(height: 6),
          Text(item.body, style: text.bodyMedium),
        ]),
      ),
    );
  }
}
