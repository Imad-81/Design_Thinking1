<!-- .github/copilot-instructions.md: guidance for AI coding agents working on this repo -->
# Copilot / Agent Guidance — student-microtasks

Purpose: provide immediate, actionable context for changes, PRs, and debugging so an AI agent can be productive without human hand-holding.

- Quick start
  - Install & run: `npm install` then `npm run dev` (Vite dev server, HMR).
  - Build for production: `npm run build` (output dir: `docs`).
  - Preview build: `npm run preview`.
  - Lint: `npm run lint` (ESLint configured in `eslint.config.js`).

- Big picture
  - This is a single-page React app scaffolded with Vite.
  - Entry point: [src/main.jsx](src/main.jsx#L1).
  - The entire UI and app state live in a single root component: [src/App.jsx](src/App.jsx#L1-L120). Many UI subcomponents are implemented as inner functions inside that file.
  - Styling: global CSS file [src/index.css](src/index.css#L1). The project uses CSS variables for theme and layout.
  - Build/deploy: `vite.config.js` sets `base: "/Design_Thinking1/"` and `build.outDir: "docs"` so production builds are placed in `docs/` (suitable for GitHub Pages). See [vite.config.js](vite.config.js#L1).

- Architecture & data flows (important for edits)
  - There is no backend: task data is seeded from `initialTasks` in `App.jsx` and stored in React `useState`. Search for `initialTasks` in [src/App.jsx](src/App.jsx#L1-L40).
  - View switching uses a simple `view` string in `App.jsx` (values: `dashboard`, `marketplace`, `post`, `history`, `profile`). Treat it as the app's router.
  - Task lifecycle handlers (create / accept / complete) are implemented inside `App.jsx` as `handleCreateTask`, `handleAcceptTask`, `handleCompleteTask`. When modifying task logic, update these handlers and any dependent filters (see task filtering near the top of `App.jsx`).
  - Filtering logic: `filteredTasks` enforces status/acceptedBy rules and price/category filters — update here when changing visibility rules.

- Project-specific conventions
  - Small codebase pattern: many UI pieces are inline inside `App.jsx`. When extracting components, keep the same naming and props style (function components, props-first, minimal abstraction).
  - Global styling lives in `src/index.css` (not CSS modules). Use the CSS variables declared at the top for colors, radii, and transitions.
  - Icons use `react-icons` (see imports at the top of `App.jsx`).
  - ESLint uses an explicit `eslint.config.js` and expects `.js`/`.jsx` files; no TypeScript rules are present.

- Integration points & side-effects to watch
  - Vite base path (`/Design_Thinking1/`) affects absolute asset URLs and build routing — change with caution.
  - Build output `docs/` should not be accidentally deleted if it's used for GitHub Pages publishing.
  - No API endpoints are present. If you add network calls, add fetch code and document expected return shapes; update README or add a tiny API adapter under `src/lib`.

- How to make common changes
  - Add a new screen: update `view` handling in `App.jsx` and add a corresponding UI function in the same file or extract to `src/components/YourComponent.jsx` and import it from `App.jsx`.
  - Add a new field to tasks: extend the `initialTasks` entries in [src/App.jsx](src/App.jsx#L1-L40) and update creation handler `handleCreateTask`.
  - Styling tweaks: edit `src/index.css` variables for color/shadow changes; layout rules live near `.app`, `.sidebar`, and `.main-content` selectors.

- Commands & checks before creating a PR
  - Run `npm run lint` and fix ESLint errors.
  - Run `npm run dev` and verify HMR updates for UI changes.
  - For production-preview verify `npm run build` then `npm run preview` and confirm `docs/` content.

- Files to inspect for most changes
  - [src/App.jsx](src/App.jsx#L1) — core app logic and UI (start here for behavior changes).
  - [src/main.jsx](src/main.jsx#L1) — mount point.
  - [src/index.css](src/index.css#L1) — global styles and theme variables.
  - [vite.config.js](vite.config.js#L1) — base path and build output.
  - [eslint.config.js](eslint.config.js#L1) — linting rules.

If anything is unclear or you'd like more examples (component extraction, adding a mock API adapter, or a suggested folder layout), tell me which area and I'll iterate this file.
