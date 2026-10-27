# Web preview cleanup — 27 October 2026

Scope: storefront personalization and preview code. No changes to Flutter, API contracts, stored designs, order records or hosting.

## Changes

- Removed the unused EditorWorkspace module, fake text/shape layers, front/back controls, disabled demo actions, old double-artwork preview and their styles.
- Removed the retired simple-mode component and stylesheet. Its historical URL still offers the current product selection rather than starting the retired flow.
- AI previews, the sessionless mobile sample and the surface-reference preview now use PlacementStudio. The old editor URL is retained for existing references and surface tests, but no longer mounts the legacy editor.
- Moved eight shared rendering modules to apps/web/src/features/product-personalization/rendering. Their non-import source is identical to HEAD before cleanup. Updated storefront, tests and standalone tool imports.
- The reference preview remains local-only; it does not fabricate a persistable commerce identity or receive save/cart actions. Product-aware links preserve their product/variant when returning to the current selection flow.

## Validation

- Production Next.js build, TypeScript, lint of changed TypeScript files, CSS parsing and git diff whitespace checks passed.
- Final WebKit selection: **26 passed** — accepted-surface, commerce-surface-integration, xinobi-preview-ui, xinobi-preview-composition, order-product-preview and nobi-preview-scroll.
- Additional checks passed for PNG/JPEG/WebP upload, restoring the sample after removing a local image, the reference page's real placement control and pattern-mode drag prevention.
- Product-pattern pixel protection passed: zero differences outside the accepted mask and zero branding differences.
- The reference canvas SHA-256 is identical before and after cleanup under WebKit: 5ed8af1d5f34af5ba4c2de3aa8a546d48262a11495adc2f76629579de1a5786f. The historical byte regression test expects a different reference and already fails on the pre-change version; its expected hash was not changed.

## Existing test limitations

A separate /tmp checkout of the pre-cleanup HEAD was built and tested under the same WebKit environment. It reproduces three design-configuration cart assertions, the embedded userSelect assertion, the historical pixel hash assertion, and two drag coordinate rounding assertions. A CDP touch test requires Chromium and cannot run under WebKit. These failures were not hidden by weakening their expectations.

Standalone surface-ink and shared-surface-rendering scripts reproduce their existing failures when fed the pre-cleanup source. The branding-parity script requires a missing local acceptance.json fixture. The separate-body-placement tool passes.

No deployment was performed.
