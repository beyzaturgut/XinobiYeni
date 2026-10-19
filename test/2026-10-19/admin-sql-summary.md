# Admin SQL recorded-row summary — 19.10.2026

Base `cf1253e` (PR #4 merged after CI success). Isolated branch
`feat/admin-sql-summary-20261019`, worktree `C:/Users/fatih/XinobiAdminSummary-20261019`.

## Meaning and scope

- GET `/api/v1/admin/reports/summary`, existing staff/MFA policy plus `reports.read`, `Cache-Control: no-store`.
- SQL provider/account store required; no file/seed fallback. Missing/unreadable SQL returns sanitized 503 `report_sql_unavailable`, not zero metrics.
- `from` inclusive / `until` exclusive UTC days, exact yyyy-MM-dd; omitted from means all history, omitted until means request timestamp. Invalid/reversed range is 400.
- `orderCount`: recorded `sales.Orders` created in range, all statuses included, not paid or fulfilled orders. `orderStatuses` is their current status distribution, not historical state at range end; count is the sum of that single grouped query.
- `registeredCustomerCount`: `identity.Users` created in range with Kind=customer and no UserRole, including pending/disabled customers, excluding staff/legacy role-bearing accounts. Not active buyers or total customers before the period.
- Counts expose no customer identifiers, emails, addresses, passwords, money or payment claims. No net sales, revenue, conversion, cart or visitor metrics are inferred. Separate aggregate reads do not claim a transactional historical snapshot.
- Existing Dashboard cards/navigation stay; only orders/customer cards consume verified summary. Other KPI cards remain unavailable. Date filters, loading, error/retry and real-empty states are connected; old responses cannot overwrite newer selection.
- Existing migrations, SQL records, provider opt-ins, auth/CSRF/cookies and write rules unchanged. No new page or integration.

## Tests

- API/MFA/account/authorization/contract baseline 44 PASS; new summary 3 PASS (auth/MFA/default-deny + reports.read policy, SQL query contract, real local SELECT comparison). SQL test is explicitly skipped without XINOBI_READONLY_SQL; it never creates/drops/migrates/seeds.
- Real SQL test restricted to `lpc:.\SQLEXPRESS`, `XinobiYeniDB`, Integrated Security: EF grouped/count SELECTs compared with direct count SELECTs; empty change tracker. No account/session mutations, transaction or application-lock commands in these read queries.
- Initial MFA test expectation corrected from 403 to existing 401. Invalid date binding initially exposed a 500; explicit date validation now returns tested 400. Final tests pass without suppressing assertions.
- Chrome fixture summary tests at 1440/1280/768/390: delayed old date response, settled loading, unavailable-vs-zero, retry, UTC week/year/month/leap boundaries, no overflow: PASS.
- Existing data-honesty/stock/operation-result/refresh/navigation/permission scripts: PASS. These intercept API and are not authenticated SQL browser acceptance.
- Admin/Web TypeScript/lint/build PASS; existing seven admin lint warnings remain. Isolated web uses webpack because dependency junctions are outside the Turbopack root.
- OpenAPI and TS/Dart regenerated from this API with pinned existing generators; TS typecheck, Dart serializers/analyze and 9 Dart tests PASS. No old clients copied.

## Real local environment and remaining gates

- Owner's API 5003 remains on the protected dirty-root version: GET health live/ready 200, no-session admin 401, catalog state 503. Existing services untouched. New summary HTTP success with a real signed-in SQL admin was not exercised; actual SQL projection was tested separately above.
- Main/remote history contains neither local Customers.tsx nor AdminReadEndpoints.cs. Local manifest 04-READ explicitly says separate backlog, not publication authorization; dependencies 03-SECURITY, 05-DEP07, 05-FAVORITES and mixed shared file boundaries require ownership review. No customer/Inventory/backlog code copied.
- No provider calls or paid AI; D02/D03/D05/D06/D08/D10 remain open. Persistent settings, provider monitoring and other unsupported metrics remain unavailable.
- Root 470 files, customer screen, original stash, backups and existing SQL preserved. This is a separate review PR, not production acceptance. CI/review required before merge.
