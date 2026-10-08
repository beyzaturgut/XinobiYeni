# Repository workflow

- When the owner says "deploy alalım", prepare one combined ZIP containing the web storefront and admin panel. Use `node tools/package-deploy.mjs`; do not deliver separate web/admin ZIPs as the requested deployment artifact.

The project owner wants completed changes committed and pushed regularly.

- After each completed and validated logical change, create a focused commit and push it to the configured upstream. The owner has authorized this workflow; do not ask for permission again unless scope changes or an actual tool restriction requires it.
- Review the diff and run checks appropriate to the change before committing. Keep unrelated work intact; include backlog changes only when the owner asks to publish the backlog.
- Fetch and check remote history before pushing. Do not force-push, rewrite shared history, or discard another contributor's work.
- Never commit API tokens, real environment files, appsettings.Local.json, local commerce records/uploads, dependencies, or generated build output.
- A GitHub push is not authorization to introduce a new deployment workflow or change hosting settings.
