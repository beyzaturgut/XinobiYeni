# TST-097 — Admin lint

2026-10-06; LINT.

Admin cwd'de mevcut Node executable ile `node_modules/oxlint/bin/oxlint`.

İlk koşuda loading setState-in-effect uyarısı; preview candidate mask URL anahtarıyla remount edilir, loading initial state olarak kalır. Final exit 0, çıktı/uyarı yok.
