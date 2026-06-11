# SuciaNet

SuciaNet is the public `sucia.red` website for Sucia. V1 is a static, app-first web copy of the SuciAccess desktop launcher shell.

It opens directly into a desktop-style command center with an icon rail, Sucia app tiles, status widgets, selected-app inspector, and dock. It is not a marketing landing page and it is not a live controller.

## V1 Scope

- Static public demo only.
- No real login or account session.
- No private vault data.
- No live SuciAgents calls.
- No Codex thread mutation.
- No worktree creation.
- No app-side deploy, DNS, Squarespace, Cloudflare, or Google Workspace changes.

SuciLock is shown as a locked preview. SuciAgents is shown as a disabled preview. Roadmap, Audit, and Settings are static explanatory surfaces.

## Run Locally

```bash
npm.cmd install
npm.cmd run dev
```

The dev server uses `http://127.0.0.1:1430`.

## Build

```bash
npm.cmd run typecheck
npm.cmd run build
```

The production build is emitted to `dist`.

## GitHub Pages

The repo is configured for GitHub Pages with GitHub Actions.

- Workflow: `.github/workflows/pages.yml`
- Custom domain file: `public/CNAME`
- Intended custom domain: `sucia.red`

After pushing to GitHub, use repository settings to confirm Pages is using GitHub Actions. DNS remains manual and outside this app.

## DNS Boundary

Do not change DNS from this project.

Later, in Squarespace DNS for `sucia.red`, add the GitHub Pages records from GitHub's current docs. Leave Google Workspace MX/TXT records untouched. Enable HTTPS only after GitHub verifies the custom domain.

## OpenAI Apps SDK Direction

SuciaNet keeps a small widget-state compatibility layer in `src/openaiWidget.ts`.

- `window.openai.widgetState` is read when available.
- `window.openai.setWidgetState(...)` is used when available.
- `localStorage` is the fallback for the normal public website.
- Future MCP Apps work should use the MCP Apps bridge first, with `structuredContent`, widget `_meta`, and `tools/call` for future actions.

The public site must continue to work without ChatGPT or OpenAI widget APIs.
