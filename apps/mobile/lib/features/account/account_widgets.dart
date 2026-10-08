import 'package:flutter/material.dart';

import '../../app/design_tokens.g.dart';

/// Form pieces shared by the account, address and checkout screens.
InputDecoration accountField(String label, {Widget? suffix, String? helper}) => InputDecoration(
      labelText: label,
      helperText: helper,
      suffixIcon: suffix,
      filled: true,
      fillColor: XinobiTokens.surface,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(XinobiTokens.headerSearchRadius)),
    );

class PasswordField extends StatefulWidget {
  const PasswordField({super.key, required this.controller, required this.label, this.helper, this.autofill});
  final TextEditingController controller;
  final String label;
  final String? helper;
  final String? autofill;
  @override
  State<PasswordField> createState() => PasswordFieldState();
}

class PasswordFieldState extends State<PasswordField> {
  bool hidden = true;
  @override
  Widget build(BuildContext context) => TextField(
        controller: widget.controller,
        obscureText: hidden,
        autofillHints: widget.autofill == null ? null : [widget.autofill!],
        decoration: accountField(widget.label,
            helper: widget.helper,
            suffix: IconButton(
              tooltip: hidden ? 'Parolayı göster' : 'Parolayı gizle',
              onPressed: () => setState(() => hidden = !hidden),
              icon: Icon(hidden ? Icons.visibility_outlined : Icons.visibility_off_outlined),
            )),
      );
}

class FormErrorText extends StatelessWidget {
  const FormErrorText(this.message, {super.key});
  final String? message;
  @override
  Widget build(BuildContext context) => message == null
      ? const SizedBox.shrink()
      : Padding(
          padding: const EdgeInsets.only(top: 12),
          child: Semantics(liveRegion: true, child: Text(message!, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: XinobiTokens.danger))),
        );
}

PreferredSizeWidget accountBar(String title) => AppBar(
      backgroundColor: XinobiTokens.header,
      foregroundColor: XinobiTokens.onHeader,
      toolbarHeight: XinobiTokens.headerHeight,
      title: Text(title),
    );

/// +905321234567 → 0532 123 45 67 for display and editing; the server accepts any common spelling.
String localPhone(String? phone) {
  if (phone == null || !phone.startsWith('+90') || phone.length != 13) return phone ?? '';
  final d = phone.substring(3);
  return '0${d.substring(0, 3)} ${d.substring(3, 6)} ${d.substring(6, 8)} ${d.substring(8)}';
}
