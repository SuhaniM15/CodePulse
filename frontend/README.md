# CodePulse frontend

React, Vite and TypeScript interface for CodePulse, a decision-support tool that helps code reviewers prioritise commits by model risk score. It does not replace code review, testing or human merge decisions.

For current status, decisions, known issues and open questions for the backend owner, read [HANDOFF.md](./HANDOFF.md) first.

## Stack

React 19, Vite, TypeScript, Tailwind CSS v4, shadcn/ui (Radix), Recharts, React Router. Fonts come from `@fontsource`: Instrument Sans for the interface and JetBrains Mono for commit IDs only. The package manager is **pnpm**; keep the existing `pnpm-lock.yaml`.

Everything related to the frontend lives in this `frontend/` folder.

## Run locally

Requires Node 20 or later and pnpm.

```powershell
cd frontend
pnpm install
copy .env.example .env      # then edit .env
pnpm dev                    # http://localhost:5173
```

| Command | What it does |
|---|---|
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Type-check (`tsc -b`) and build to `dist/` |
| `pnpm lint` | Run oxlint |
| `pnpm preview` | Serve the production build locally |

Restart `pnpm dev` after changing `.env`.

## Environment variables

| Variable | Meaning |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the FastAPI backend, for example `http://localhost:8000`. There is no default. If it is unset and mock mode is off, pages show a configuration error. |
| `VITE_USE_MOCK` | `true` shows clearly labelled sample fixtures instead of calling the API. Any other value, or unset, means the real API. |

Mock mode is the only way fixtures are used. If the API fails with mock mode off, the page shows the API's own error message and a retry action. It never falls back to fixtures. While mock mode is on, every page that shows a fixture displays a non-dismissible "Sample data" notice.

To run against the real API, set `VITE_USE_MOCK=false` and set `VITE_API_BASE_URL`.

## Project layout

```text
src/
  api/          types.ts (all API types and assumptions), client.ts (fetch + errors)
  components/   Notice, DataTable, ErrorState, PageHeader, layout/, ui/ (shadcn)
  config/       navigation (the six routes)
  hooks/        useApi (the only mock/real switch), fixtureRegistry
  lib/          utils (cn)
  mocks/        sample fixtures (fake names and round numbers only)
  pages/        one file per route
  theme/        tokens.css (design tokens)
```

## Adding shadcn/ui components

```powershell
pnpm dlx shadcn@latest add <component>
```

The CLI may regenerate `src/lib/utils.ts` or add `from "cn"` imports. The correct import is `import { cn } from "@/lib/utils"`, and `utils.ts` must use `clsx` and `tailwind-merge`. Check this after every `add`.
