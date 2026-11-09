# Repository workflow

- When the owner says "deploy alalım", follow the existing GitHub Releases flow in `docs/runbooks/one-command-deploy.md`.
- Review the recent GitHub releases, ensure source changes are committed and pushed, then run `node tools/package-release.mjs`. The release contains web, admin and API together; `package-deploy.mjs` is an internal step, not the final deliverable.
- Publish the prepared version with `node tools/publish-release.mjs xinobi-<7-character-commit>` using an existing authorized credential without exposing it. Verify the published release and its three assets: `xinobi.zip`, `xinobi.zip.sha256`, `deploy-release.ps1`.
- This repository is private. The owner's Windows PowerShell cannot reliably paste into masked prompts: provide a `Read-Host` pause, then read a newly copied token with `Get-Clipboard -Raw`, validate it, set the server session's `GITHUB_TOKEN`, and remove the environment variable in `finally`. Never display the token or transfer the Mac's write credential to the server; the server token needs repository Contents: read.
- Return the GitHub release link and the server's version-specific PowerShell command. Creating/publishing a release is not a completed IIS deployment; record the actual status honestly. Do not change hosting or add a new workflow.
- Build an APK only when explicitly requested. Record release preparation/publication under `deployments/` without secrets.

The project owner wants completed changes committed and pushed regularly.

- After each completed and validated logical change, create a focused commit and push it to the configured upstream. The owner has authorized this workflow; do not ask for permission again unless scope changes or an actual tool restriction requires it.
- Review the diff and run checks appropriate to the change before committing. Keep unrelated work intact; include backlog changes only when the owner asks to publish the backlog.
- Fetch and check remote history before pushing. Do not force-push, rewrite shared history, or discard another contributor's work.
- Never commit API tokens, real environment files, appsettings.Local.json, local commerce records/uploads, dependencies, or generated build output.
- A GitHub push is not authorization to introduce a new deployment workflow or change hosting settings.

## Git mirrors (owner instruction, 09.11.2026)

- Continue both repositories with the same commits: `mostidea/xinobi_new` (`origin`) and `beyzaturgut/XinobiYeni` (`previous-origin`).
- Before pushing, fetch and inspect both histories. Fast-forward only; if either diverges, preserve its changes and resolve before synchronizing.
- Push validated work to both main branches and verify that both remote tips equal the local commit. Report any partial failure; a push to one repository is not synchronization.
- This does not authorize deployment or duplicate releases in the historical repository.
