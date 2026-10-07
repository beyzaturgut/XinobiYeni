import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../catalog/catalog_repository.dart';

/// Announcements published from the panel (/api/v1/content/announcements), newest first.
final announcementsProvider = FutureProvider<List<AnnouncementItem>>((ref) async {
  final items = (await ref.watch(catalogRepositoryProvider).announcements()).items.toList();
  items.sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
  return items;
});

/// Ids already shown on this device, so the header badge counts only new announcements.
const seenAnnouncementsKey = 'xinobi-seen-announcements';

class SeenAnnouncements extends Notifier<Set<String>?> {
  @override
  Set<String>? build() {
    _load();
    return null;
  }

  Future<void> _load() async {
    final stored = (await SharedPreferences.getInstance()).getStringList(seenAnnouncementsKey) ?? const [];
    state ??= stored.toSet();
  }

  /// Marks [ids] as read; ids no longer published are dropped so the list cannot grow forever.
  Future<void> markRead(Iterable<String> ids) async {
    final next = ids.toSet();
    if (state != null && next.difference(state!).isEmpty && state!.length == next.length) return;
    state = next;
    await (await SharedPreferences.getInstance()).setStringList(seenAnnouncementsKey, next.toList());
  }
}

final seenAnnouncementsProvider = NotifierProvider<SeenAnnouncements, Set<String>?>(SeenAnnouncements.new);

/// Zero while either side is still loading or the API is unreachable: a badge must never guess.
final unreadAnnouncementsProvider = Provider<int>((ref) {
  final seen = ref.watch(seenAnnouncementsProvider);
  final items = ref.watch(announcementsProvider).asData?.value;
  if (seen == null || items == null) return 0;
  return items.where((item) => !seen.contains(item.id)).length;
});
