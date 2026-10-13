# EC501 Metallic Silver — reviewed development acceptance

Version fe618b58-1ced-4edd-9063-6d6c49961e65. Original mask, source-pixel branding, source and acceptance/current records are byte-for-byte copies of the active explicit Admin approval. No candidate, session, credential, customer upload or log is included. Source is the owner-supplied catalog photograph, retained in the owner-approved repository; no independent redistribution license is asserted.

Restore both products atomically into a NEW directory:

    node tools/install-personalization-checkpoint.cjs
    dotnet build services/api -c Release -p:OpenApiGenerateDocumentsOnBuild=false -o services/api/App_Data/integration-runtime/catalog-generic-api
    node tools/start-xinobi-qa.cjs --catalog-checkpoint

Install existing repository dependencies first. The installer refuses existing destinations and validates hashes, exact identities, dimensions, mask alpha, exclusion and original branding pixels. It restores approvals, not pending candidates or editable inference history. The minimal catalog contains the existing CM101 fixture/demo seed plus only EC501 Silver; it is not the full catalog and has no customer/runtime records. Existing QA data is untouched. New candidate work requires separate explicit authorization. No inference is enabled by the commands above. Optional --cloudflare requires locally configured server-side credentials and explicit user action; no application daily cap is added. Roboflow is blocked in checkpoint mode. Occupied ports are rejected without stopping existing services.

Admin: http://127.0.0.1:5176/ . Customer: http://127.0.0.1:3032/xinobi-u/kendi-gorselin/?product=DEMO-97db48f3-afb3-4026-aa26-03deb087cd9d&variant=DEMO-V-459a05ef-1a88-490b-95a6-810f95e70bd5

Run: node --test tools/test-cm101-checkpoint.cjs tools/test-personalization-checkpoint.cjs . Tests use isolated storage and fresh HTTP/registry instances; they never approve masks or overwrite working data.
