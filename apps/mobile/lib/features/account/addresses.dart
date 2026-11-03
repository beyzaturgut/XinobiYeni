import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import 'account_widgets.dart';
import 'auth.dart';

/// The signed-in customer's addresses, default first (server order). Empty when signed out.
final addressesProvider = FutureProvider.autoDispose<List<CustomerAddress>>((ref) async {
  if (ref.watch(authProvider) is! SignedIn) return const [];
  return await ref.read(authProvider.notifier).withSession((repository, token) => repository.addresses(token)) ?? const [];
});

String addressSummary(CustomerAddress address) =>
    '${address.line}, ${address.district}/${address.city}${address.postalCode == null ? '' : ' ${address.postalCode}'}';

/// /hesap/adresler
class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addresses = ref.watch(addressesProvider);
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: accountBar('Adreslerim'),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/hesap/adresler/yeni'),
        icon: const Icon(Icons.add),
        label: const Text('Adres ekle'),
      ),
      body: addresses.when(
        loading: () => const LoadingView(),
        error: (error, _) => ErrorView(error: error, onRetry: () => ref.invalidate(addressesProvider)),
        data: (items) => items.isEmpty
            ? Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Text('Henüz kayıtlı adresin yok. Sipariş verirken kullanacağın bir teslimat adresi ekle.', textAlign: TextAlign.center, style: text.bodyMedium),
                ),
              )
            : ListView.separated(
                padding: const EdgeInsets.fromLTRB(XinobiTokens.gutterMobile, XinobiTokens.gutterMobile, XinobiTokens.gutterMobile, 96),
                itemCount: items.length,
                separatorBuilder: (_, _) => const SizedBox(height: 12),
                itemBuilder: (context, index) => AddressCard(address: items[index], onTap: () => context.push('/hesap/adresler/${items[index].id}')),
              ),
      ),
    );
  }
}

class AddressCard extends StatelessWidget {
  const AddressCard({super.key, required this.address, this.onTap, this.selected, this.showDefault = true});
  final CustomerAddress address;
  final VoidCallback? onTap;

  /// Off for the copy kept in an order, where "default" means nothing.
  final bool showDefault;

  /// When not null the card is a choice in a list (checkout).
  final bool? selected;

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    return Semantics(
      button: onTap != null,
      selected: selected,
      child: Material(
        color: XinobiTokens.surface,
        shape: RoundedRectangleBorder(
          side: BorderSide(color: selected == true ? XinobiTokens.ink : XinobiTokens.line, width: selected == true ? 2 : 1),
          borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(XinobiTokens.radiusSmall),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (selected != null) ...[
                Icon(selected! ? Icons.radio_button_checked : Icons.radio_button_off),
                const SizedBox(width: 10),
              ],
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  // The badge wraps under a long title or large text instead of pushing past the card.
                  Wrap(spacing: 8, runSpacing: 4, crossAxisAlignment: WrapCrossAlignment.center, children: [
                    Text(address.title, style: text.titleMedium),
                    if (showDefault && address.isDefault) ...[
                      DecoratedBox(
                        decoration: BoxDecoration(color: XinobiTokens.ink, borderRadius: BorderRadius.circular(999)),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          child: Text('Varsayılan', style: text.bodySmall?.copyWith(color: XinobiTokens.surface)),
                        ),
                      ),
                    ],
                  ]),
                  const SizedBox(height: 4),
                  Text('${address.fullName} · ${localPhone(address.phone)}', style: text.bodySmall),
                  const SizedBox(height: 2),
                  Text(addressSummary(address), style: text.bodyMedium),
                ]),
              ),
              if (onTap != null && selected == null) const Icon(Icons.chevron_right),
            ]),
          ),
        ),
      ),
    );
  }
}

/// /hesap/adresler/yeni and /hesap/adresler/:id
class AddressFormScreen extends ConsumerStatefulWidget {
  const AddressFormScreen({super.key, this.addressId});
  final String? addressId;
  @override
  ConsumerState<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends ConsumerState<AddressFormScreen> {
  final title = TextEditingController(), fullName = TextEditingController(), phone = TextEditingController();
  final city = TextEditingController(), district = TextEditingController(), line = TextEditingController(), postal = TextEditingController();
  bool isDefault = false, busy = false, loaded = false;
  String? error;

  List<TextEditingController> get _fields => [title, fullName, phone, city, district, line, postal];

  @override
  void dispose() {
    for (final field in _fields) {
      field.dispose();
    }
    super.dispose();
  }

  void _fill(CustomerAddress? address) {
    if (loaded) return;
    loaded = true;
    if (address == null) {
      final profile = switch (ref.read(authProvider)) { SignedIn(:final profile) => profile, _ => null };
      fullName.text = profile?.name ?? '';
      phone.text = localPhone(profile?.phone);
      return;
    }
    title.text = address.title;
    fullName.text = address.fullName;
    phone.text = localPhone(address.phone);
    city.text = address.city;
    district.text = address.district;
    line.text = address.line;
    postal.text = address.postalCode ?? '';
    isDefault = address.isDefault;
  }

  Future<void> run(Future<void> Function() action) async {
    if (busy) return;
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await action();
    } on AccountException catch (problem) {
      if (mounted) setState(() => error = problem.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> save() => run(() async {
        final router = GoRouter.of(context);
        final messenger = ScaffoldMessenger.of(context);
        final address = SaveCustomerAddress((b) => b
          ..title = title.text.trim()
          ..fullName = fullName.text.trim()
          ..phone = phone.text.trim()
          ..city = city.text.trim()
          ..district = district.text.trim()
          ..line = line.text.trim()
          ..postalCode = postal.text.trim().isEmpty ? null : postal.text.trim()
          ..isDefault = isDefault);
        // The form and its text stay when the server refuses; success is only shown once the server has saved it.
        if (await ref.read(authProvider.notifier).withSession((repository, token) => repository.saveAddress(token, widget.addressId, address)) == null) return;
        ref.invalidate(addressesProvider);
        messenger.showSnackBar(const SnackBar(content: Text('Adres kaydedildi.')));
        router.pop();
      });

  Future<void> delete(String title) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('“$title” silinsin mi?'),
        content: const Text('Bu adres hesabından kaldırılır. Verilmiş siparişlerdeki teslimat adresi değişmez.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Vazgeç')),
          FilledButton(style: FilledButton.styleFrom(backgroundColor: XinobiTokens.danger), onPressed: () => Navigator.pop(context, true), child: const Text('Adresi sil')),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    await run(() async {
      final router = GoRouter.of(context);
      final messenger = ScaffoldMessenger.of(context);
      await ref.read(authProvider.notifier).withSession((repository, token) => repository.deleteAddress(token, widget.addressId!));
      ref.invalidate(addressesProvider);
      messenger.showSnackBar(const SnackBar(content: Text('Adres silindi.')));
      router.pop();
    });
  }

  @override
  Widget build(BuildContext context) {
    final editing = widget.addressId != null;
    final addresses = ref.watch(addressesProvider);
    final existing = addresses.asData?.value.where((address) => address.id == widget.addressId).firstOrNull;
    if (!editing || existing != null) _fill(existing);
    return Scaffold(
      appBar: accountBar(editing ? 'Adresi düzenle' : 'Adres ekle'),
      body: editing && existing == null
          ? switch (addresses) {
              AsyncError(:final error) when !addresses.isLoading => ErrorView(error: error, onRetry: () => ref.invalidate(addressesProvider)),
              _ when addresses.isLoading => const LoadingView(),
              _ => const EmptyView('Adres bulunamadı. Adreslerim listesinden tekrar seç.'),
            }
          : ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
              TextField(controller: title, maxLength: 40, decoration: accountField('Adres başlığı', helper: 'Örn. Ev, İş')),
              const SizedBox(height: 12),
              TextField(controller: fullName, maxLength: 80, textCapitalization: TextCapitalization.words, autofillHints: const [AutofillHints.name], decoration: accountField('Teslim alacak kişi')),
              const SizedBox(height: 12),
              TextField(controller: phone, keyboardType: TextInputType.phone, autofillHints: const [AutofillHints.telephoneNumber], decoration: accountField('Telefon', helper: 'Örn. 0532 123 45 67')),
              const SizedBox(height: 12),
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Expanded(child: TextField(controller: city, maxLength: 40, textCapitalization: TextCapitalization.words, decoration: accountField('İl'))),
                const SizedBox(width: 12),
                Expanded(child: TextField(controller: district, maxLength: 60, textCapitalization: TextCapitalization.words, decoration: accountField('İlçe'))),
              ]),
              const SizedBox(height: 12),
              TextField(controller: line, maxLength: 250, minLines: 2, maxLines: 4, autofillHints: const [AutofillHints.fullStreetAddress], decoration: accountField('Açık adres')),
              const SizedBox(height: 12),
              TextField(controller: postal, keyboardType: TextInputType.number, maxLength: 5, autofillHints: const [AutofillHints.postalCode], decoration: accountField('Posta kodu (isteğe bağlı)')),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: isDefault,
                onChanged: existing?.isDefault == true ? null : (value) => setState(() => isDefault = value),
                title: const Text('Varsayılan adresim olsun'),
                subtitle: existing?.isDefault == true ? const Text('Başka bir adresi varsayılan yapınca bu kapanır.') : null,
              ),
              FormErrorText(error),
              const SizedBox(height: 12),
              FilledButton(onPressed: busy ? null : save, child: Text(busy ? 'Kaydediliyor…' : 'Kaydet')),
              if (editing) ...[
                const SizedBox(height: 8),
                TextButton(
                  style: TextButton.styleFrom(foregroundColor: XinobiTokens.danger),
                  onPressed: busy ? null : () => delete(existing?.title ?? 'Adres'),
                  child: const Text('Adresi sil'),
                ),
              ],
            ]),
    );
  }
}
