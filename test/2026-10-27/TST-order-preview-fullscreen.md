# Order preview: Flutter parity (27 October 2026)

The existing preview dialog was rendered inside an order-list item. Order-list selectors constrained all descendant images to 64×64 and descendant divs to grid, overriding the viewer's less specific styles. The old tests checked the image URL and zoom labels, but did not check layout or touch gestures.

The viewer now mounts in document.body through a portal and opens as a native modal dialog occupying the viewport. It has the mobile app's back arrow, product title, white image area and pinch hint. Mobile shows no stacked zoom buttons; desktop retains compact controls. Pointer gestures provide 1–5x pinch zoom and panning; keyboard +/−/0, double-click reset/zoom, Escape and focus restoration are supported. The product thumbnail and full-screen image still use the same authenticated order-owned composition, with the exact purchased configuration revision as fallback.

Validation:

- Production Next.js build and TypeScript passed.
- Lint of changed component/test files passed.
- Four WebKit browser cases passed: widths 390 and 1440, each with an order snapshot or saved-revision fallback.
- Tests assert full viewport geometry, an image wider than 90% of the viewport and taller than 600 px at a 900 px viewport, portal isolation, mobile/desktop control visibility, pointer-based pinch and pan, limits at 1x/5x, focus restoration, close/reopen and Escape. No raw artwork endpoint is requested.
- Mobile screenshot visually inspected: artifacts/order-product-viewer-390-false.png (generated, not committed).

No physical Android device or live IIS deployment was exercised in this change.
