# Admin readiness — isolated integration, 19.10.2026

Base: `bd9a380`; worktree: `C:/Users/fatih/XinobiAdminReadiness-20261019`;
branch: `integration/admin-readiness-20261019`. This is not production acceptance.

## Ownership and exclusions

- Navigation from PR #1 and CI fixes from PR #2 are already in main; no old whole-file copy was applied.
- Selectively restored staff-only admin request handling from this conversation, adapted to main's current MFA/session APIs. Shared storefront client is unchanged.
- Fresh narrow fixes address independently reproduced defects on main (message draft loss, stale data after errors, misleading notification delivery claims).
- Do not import the dirty root's 04-READ/Customers, Dashboard/backend reporting, Inventory backend, production GET expansion, transaction/idempotency/outbox extensions, system-settings implementation, surface tooling, phase documents or shared API files without their ownership/dependencies being independently established.
- Dirty root stays at `f4adc49`; its 470 files, 16th customer screen, stash and existing backups remain separate. Formatting-only differences are not candidates. No stash apply, migration, seed or SQL write was performed.

## Changes and evidence

| Area | Change / boundary |
|---|---|
| Admin requests | One shared staff refresh flight, late-401 rotation reuse, one retry; never `/auth/web/refresh`. Multipart/204/error status supported. Failed refresh returns UI to login; auth/MFA failure itself never triggers refresh. |
| Quotes | Preserve failed message draft; clear only on confirmed success; distinguish notification queue from delivery; ref-based duplicate-click guard; read permission does not grant writes. |
| Reviews/orders | Disable unauthorized write/cancel controls using existing API permission mapping; prevent stale/error-state writes. Server rules unchanged. |
| Orders/notifications | Ignore older overlapping poll results; clear data after latest read fails. No polling interval/provider changes. |
| Catalog | No initial fixture product/price fallback when state API fails; preserve actual API failure, including catalog_unavailable. |
| Audit/AI | Clear old rows/editors after read failure. A configured text model is not proof of successful provider calls or image generation availability. |

## Tests

- `node apps/admin/tests/admin-request.mjs`: PASS (mock fetch only): concurrent/late 401, staff-only refresh, bounded retry, auth exclusion, expiry event, 403/404/409/503, multipart and 204.
- `node apps/admin/tests/admin-operation-results.mjs`: PASS (Chrome, intercepted API fixtures): draft preservation, server-confirmed success, stale list blocking, retry, read-only order/cancellation/moderation controls, expired-session login.
- Existing navigation-ui and admin-write-permissions scripts: PASS at 1440/1280/768/390, 15 main screens, unique menu ownership, permissions, URL/history, keyboard/Escape and overflow. These are not real SQL/session tests.
- Admin TypeScript/build/lint: PASS; seven pre-existing lint warnings remain, none suppressed.
- Web ESLint/typecheck/webpack production build: PASS; webpack selected because dependency junctions lie outside isolated Turbopack root. CI uses normal dependency installation.
- API Release build and filtered Account/AdminMfa/Authorization/Quote/Review/Audit/Notification/ProductionCatalog/TransactionalAudit tests: 53 PASS, 2 SQL Audit SKIP. No SQL test connection configured.
- Generated OpenAPI content matches HEAD (only a local line-ending refresh after build); no generated client or API contract change is included.

## Real local read-only checks

- Existing owner processes: web 3000, admin 5173, API 5003 remained running, not switched to this integration branch.
- Web/admin GET: 200. API liveness/readiness: 200. Catalog products: 503 (no seed/import attempted).
- Nine unauthenticated protected GETs (session, audit, dashboard, customers, orders, quotes, reviews, notifications, assistant policies): 401. Running API is the dirty owner's version, not proof these endpoints all exist in main.
- Direct `sqlcmd -S lpc:.\SQLEXPRESS -d XinobiYeniDB -E`: SELECT-only DB-name/migration/table metadata check passed; 9 migrations, identity invitation/MFA/reset/user and ops audit/catalog tables exist. No account/customer/audit record values were read or changed.

## Remaining acceptance gates

- Main has 15 navigable screens; the local customer screen is excluded, not removed. Dashboard is still an explicitly labelled demo; no approved reporting API in this main was invented.
- Role matrix/system settings, inventory warehouse/movement/reconciliation, integration mappings/jobs and print sections still contain labelled simulations or incomplete backend contracts. They are not production-ready operations.
- Quote/review/order/outbox persistence is not made atomically idempotent by these UI changes. Production writes remain closed where main closes them; unresolved D02/D03/D07 and missing ownership prevent transferring local backend variants blindly.
- Mikro/Trendyol/Hepsiburada/N11: provider API/version/sandbox/credentials and field ownership D02/D06; payment/shipping D03/D05; AI cost/model/privacy D05/D08/D10. No external write or paid AI call was made.
- Product-surface QA is a development fixture/opt-in contract, not real catalog readiness. Existing opt-ins were not activated.
- Authenticated SQL admin/MFA/refresh/logout and provider delivery need a controlled real-session acceptance. SQL transaction/rollback tests need a separate disposable test DB; current XinobiYeniDB must not be used.

Next priority: establish ownership of 04-READ/reporting and local backend transaction/idempotency changes, then review their dependency-specific PRs; conduct authenticated acceptance only in an approved isolated environment.
