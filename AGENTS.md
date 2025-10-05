# AGENTS.md

These are standing instructions for autonomous/code assistants working in this repo.

1. Read `CLAUDE.md` before beginning any new task to stay aligned with the project guidance and workspace conventions.
2. When verifying UI or running browser checks, prefer the integrated Playwright MCP tools (e.g., `playwright__browser_navigate`) instead of spawning standalone `npx playwright` commands.
3. When starting local servers for verification, launch the appropriate workspace dev server(s) and confirm availability before interacting via Playwright MCP.
4. Keep documentation artifacts (like this file, `MIGRATION_PLAN.md`, and `CHECKLIST.md`) synchronized with actual repository state whenever changes are made.
