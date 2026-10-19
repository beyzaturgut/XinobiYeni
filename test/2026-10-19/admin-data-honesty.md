# Admin verified-data boundaries — 19.10.2026

Base main: `3bdfd2b` (PR #3 merged after successful checks). Worktree:
`C:/Users/fatih/XinobiAdminData-20261019`, branch `fix/admin-honest-data-20261019`.

## Changes

- Dashboard keeps its existing cards/layout preferences and order-list navigation, but removes synthetic totals, chart, demo/empty/error simulation modes. Missing reporting source is not displayed as zero records. Period buttons stay disabled until a verified reporting contract is available; no endpoint or business formula is invented.
- Inventory reads the existing catalog props/API state only. Product/SKU/colour search now filters displayed variants. Removed fabricated warehouses and inactive simulation outputs. Existing catalog stock save callback and server permission (`catalog.write`) remain; no production opt-in or backend rule was changed. Save has a local duplicate-click guard; this is not server idempotency.
- Settings retains the real invitation and AuditHistory APIs. Role/system-setting previews cannot produce a fake save/audit result; persistent save controls are disabled because main has no matching write contract.
- Integrations retains existing providers/tabs but removes synthetic mappings/jobs and local-only mapping mutations. Unverified connection/last-sync state is explicit; no external request occurs.
- App heading no longer asserts live/example data based solely on the selected page. Navigation ownership, routes and permissions are unchanged.

## Local tests

- Admin TypeScript, lint, Vite build: PASS; same seven pre-existing lint warnings, no rule suppression.
- An initial Inventory narrowing error (TS2367) was corrected by removing unreachable simulation branches; final TypeScript/build passed.
- Web ESLint, webpack production build, standalone TypeScript: PASS. Dependency junctions require webpack in this isolated environment; no web source/config changed.
- API Release build and filtered AdminMfaTests/AuthorizationTests/AccountTests/ApiContractTests: 44 PASS, 0 FAIL, 0 SKIP. No SQL test connection configured.
- admin-data-honesty Chrome fixture tests: PASS at 1440/1280/768/390. No fabricated KPI/warehouse/provider rows; stock search/clear; disabled nonpersistent settings; invitation form retained; no horizontal overflow; zero writes during these read checks.
- Additional stock fixture write checks: failed request preserves input, success uses returned state, duplicate click sends one request. No real API/SQL write.
- Existing admin-request/admin-operation-results/navigation-ui/admin-write-permissions: PASS; staff-only refresh, bounded retry, status errors, draft preservation, expired-session login, read-only controls and all 15 navigation screens remain covered.

## Real local SELECT/GET checks (not authenticated acceptance)

- Existing owner's API, not this branch: health/live 200, health/ready 200, unauthenticated admin/session 401, local-commerce/state 503.
- `lpc:.\SQLEXPRESS`, `XinobiYeniDB`: SELECT-only metadata/count checks: 9 migrations, 0 catalog products. Empty catalog remains unavailable; no seed/import/migration performed.
- No real user login, provider request, stock mutation or transaction test was performed. Existing owner services were not restarted onto this branch.

## 04-READ and unresolved dependencies

- Main has neither `apps/admin/src/Customers.tsx` nor `services/api/Identity/AdminReadEndpoints.cs` (git tree checked). Local root retains both.
- Customers depends on the root App/navigation registration and `/admin/customers` list/detail projections, SQL account provider/DbContext, existing permission mapping and masked DTOs. AdminReadEndpoints also contains Dashboard/reporting projections; transferring the whole file would import other work. Local App also depends on LiveAdminSettings and Inventory variants.
- These files and their related backend/tests/contracts were inspected only; ownership is not established by a filename or an uncommitted diff. No 04-READ block was copied or committed.
- D02/D03 ownership/reservation/status policies, D05/D06 provider/version/test access, D08 AI budget/limits and D10 retention/privacy remain gates. Mikro/Trendyol/Hepsiburada/N11, payment, shipping and paid AI were not activated.
- Missing reporting, persistent role/settings and provider monitoring contracts remain backend work, not completed by disabling misleading UI actions. No production acceptance is claimed.

Evidence is for this branch; PR CI and review must complete before merge. Root 470 changes, customer screen, stash, backups and SQL are excluded from this PR.
