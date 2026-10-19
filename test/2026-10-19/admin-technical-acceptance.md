# Admin technical acceptance — 19.10.2026

PR #5 merged after both CI jobs succeeded; main `b09be54`. Clean main worktree updated;
dirty owner worktree unchanged. Acceptance/fix worktree: `C:/Users/fatih/XinobiAdminAcceptance-20261019`.

## New narrow fixes

- Pricing.tsx: clear previous success before a new save or validation; preserve failed draft; ref-based duplicate-click guard and pending controls; respect existing pricing.write. Success is only shown after onPrice resolves. Existing API payload, CSRF, server validation, provider activation and campaign rules unchanged. Actual catalog price labels no longer call server data example prices.
- AdminSettings.tsx: replace static demo role matrix with the granted permissions from existing authenticated admin/session context, read-only. Existing tab visibility, invitation and AuditHistory APIs remain; no role/settings write or fake audit result is introduced.
- Dashboard regression now asserts that a new period sends a new request; no test rule/assertion suppression. API contract unchanged by these fixes.

## Evidence, explicitly separated

| Level | Result |
|---|---|
| Entire isolated .NET suite, without SQL test connection | 429 PASS / 24 SKIP / 0 FAIL; includes API build, MFA, permission, refresh and summary contracts. SQL-mutating/sandbox/explicit-feature tests remain skipped. |
| Explicit real local read-only SQL | 1 PASS: summary EF counts/group SELECTs compared with direct SELECTs on lpc SQLEXPRESS/XinobiYeniDB. No writes, SaveChanges, migration, seed, transaction or account/session mutations in that test. |
| Admin | TypeScript, lint, production build PASS; seven existing lint warnings remain. Newly noticed unused test counter warning resolved by strengthening its request-count assertion. |
| Web | ESLint, webpack production build, TypeScript PASS. Web source unchanged; webpack is for isolated dependency junctions, not a repo configuration change. |
| Chrome intercepted fixtures | 1440/1280/768/390: price success then failure, no stale success, draft retention, duplicate/invalid input guard, read-only permissions; summary date race/UTC/empty/error/retry; stock/settings/provider states and all 15 navigation destinations PASS. Exact returned session permission list checked, no static extras. |
| Existing owner API GET only | health/live and health/ready 200, no-session admin/session 401, catalog state 503. Owner services at 3000/5173/5003 retain their original processes/root code, not switched to the new branch. |
| Real signed-in browser acceptance | SKIP: no accessible existing browser session/debug port or Computer Use runtime. No cookies/profiles/credentials were read, requested or fabricated. Real login/MFA/refresh/logout and authenticated summary HTTP success are NOT claimed as PASS. |

## Missing capabilities and exact gates

| Capability | Current implementation / source | Phase / dependencies / blocker |
|---|---|---|
| Persistent settings | AdminSettings.tsx prevents saves; role/current permission reads, real invitations and AuditHistory work through existing contracts | Faz03/04: approved setting fields, persistent versioned store/API, validation and transaction-audit required. No SystemSetting write contract/schema implemented here; migration needs separate authorization. |
| Reporting | Reports/AdminSummaryEndpoints.cs counts existing sales.Orders and non-staff identity.Users only; current status distribution, explicit UTC creation range | Faz04/05: payment/net revenue need D03/D05, tax/refund reconciliation; visits/conversion/carts have no verified event source. No inferred finance or traffic values. |
| Inventory/warehouse | Inventory.tsx uses catalog variant stock; no warehouse/reservation ledger or real movement source connected | Faz04/08, D02/D03: field ownership, warehouse mapping, reservation/movement/negative-stock semantics. Existing catalog mutation path not opened to production by this work. |
| Mikro / marketplaces | Integrations.tsx shows unverified source state, no generated mapping/job success | Faz08/09, D02/D06 (and D03/D05 downstream): exact API/version/test access, field ownership/mappings, provider adapters, inbox/outbox and reconciliation acceptance. No external write. |
| Payment / shipping | Existing order/status/tracking records and notification APIs are not provider settlement/refund/shipment execution | Faz05, D03/D05: provider sandbox/credentials, callbacks/signatures, state machine, duplicate handling, reconciliation. Not activated. |
| AI | Assistant/TextModelProvider.IsConfigured only checks configuration shape; it does not prove a successful provider request. Image generation has separate opt-ins | Faz10, D05/D08/D10: provider access, quality/safety/cost/quota/privacy acceptance. AssistantStore.RetentionDays=90 and disclaimer exist in code but D10 approval is pending; not changed or validated as approved policy. No paid AI request. |
| Product-surface QA | Existing feature-local development/opt-in fixture, not proof of real catalog or production mask provider availability | Faz04/06, approved source/profile/provider gates and relevant decisions; no feature opt-in changed or fixture published. |

## 04-READ preservation

Local manifest explicitly describes 04-READ as separate backlog, not permission to publish.
Dependencies: 03-SECURITY, 05-DEP07, 05-FAVORITES; whole Customers.tsx/Inventory.tsx/InventoryEndpoints.cs/SqlCatalogIntegrationTests.cs and partial Identity/Program/App/authorization/account SQL test changes need independent ownership and block review. Customer code is not in fetched main; nothing copied or deleted. Existing 16th local screen retained.

## Final boundary

New fixes are a separate review PR. CI/review required before merge. Owner 470 files, stash and backups are kept; no real SQL business write or provider action. Remaining real-session acceptance must be conducted only with an accessible authorized session and matching API/UI version; do not report fixture results as real SQL browser acceptance.
