import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:xinobi_api_client/xinobi_api_client.dart';

import '../../app/design_tokens.g.dart';
import '../../widgets/common.dart';
import '../../widgets/xinobi_header.dart';
import 'auth.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    return Scaffold(
      appBar: const XinobiHeader(),
      body: switch (auth) {
        AuthLoading() => const LoadingView(),
        SignedOut() => const _AccessForms(),
        SignedIn(:final profile) => _Profile(profile: profile),
      },
    );
  }
}

String _date(DateTime value) {
  final local = value.toLocal();
  return '${local.day.toString().padLeft(2, '0')}.${local.month.toString().padLeft(2, '0')}.${local.year}';
}

String _initials(String name) {
  final parts = name.trim().split(RegExp(r'\s+')).where((part) => RegExp(r'^\p{L}', unicode: true).hasMatch(part)).toList();
  if (parts.isEmpty) return '?';
  return (parts.first.characters.first + (parts.length > 1 ? parts.last.characters.first : '')).toUpperCase();
}

class _Profile extends ConsumerWidget {
  const _Profile({required this.profile});
  final AccountProfile profile;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final text = Theme.of(context).textTheme;
    return RefreshIndicator(
      onRefresh: () => ref.read(authProvider.notifier).reloadProfile(),
      child: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
        Semantics(header: true, child: Text('Hesabım', style: text.headlineSmall)),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: XinobiTokens.surface, border: Border.all(color: XinobiTokens.line)),
          child: Row(children: [
            ExcludeSemantics(
              child: CircleAvatar(
                radius: 26,
                backgroundColor: XinobiTokens.ink,
                foregroundColor: XinobiTokens.surface,
                child: Text(_initials(profile.name), style: text.titleMedium?.copyWith(color: XinobiTokens.surface)),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(profile.name, style: text.titleLarge),
                const SizedBox(height: 2),
                Text(profile.email, style: text.bodyMedium),
                const SizedBox(height: 4),
                Text('Üyelik: ${_date(profile.createdAt)}', style: text.bodySmall),
              ]),
            ),
          ]),
        ),
        const _SectionTitle('Hesap bilgilerim'),
        _MenuGroup(children: [
          _MenuRow(icon: Icons.person_outline, title: 'Profil bilgileri', subtitle: 'Ad soyad ve e-posta', onTap: () => context.push('/hesap/profil')),
          _MenuRow(icon: Icons.lock_outline, title: 'Parola değiştir', subtitle: 'Diğer cihazlardaki oturumların kapanır', onTap: () => context.push('/hesap/parola')),
        ]),
        const _SectionTitle('Alışveriş'),
        // Not built yet: shown so the account reads complete, but honestly marked and not tappable.
        const _MenuGroup(children: [
          _MenuRow(icon: Icons.receipt_long_outlined, title: 'Siparişlerim', subtitle: 'Ödeme altyapısıyla birlikte burada görünecek', soon: true),
          _MenuRow(icon: Icons.location_on_outlined, title: 'Adreslerim', subtitle: 'Teslimat adreslerin sipariş akışıyla eklenecek', soon: true),
        ]),
        const SizedBox(height: 28),
        OutlinedButton(onPressed: () => ref.read(authProvider.notifier).logout(), child: const Text('Çıkış yap')),
      ]),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);
  final String title;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 24, bottom: 8),
        child: Semantics(header: true, child: Text(title.toUpperCase(), style: Theme.of(context).textTheme.bodySmall?.copyWith(letterSpacing: 1.2, fontWeight: FontWeight.w600))),
      );
}

class _MenuGroup extends StatelessWidget {
  const _MenuGroup({required this.children});
  final List<Widget> children;
  @override
  Widget build(BuildContext context) => Material(
        color: XinobiTokens.surface,
        shape: const Border.fromBorderSide(BorderSide(color: XinobiTokens.line)),
        clipBehavior: Clip.antiAlias,
        child: Column(children: [
          for (final (index, child) in children.indexed) ...[if (index > 0) const Divider(height: 1, color: XinobiTokens.line), child],
        ]),
      );
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({required this.icon, required this.title, required this.subtitle, this.onTap, this.soon = false});
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final bool soon;
  @override
  Widget build(BuildContext context) => ListTile(
        enabled: !soon,
        leading: Icon(icon),
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: soon
            ? DecoratedBox(
                decoration: BoxDecoration(border: Border.all(color: XinobiTokens.line), borderRadius: BorderRadius.circular(999)),
                child: Padding(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3), child: Text('Yakında', style: Theme.of(context).textTheme.bodySmall)),
              )
            : const Icon(Icons.chevron_right),
        onTap: soon ? null : onTap,
      );
}

/// /hesap/profil: the name can be changed; the e-mail is the sign-in identity and stays read-only.
class ProfileDetailsScreen extends ConsumerStatefulWidget {
  const ProfileDetailsScreen({super.key});
  @override
  ConsumerState<ProfileDetailsScreen> createState() => _ProfileDetailsScreenState();
}

class _ProfileDetailsScreenState extends ConsumerState<ProfileDetailsScreen> {
  late final TextEditingController name =
      TextEditingController(text: switch (ref.read(authProvider)) { SignedIn(:final profile) => profile.name, _ => '' });
  String? error;
  bool busy = false;

  @override
  void dispose() {
    name.dispose();
    super.dispose();
  }

  Future<void> save() async {
    if (name.text.trim().isEmpty) return setState(() => error = 'Ad soyad gir.');
    setState(() {
      busy = true;
      error = null;
    });
    final messenger = ScaffoldMessenger.of(context);
    final router = GoRouter.of(context);
    try {
      await ref.read(authProvider.notifier).updateName(name.text);
      messenger.showSnackBar(const SnackBar(content: Text('Profil bilgilerin güncellendi.')));
      router.pop();
    } on AccountException catch (problem) {
      if (mounted) setState(() => error = problem.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final text = Theme.of(context).textTheme;
    return Scaffold(
      appBar: _bar('Profil bilgileri'),
      body: switch (auth) {
        SignedIn(:final profile) => ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
            TextField(controller: name, textCapitalization: TextCapitalization.words, autofillHints: const [AutofillHints.name], maxLength: 80, decoration: _field('Ad soyad')),
            const SizedBox(height: 4),
            Text('E-posta', style: text.bodySmall),
            const SizedBox(height: 4),
            Text(profile.email, style: text.bodyLarge),
            const SizedBox(height: 4),
            Text('E-posta adresin giriş bilgin olduğu için buradan değiştirilemez.', style: text.bodySmall),
            _Error(error),
            const SizedBox(height: 20),
            FilledButton(onPressed: busy ? null : save, child: Text(busy ? 'Kaydediliyor…' : 'Kaydet')),
          ]),
        AuthLoading() => const LoadingView(),
        SignedOut() => const _SignedOutNotice(),
      },
    );
  }
}

/// /hesap/parola: changing the password signs out every other device; this one stays signed in.
class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});
  @override
  ConsumerState<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final current = TextEditingController();
  final next = TextEditingController();
  final repeat = TextEditingController();
  String? error;
  bool busy = false;

  @override
  void dispose() {
    current.dispose();
    next.dispose();
    repeat.dispose();
    super.dispose();
  }

  Future<void> save() async {
    final problem = current.text.isEmpty
        ? 'Mevcut parolanı gir.'
        : next.text.length < 8
            ? 'Yeni parola en az 8 karakter olmalı.'
            : next.text != repeat.text
                ? 'Yeni parolalar eşleşmiyor.'
                : null;
    if (problem != null) return setState(() => error = problem);
    setState(() {
      busy = true;
      error = null;
    });
    final messenger = ScaffoldMessenger.of(context);
    final router = GoRouter.of(context);
    try {
      await ref.read(authProvider.notifier).changePassword(current: current.text, next: next.text);
      messenger.showSnackBar(const SnackBar(content: Text('Parolan değiştirildi. Diğer cihazlardaki oturumların kapatıldı.')));
      router.pop();
    } on AccountException catch (problem) {
      if (mounted) setState(() => error = problem.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        appBar: _bar('Parola değiştir'),
        body: switch (ref.watch(authProvider)) {
          SignedIn() => AutofillGroup(
              child: ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
                _PasswordField(controller: current, label: 'Mevcut parola', autofill: AutofillHints.password),
                const SizedBox(height: 12),
                _PasswordField(controller: next, label: 'Yeni parola', helper: 'En az 8 karakter', autofill: AutofillHints.newPassword),
                const SizedBox(height: 12),
                _PasswordField(controller: repeat, label: 'Yeni parola (tekrar)', autofill: AutofillHints.newPassword),
                _Error(error),
                const SizedBox(height: 8),
                Text('Parolan değişince diğer cihazlardaki oturumların kapanır; bu cihazda oturumun açık kalır.', style: Theme.of(context).textTheme.bodySmall),
                const SizedBox(height: 20),
                FilledButton(onPressed: busy ? null : save, child: Text(busy ? 'Kaydediliyor…' : 'Parolayı değiştir')),
              ]),
            ),
          AuthLoading() => const LoadingView(),
          SignedOut() => const _SignedOutNotice(),
        },
      );
}

PreferredSizeWidget _bar(String title) => AppBar(
      backgroundColor: XinobiTokens.header,
      foregroundColor: XinobiTokens.onHeader,
      toolbarHeight: XinobiTokens.headerHeight,
      title: Text(title),
    );

class _SignedOutNotice extends StatelessWidget {
  const _SignedOutNotice();
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(XinobiTokens.gutterMobile),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text('Oturumun kapalı.', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 12),
          FilledButton(onPressed: () => context.go('/hesap'), child: const Text('Giriş yap')),
        ]),
      );
}

class _AccessForms extends StatefulWidget {
  const _AccessForms();
  @override
  State<_AccessForms> createState() => _AccessFormsState();
}

class _AccessFormsState extends State<_AccessForms> {
  bool register = false;

  @override
  Widget build(BuildContext context) => ListView(padding: const EdgeInsets.all(XinobiTokens.gutterMobile), children: [
        Semantics(header: true, child: Text(register ? 'Xinobi\'ye üye ol' : 'Hesabına giriş yap', style: Theme.of(context).textTheme.headlineSmall)),
        const SizedBox(height: 4),
        Text('Web ve mobilde aynı hesabı kullanırsın.', style: Theme.of(context).textTheme.bodySmall),
        const SizedBox(height: 16),
        SegmentedButton<bool>(
          segments: const [ButtonSegment(value: false, label: Text('Giriş yap')), ButtonSegment(value: true, label: Text('Üye ol'))],
          selected: {register},
          onSelectionChanged: (value) => setState(() => register = value.first),
        ),
        const SizedBox(height: 20),
        register ? const _RegisterForm() : const _LoginForm(),
      ]);
}

InputDecoration _field(String label, {Widget? suffix, String? helper}) => InputDecoration(
      labelText: label,
      helperText: helper,
      suffixIcon: suffix,
      filled: true,
      fillColor: XinobiTokens.surface,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(XinobiTokens.headerSearchRadius)),
    );

class _PasswordField extends StatefulWidget {
  const _PasswordField({required this.controller, required this.label, this.helper, this.autofill});
  final TextEditingController controller;
  final String label;
  final String? helper;
  final String? autofill;
  @override
  State<_PasswordField> createState() => _PasswordFieldState();
}

class _PasswordFieldState extends State<_PasswordField> {
  bool hidden = true;
  @override
  Widget build(BuildContext context) => TextField(
        controller: widget.controller,
        obscureText: hidden,
        autofillHints: widget.autofill == null ? null : [widget.autofill!],
        decoration: _field(widget.label,
            helper: widget.helper,
            suffix: IconButton(
              tooltip: hidden ? 'Parolayı göster' : 'Parolayı gizle',
              onPressed: () => setState(() => hidden = !hidden),
              icon: Icon(hidden ? Icons.visibility_outlined : Icons.visibility_off_outlined),
            )),
      );
}

class _Error extends StatelessWidget {
  const _Error(this.message);
  final String? message;
  @override
  Widget build(BuildContext context) => message == null
      ? const SizedBox.shrink()
      : Padding(
          padding: const EdgeInsets.only(top: 12),
          child: Semantics(liveRegion: true, child: Text(message!, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: XinobiTokens.danger))),
        );
}

class _LoginForm extends ConsumerStatefulWidget {
  const _LoginForm();
  @override
  ConsumerState<_LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends ConsumerState<_LoginForm> {
  final email = TextEditingController();
  final password = TextEditingController();
  String? error;
  bool busy = false;

  @override
  void dispose() {
    email.dispose();
    password.dispose();
    super.dispose();
  }

  Future<void> submit() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await ref.read(authProvider.notifier).login(email.text, password.text);
    } on AccountException catch (problem) {
      if (mounted) setState(() => error = problem.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => AutofillGroup(
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          TextField(controller: email, keyboardType: TextInputType.emailAddress, autofillHints: const [AutofillHints.email], decoration: _field('E-posta')),
          const SizedBox(height: 12),
          _PasswordField(controller: password, label: 'Parola', autofill: AutofillHints.password),
          _Error(error),
          const SizedBox(height: 16),
          FilledButton(onPressed: busy ? null : submit, child: Text(busy ? 'Giriş yapılıyor…' : 'Giriş yap')),
        ]),
      );
}

class _RegisterForm extends ConsumerStatefulWidget {
  const _RegisterForm();
  @override
  ConsumerState<_RegisterForm> createState() => _RegisterFormState();
}

class _RegisterFormState extends ConsumerState<_RegisterForm> {
  final name = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();
  final code = TextEditingController();
  AccountEmailVerification? challenge;
  String? error;
  bool busy = false;
  int resendIn = 0;
  Timer? countdown;

  @override
  void dispose() {
    countdown?.cancel();
    for (final controller in [name, email, password, code]) {
      controller.dispose();
    }
    super.dispose();
  }

  String? validate() {
    if (name.text.trim().isEmpty) return 'Ad soyad gir.';
    if (!email.text.contains('@')) return 'Geçerli bir e-posta adresi gir.';
    if (password.text.length < 8) return 'Parola en az 8 karakter olmalı.';
    return null;
  }

  Future<void> sendCode() async {
    final invalid = validate();
    if (invalid != null) return setState(() => error = invalid);
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final started = await ref.read(accountRepositoryProvider).startVerification(email.text.trim());
      if (!mounted) return;
      setState(() => challenge = started);
      _startCountdown();
    } on AccountException catch (problem) {
      if (mounted) setState(() => error = problem.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  void _startCountdown() {
    countdown?.cancel();
    setState(() => resendIn = 60);
    countdown = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted || resendIn <= 1) {
        timer.cancel();
        if (mounted) setState(() => resendIn = 0);
        return;
      }
      setState(() => resendIn--);
    });
  }

  Future<void> create() async {
    setState(() {
      busy = true;
      error = null;
    });
    try {
      await ref.read(authProvider.notifier).register(name: name.text, email: email.text, password: password.text, verificationId: challenge!.verificationId, code: code.text);
    } on AccountException catch (problem) {
      if (mounted) setState(() => error = problem.message);
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final text = Theme.of(context).textTheme;
    final waiting = challenge;
    if (waiting == null) {
      return AutofillGroup(
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          TextField(controller: name, textCapitalization: TextCapitalization.words, autofillHints: const [AutofillHints.name], decoration: _field('Ad soyad')),
          const SizedBox(height: 12),
          TextField(controller: email, keyboardType: TextInputType.emailAddress, autofillHints: const [AutofillHints.email], decoration: _field('E-posta')),
          const SizedBox(height: 12),
          _PasswordField(controller: password, label: 'Parola', helper: 'En az 8 karakter', autofill: AutofillHints.newPassword),
          _Error(error),
          const SizedBox(height: 16),
          FilledButton(onPressed: busy ? null : sendCode, child: Text(busy ? 'Kod gönderiliyor…' : 'Doğrulama kodu gönder')),
        ]),
      );
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Text('${waiting.email} adresine 6 haneli bir kod gönderdik. Kod 10 dakika geçerli.', style: text.bodyMedium),
      if (waiting.previewCode != null) ...[
        const SizedBox(height: 8),
        // Only the Development API returns this, when e-mail delivery is switched to preview.
        Container(
          padding: const EdgeInsets.all(10),
          color: const Color(0xFFFBF1DC),
          child: Text('Geliştirme modu: e-posta gönderilmedi, kod ${waiting.previewCode}', style: text.bodySmall),
        ),
      ],
      const SizedBox(height: 12),
      TextField(
        controller: code,
        keyboardType: TextInputType.number,
        maxLength: 6,
        autofillHints: const [AutofillHints.oneTimeCode],
        decoration: _field('Doğrulama kodu'),
      ),
      _Error(error),
      const SizedBox(height: 8),
      FilledButton(onPressed: busy ? null : create, child: Text(busy ? 'Hesap oluşturuluyor…' : 'Hesabı oluştur')),
      const SizedBox(height: 8),
      TextButton(onPressed: busy || resendIn > 0 ? null : sendCode, child: Text(resendIn > 0 ? 'Kodu tekrar gönder ($resendIn sn)' : 'Kodu tekrar gönder')),
      TextButton(onPressed: busy ? null : () => setState(() {
                challenge = null;
                error = null;
              }), child: const Text('Bilgileri düzenle')),
    ]);
  }
}
