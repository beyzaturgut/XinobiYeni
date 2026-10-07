import 'package:flutter/material.dart';

import '../app/design_tokens.g.dart';
import '../app/theme.dart';

/// Single 64px black strip matching the web header (DES-HDR-01 rev.1): logo on the left, search field to its right.
class XinobiHeader extends StatelessWidget implements PreferredSizeWidget {
  const XinobiHeader({super.key, this.onSearch, this.leading});

  final VoidCallback? onSearch;
  final Widget? leading;

  @override
  Size get preferredSize => const Size.fromHeight(XinobiTokens.headerHeight);

  @override
  Widget build(BuildContext context) {
    return Material(
      color: XinobiTokens.header,
      child: SafeArea(
        bottom: false,
        child: SizedBox(
          height: XinobiTokens.headerHeight,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: XinobiTokens.gutterMobile),
            child: Row(
              children: [
                if (leading != null) ...[leading!, const SizedBox(width: 8)],
                Semantics(
                  label: 'Xinobi',
                  image: true,
                  child: Image.asset('assets/brand/xinobi-logo-white.png', height: XinobiTokens.headerLogoHeightMobile, excludeFromSemantics: true),
                ),
                const SizedBox(width: 24),
                if (onSearch != null)
                  Expanded(
                    child: Semantics(
                      button: true,
                      label: 'Ara',
                      child: InkWell(
                        onTap: onSearch,
                        borderRadius: BorderRadius.circular(XinobiTokens.headerSearchRadius),
                        child: Container(
                          height: XinobiTokens.headerSearchHeight,
                          padding: const EdgeInsets.only(left: 10),
                          decoration: BoxDecoration(
                            color: XinobiTokens.surface,
                            borderRadius: BorderRadius.circular(XinobiTokens.headerSearchRadius),
                          ),
                          child: Row(children: [
                            const Icon(Icons.search, size: 18, color: XinobiTokens.ink),
                            const SizedBox(width: 10),
                            ExcludeSemantics(child: Text('Ara', style: jost(16, color: XinobiTokens.searchPlaceholder))),
                          ]),
                        ),
                      ),
                    ),
                  )
                else
                  const Spacer(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
