# SuciaNet Project Rules

SuciaNet is the public web copy of the SuciAccess desktop launcher shell.

## Scope

- Keep SuciaNet website code, assets, and docs inside this folder.
- V1 is a static demo with browser/widget state only.
- The first screen should look like the SuciAccess desktop launcher: icon rail, app tiles, status widgets, inspector, and dock.
- SuciLock is locked-preview-only.
- SuciAgents is disabled-preview-only.
- Roadmap, Audit, and Settings are static public previews.

## Safety

- Do not add real authentication in v1.
- Do not store, show, reveal, copy, or collect real vault data.
- Do not call MCP or SuciAgents tools from the website.
- Do not mutate Codex threads from the website.
- Do not create worktrees from the website.
- Do not deploy, push, or write DNS from app code.
- Do not hardcode private helper names, thread ids, or agent urls into the public UI.
- Do not touch Squarespace, Cloudflare, nameserver, or Google Workspace MX/TXT records from this project.

## Widget Direction

- Keep the public website usable without ChatGPT.
- Feature-detect every `window.openai` access.
- Use localStorage as the normal public fallback.
- Future Apps SDK work should use MCP Apps bridge patterns first.
