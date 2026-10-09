import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../core/formatting.dart';
import '../../core/ids.dart';
import '../../widgets/common.dart';
import '../account/account_widgets.dart';
import '../account/auth.dart';
import '../catalog/catalog_repository.dart';
import '../compare/compare.dart';
import 'nobi_mark.dart';

class NobiException implements Exception {
  const NobiException(this.message);
  final String message;
  @override
  String toString() => message;
}

/// Nobi, the sales assistant (/api/v1/assistant). Conversations belong to a random device id kept in preferences, or to the
/// signed-in account when a token is sent.
class NobiRepository {
  NobiRepository(XinobiApiClient client) : _api = client.getAssistantApi();
  final AssistantApi _api;
  static const _clientKey = 'xinobi-nobi-client';
  static const _conversationKey = 'xinobi-nobi-conversation';

  Future<String> clientId() async {
    final prefs = await SharedPreferences.getInstance();
    var id = prefs.getString(_clientKey);
    if (id == null) {
      id = uuidV4();
      await prefs.setString(_clientKey, id);
    }
    return id;
  }

  Future<String?> storedConversation() async => (await SharedPreferences.getInstance()).getString(_conversationKey);
  Future<void> rememberConversation(String? id) async {
    final prefs = await SharedPreferences.getInstance();
    if (id == null) {
      await prefs.remove(_conversationKey);
    } else {
      await prefs.setString(_conversationKey, id);
    }
  }

  Map<String, dynamic>? _bearer(String? token) => token == null ? null : {'Authorization': 'Bearer $token'};

  Future<AssistantConfig> config() => _call(() => _api.getAssistantConfig());
  Future<AssistantReply> send(String message, String? conversationId, String? token) async {
    final client = await clientId();
    return _call(() => _api.sendAssistantMessage(
        assistantMessageRequest: AssistantMessageRequest((b) => b
          ..conversationId = conversationId
          ..clientId = client
          ..message = message
          ..channel = 'mobile'),
        headers: _bearer(token)));
  }

  Future<AssistantConversationView> conversation(String id, String? token) async {
    final client = await clientId();
    return _call(() => _api.getAssistantConversation(id: id, clientId: client, headers: _bearer(token)));
  }

  Future<void> lead(String conversationId, {required String name, required String email, String? phone, required String topic, String? token}) async {
    final client = await clientId();
    await _call(() => _api.sendAssistantLead(
        id: conversationId,
        assistantLeadRequest: AssistantLeadRequest((b) => b
          ..clientId = client
          ..name = name
          ..email = email
          ..phone = phone
          ..topic = topic
          ..consent = true),
        headers: _bearer(token)));
  }

  Future<AssistantHandoff> handoff(String conversationId, String? token) async {
    final client = await clientId();
    return _call(() => _api.requestAssistantHandoff(id: conversationId, assistantHandoffRequest: AssistantHandoffRequest((b) => b.clientId = client), headers: _bearer(token)));
  }

  Future<T> _call<T>(Future<Response<T>> Function() request) async {
    try {
      final data = (await request()).data;
      if (data == null) throw const NobiException('Beklenmeyen boş yanıt alındı.');
      return data;
    } on DioException catch (error) {
      final body = error.response?.data;
      final title = body is Map ? body['title']?.toString() : null;
      throw NobiException(title ?? (error.response == null ? 'Nobi’ye ulaşılamadı. Bağlantını kontrol et.' : 'Nobi şu anda yanıt veremiyor.'));
    }
  }
}

final nobiRepositoryProvider = Provider<NobiRepository>((ref) => NobiRepository(ref.watch(apiClientProvider)));
final nobiConfigProvider = FutureProvider<AssistantConfig>((ref) => ref.watch(nobiRepositoryProvider).config());

/// Opens external links (WhatsApp); replaceable in tests.
final openUrlProvider = Provider<Future<bool> Function(Uri)>((ref) => (uri) => launchUrl(uri, mode: LaunchMode.externalApplication));

/// /nobi — the chat (K-09): product cards from the live catalogue, actions, quick replies, handoff and a lead form with consent.
class NobiScreen extends ConsumerStatefulWidget {
  const NobiScreen({super.key});
  @override
  ConsumerState<NobiScreen> createState() => _NobiScreenState();
}

class _NobiScreenState extends ConsumerState<NobiScreen> {
  final input = TextEditingController();
  final scroll = ScrollController();
  final messages = <AssistantMessage>[];
  String? conversationId;
  bool busy = false;
  String? error;
  String? notice;
  int? remaining;

  @override
  void initState() {
    super.initState();
    _restore();
  }

  @override
  void dispose() {
    input.dispose();
    scroll.dispose();
    super.dispose();
  }

  Future<String?> _token() async => ref.read(authProvider) is SignedIn ? ref.read(authProvider.notifier).accessToken() : null;

  Future<void> _restore() async {
    final repository = ref.read(nobiRepositoryProvider);
    final stored = await repository.storedConversation();
    if (stored == null) return;
    try {
      final view = await repository.conversation(stored, await _token());
      if (!mounted) return;
      setState(() {
        conversationId = view.id;
        messages.addAll(view.messages);
      });
      _toBottom();
    } on NobiException {
      await repository.rememberConversation(null);
    }
  }

  void _toBottom() => WidgetsBinding.instance.addPostFrameCallback((_) {
        if (scroll.hasClients) scroll.animateTo(scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      });

  Future<void> _send(String text) async {
    final value = text.trim();
    if (value.isEmpty || busy) return;
    final repository = ref.read(nobiRepositoryProvider);
    setState(() {
      busy = true;
      error = null;
      notice = null;
      input.clear();
      messages.add(AssistantMessage((b) => b
        ..id = 'user-${messages.length}'
        ..role = 'user'
        ..text = value
        ..at = DateTime.now().toUtc()));
    });
    _toBottom();
    try {
      final reply = await repository.send(value, conversationId, await _token());
      await repository.rememberConversation(reply.conversationId);
      if (!mounted) return;
      setState(() {
        conversationId = reply.conversationId;
        remaining = reply.remaining;
        messages.add(reply.reply);
      });
      _toBottom();
    } on NobiException catch (e) {
      if (!mounted) return;
      setState(() {
        messages.removeLast();
        input.text = value;
        error = e.message;
      });
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> _act(AssistantAction action) async {
    switch (action.kind) {
      case 'compare':
        final notifier = ref.read(compareProvider.notifier);
        await notifier.clear();
        for (final id in (action.productIds?.toList() ?? const <String>[]).take(maxCompare)) {
          await notifier.toggle(id);
        }
        if (mounted) context.push('/karsilastir');
      case 'quote':
        context.push('/kurumsal/teklif');
      case 'xinobi_u':
        context.go('/xinobi-u');
      case 'orders':
        context.push('/hesap/siparisler');
      case 'lead':
        await _lead();
      case 'handoff':
        final id = conversationId;
        if (id == null) return;
        try {
          final result = await ref.read(nobiRepositoryProvider).handoff(id, await _token());
          if (!mounted) return;
          setState(() => notice = result.message);
          if (result.url != null) {
            await ref.read(openUrlProvider)(Uri.parse(result.url!));
          } else {
            await _lead();
          }
        } on NobiException catch (e) {
          if (mounted) setState(() => error = e.message);
        }
      default:
        if (action.url != null) context.push(action.url!);
    }
  }

  Future<void> _lead() async {
    final id = conversationId;
    if (id == null) return;
    final sent = await showModalBottomSheet<bool>(context: context, isScrollControlled: true, builder: (_) => _LeadSheet(conversationId: id, token: _token));
    if (sent == true && mounted) setState(() => notice = 'Talebin alındı; ekibimiz seninle iletişime geçecek.');
  }

  Future<void> _reset() async {
    await ref.read(nobiRepositoryProvider).rememberConversation(null);
    setState(() {
      conversationId = null;
      messages.clear();
      remaining = null;
      notice = null;
      error = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final config = ref.watch(nobiConfigProvider).value;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: XinobiTokens.header,
        foregroundColor: XinobiTokens.onHeader,
        toolbarHeight: XinobiTokens.headerHeight,
        title: const Row(children: [NobiMark(width: 32), SizedBox(width: 10), Text('Nobi')]),
        actions: [if (messages.isNotEmpty) TextButton(onPressed: _reset, style: TextButton.styleFrom(foregroundColor: XinobiTokens.onHeader), child: const Text('Yeni konuşma'))],
      ),
      body: Column(children: [
        Expanded(
          child: ListView(controller: scroll, padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
            _Bubble(assistant: true, child: Text(config?.greeting ?? 'Merhaba, ben Nobi. Size nasıl yardımcı olabilirim?')),
            for (final message in messages)
              message.role == 'user'
                  ? _Bubble(assistant: false, child: Text(message.text, style: text.bodyMedium?.copyWith(color: XinobiTokens.onHeader)))
                  : _Bubble(
                      assistant: true,
                      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(message.text),
                        for (final product in message.products)
                          Card(
                            margin: const EdgeInsets.only(top: 8),
                            child: ListTile(
                              leading: SizedBox(width: 48, height: 48, child: RemoteImage(product.imageUrl)),
                              title: Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis),
                              subtitle: Text('${formatMoney(product.priceFrom)} · ${product.inStock ? 'Stokta' : 'Stokta yok'}${product.personalizable ? ' · XINOBI U' : ''}'),
                              onTap: () => context.push('/urunler/${Uri.encodeComponent(product.id)}'),
                            ),
                          ),
                        if (message.actions.isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Wrap(spacing: 6, runSpacing: 6, children: [for (final action in message.actions) OutlinedButton(onPressed: () => _act(action), child: Text(action.label))]),
                          ),
                        const SizedBox(height: 4),
                        Text(message.source_ == 'ai' ? 'Yapay zekâ yanıtı · ürün bilgileri katalogdan' : 'Katalog araması', style: text.labelSmall),
                      ]),
                    ),
            if (busy) Padding(padding: const EdgeInsets.all(8), child: Text('Nobi yazıyor…', style: text.bodySmall)),
            if (notice != null) Padding(padding: const EdgeInsets.all(8), child: Semantics(liveRegion: true, child: Text(notice!, style: text.bodyMedium?.copyWith(color: XinobiTokens.success)))),
          ]),
        ),
        if (messages.isEmpty && config != null)
          SizedBox(
            height: 48,
            child: ListView(scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: XinobiTokens.gutterMobile), children: [
              for (final reply in config.quickReplies) Padding(padding: const EdgeInsets.only(right: 6), child: ActionChip(label: Text(reply), onPressed: () => _send(reply))),
            ]),
          ),
        if (error != null) Padding(padding: const EdgeInsets.symmetric(horizontal: XinobiTokens.gutterMobile), child: FormErrorText(error)),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 8, 8, 8),
            child: Row(children: [
              Expanded(
                child: TextField(
                  controller: input,
                  maxLength: 500,
                  minLines: 1,
                  maxLines: 4,
                  textInputAction: TextInputAction.send,
                  onSubmitted: _send,
                  decoration: accountField('Ne aradığını yaz…').copyWith(counterText: ''),
                ),
              ),
              IconButton(tooltip: 'Mesajı gönder', onPressed: busy ? null : () => _send(input.text), icon: const Icon(Icons.send)),
            ]),
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 0, XinobiTokens.gutterMobile, 8),
          child: Text('${config?.disclaimer ?? ''}${remaining != null && remaining! <= 5 ? ' · Bu konuşmada $remaining mesaj hakkın kaldı.' : ''}', style: text.labelSmall),
        ),
      ]),
    );
  }
}

class _Bubble extends StatelessWidget {
  const _Bubble({required this.assistant, required this.child});
  final bool assistant;
  final Widget child;
  @override
  Widget build(BuildContext context) => Align(
        alignment: assistant ? Alignment.centerLeft : Alignment.centerRight,
        child: Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(12),
          constraints: const BoxConstraints(maxWidth: 340),
          decoration: BoxDecoration(color: assistant ? const Color(0xFFF3F3F3) : XinobiTokens.teal, borderRadius: BorderRadius.circular(12)),
          child: child,
        ),
      );
}

class _LeadSheet extends ConsumerStatefulWidget {
  const _LeadSheet({required this.conversationId, required this.token});
  final String conversationId;
  final Future<String?> Function() token;
  @override
  ConsumerState<_LeadSheet> createState() => _LeadSheetState();
}

class _LeadSheetState extends ConsumerState<_LeadSheet> {
  final name = TextEditingController(), email = TextEditingController(), phone = TextEditingController(), topic = TextEditingController();
  bool consent = false, busy = false;
  String? error;

  @override
  void initState() {
    super.initState();
    if (ref.read(authProvider) case SignedIn(:final profile)) {
      name.text = profile.name;
      email.text = profile.email;
    }
  }

  @override
  void dispose() {
    for (final controller in [name, email, phone, topic]) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Padding(
        padding: EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, 20, XinobiTokens.gutterMobile, 20 + MediaQuery.viewInsetsOf(context).bottom),
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text('Ekibimiz sana dönsün', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          TextField(controller: name, decoration: accountField('Adın')),
          const SizedBox(height: 8),
          TextField(controller: email, keyboardType: TextInputType.emailAddress, decoration: accountField('E-posta')),
          const SizedBox(height: 8),
          TextField(controller: phone, keyboardType: TextInputType.phone, decoration: accountField('Telefon (isteğe bağlı)')),
          const SizedBox(height: 8),
          TextField(controller: topic, maxLines: 2, maxLength: 500, decoration: accountField('Konu')),
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            value: consent,
            onChanged: (value) => setState(() => consent = value ?? false),
            title: const Text('Bu bilgilerle benimle iletişime geçilmesine onay veriyorum.'),
          ),
          FormErrorText(error),
          FilledButton(
            onPressed: !consent || busy
                ? null
                : () async {
                    setState(() {
                      busy = true;
                      error = null;
                    });
                    try {
                      await ref.read(nobiRepositoryProvider).lead(widget.conversationId,
                          name: name.text.trim(), email: email.text.trim(), phone: phone.text.trim().isEmpty ? null : phone.text.trim(), topic: topic.text.trim(), token: await widget.token());
                      if (context.mounted) Navigator.pop(context, true);
                    } on NobiException catch (e) {
                      setState(() => error = e.message);
                    } finally {
                      if (mounted) setState(() => busy = false);
                    }
                  },
            child: Text(busy ? 'Gönderiliyor…' : 'Gönder'),
          ),
        ]),
      );
}

/// "Nobi'ye sor" above the tab bar on every tab (K-08); it must not cover the shopping buttons, so it sits at the bottom right.
class NobiButton extends StatelessWidget {
  const NobiButton({super.key});
  @override
  Widget build(BuildContext context) => SizedBox(width: 64, height: 64, child: FloatingActionButton(
        heroTag: 'nobi',
        tooltip: 'Nobi’ye sor',
        backgroundColor: Colors.transparent,
        elevation: 0,
        focusElevation: 0,
        hoverElevation: 0,
        highlightElevation: 0,
        foregroundColor: XinobiTokens.onHeader,
        onPressed: () => context.push('/nobi'),
        child: const NobiMark(),
      ));
}
