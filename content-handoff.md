# Content Handoff: Molde Prototype

## 1. One-line public framing

A coding-agent session turned a rough idea for an open-source “journey/form builder” into a working React + Electron prototype, then caught the exact kind of runtime bugs that static checks miss.

## 2. What happened, in plain English

- Built the first usable version of an open-source form builder called Molde.
- The product shape is a dense two-pane workspace: spreadsheet-like field configuration on the left, live form preview on the right.
- The first use case is form building, but the architecture leaves room for later “journey builder” use cases.
- The web app runs as a portable React/Vite app, while the desktop app wraps it in Electron.
- The desktop app owns privileged local capabilities: PostgreSQL schema introspection and SQLite project persistence.
- The builder supports common form controls: text input, textarea, select/dropdown, checkbox, and radio-oriented schema primitives.
- PostgreSQL mapping is treated as a first-class workflow: fields can map to tables/columns, and control/dropdown tables are handled through explicit manual mapping.
- Verification went beyond `bun run check`: the web UI was tested in Browser, and the Electron app was inspected through Computer Use.
- Two real desktop-only failure modes appeared during testing: workspace package resolution in Electron and native SQLite ABI mismatch.
- The session ended with both web and desktop verified, not merely compiled.

## 3. Why this matters

- The broader concept is “agent-built tools still need runtime proof.” TypeScript, tests, and builds were necessary but insufficient.
- It demonstrates a practical pattern for local-first AI-era tools: browser-portable UI plus desktop-only access to local databases and native storage.
- It exposes a common gap in agentic software work: an agent can confidently scaffold the system, but the hard truth arrives only when the app is launched through the same surfaces a user will use.
- For builders and founders, the useful lesson is that the difference between a demo and a usable tool is often in integration edges: native modules, packaging, process boundaries, persistence, and runtime verification.
- For open-source positioning, this is a good example of turning a workflow idea into an inspectable foundation that others could fork, adapt, or extend.

## 4. Strong content angles

### Angle A: “Static checks are not proof”

- Hook: I asked an agent to prove both the web and desktop app worked. It found bugs the build did not.
- Core point: Passing TypeScript, tests, and builds is not the same as launching the product and exercising the actual user path.
- Why it is credible: Browser verification passed, then Electron launch exposed package export and native SQLite ABI issues that only appeared at runtime.
- Best format: LinkedIn post or short thread

### Angle B: “The local-first app pattern for AI tools”

- Hook: The architecture I keep coming back to: React UI everywhere, Electron only where local power is needed.
- Core point: Keep the builder UI portable, but move database credentials, PostgreSQL introspection, and SQLite persistence into the desktop boundary.
- Why it is credible: The prototype uses a shared web app, Electron main/preload, PostgreSQL introspection, SQLite project storage, and a reusable core schema package.
- Best format: essay or demo video

### Angle C: “Building open-source workflow tools from messy intent”

- Hook: The starting prompt was not a spec. It was a product instinct: “Excel-like builder, preview, PostgreSQL mapping, eventually journeys.”
- Core point: Good agent sessions are not just code generation; they convert ambiguous product intent into architecture, constraints, tests, and proof.
- Why it is credible: The final artifact has a monorepo, shared schema, web app, desktop app, persistence, validation, tests, and runtime verification.
- Best format: build-in-public LinkedIn post

### Angle D: “Desktop apps are where agent demos go to get humbled”

- Hook: The web app worked. The desktop app compiled. Then native SQLite broke at launch.
- Core point: Desktop packaging has a different failure surface than web apps, especially with native modules and Electron’s Node ABI.
- Why it is credible: `better-sqlite3` first worked in Node tests, then failed in Electron, then worked in Electron after native rebuild, then required test isolation to avoid breaking Node tests.
- Best format: technical X thread or engineering note

## 5. Raw material for posts

- Memorable phrases or observations:
  - “Passing checks is not the same thing as the app working.”
  - “The real test is the surface the user touches.”
  - “Agent-built code needs evidence, not vibes.”
  - “Electron is where native assumptions become visible.”
- Before/after contrast:
  - Before: a product idea for a form/journey builder with PostgreSQL mappings.
  - After: a working monorepo with web UI, desktop shell, schema package, UI package, PostgreSQL introspection, SQLite persistence, tests, and runtime proof.
- Mistakes or surprises:
  - Electron failed to resolve the workspace package until `builder-core` shipped CommonJS-compatible build output.
  - `better-sqlite3` had to be rebuilt for Electron’s ABI, which then conflicted with the Node test runner until the test boundary was adjusted.
  - Browser verification passed first, but desktop verification found the highest-value bugs.
- Specific artifacts to mention:
  - Two-column builder UI.
  - Field sheet and live preview.
  - PostgreSQL mapping panel.
  - Electron + SQLite save flow.
  - Browser and Computer Use verification.
- Possible screenshot/demo moments:
  - Web screenshot showing `PostgreSQL mapping`, `Field sheet`, and `Live preview`.
  - Desktop screenshot showing `Electron + SQLite` and `Saved Customer intake`.
  - Short clip changing a field label and watching the preview update.
  - Short clip saving a project to SQLite.

## 6. Public artifact inventory

- Repo/app/demo/PR/issue links:
  - No public repo or PR URL verified in this session.
  - Local repo path exists but should not be posted as-is.
- Files or features safe to mention:
  - MIT license.
  - Bun/Turborepo monorepo.
  - React/Vite/Tailwind web app.
  - Electron desktop app.
  - PostgreSQL schema introspection.
  - SQLite-backed project persistence.
  - Shared schema/core package.
  - Shared UI package.
- Screenshots/logs/demos that would strengthen the content:
  - Browser screenshot of the web builder.
  - Computer Use screenshot of the Electron desktop app.
  - Terminal proof that `bun run check`, `bun run test`, and `bun run build` passed.
  - SQLite query showing a saved project row, with local username/path redacted.
- Anything not yet public:
  - Repository publication status is unknown.
  - Package/release/distribution status is unknown.
  - The local SQLite path and local machine details should not be posted.

## 7. Constraints and safety notes

- Private details to avoid:
  - Local filesystem paths containing usernames.
  - Any private workspace or machine-specific details.
  - Any real PostgreSQL credentials or database details; none were used in the public-safe evidence.
  - Raw conversation excerpts unless Jorge approves.
- Claims that need verification:
  - Do not claim “launched” unless the repo is actually public.
  - Do not claim “production-ready”; this is a prototype/foundation.
  - Do not claim real PostgreSQL integration against a live database; v1 introspection path exists, but no live database was verified in this session.
  - Do not claim users, adoption, stars, or benchmarks.
- Metrics that are known vs unknown:
  - Known: static verification passed with `bun run check`, `bun run test`, and `bun run build`.
  - Known: Browser verified the web UI.
  - Known: Computer Use verified the Electron UI and SQLite save behavior.
  - Unknown: public availability, installation success on other machines, packaged app distribution, live PostgreSQL compatibility across environments.
- Names/clients/products requiring approval:
  - Needs approval: any mention of Hermes/BCR/Krilliam/internal content pipeline context.
  - Safe default: talk about “a coding-agent session” and “an open-source form builder prototype.”

## 8. Suggested next content actions

- Recommended strongest angle: “Static checks are not proof.”
- Suggested platform: LinkedIn first, then X thread if Jorge wants a more technical breakdown.
- Suggested post size: medium.
- Follow-up questions for Jorge/content agent:
  - Is the repository intended to be public immediately, or should this be framed as an internal prototype?
  - Should the product be called “Molde” publicly, or is that a working name?
  - Can screenshots from Browser and Computer Use be used publicly?
  - Should the native Electron/SQLite debugging story be told in detail, or kept as a short lesson?
  - Is the strategic framing “forms first, journeys later” approved for public positioning?

## 9. Evidence / gaps

- What sources were inspected:
  - Current repo state and file inventory.
  - `README.md` and root `package.json`.
  - Browser verification of `http://127.0.0.1:5173/`.
  - Computer Use accessibility inspection of the Electron window.
  - SQLite query confirming the saved desktop project row.
  - Verification commands: `bun run format`, `bun run check`, `bun run test`, `bun run build`.
- What could not be verified:
  - A public GitHub repository URL.
  - Packaged desktop installer behavior.
  - Live PostgreSQL connection against a real database.
  - Cross-machine install flow.
- Assumptions made:
  - The app is intended to become open source because the repo has an MIT license and the product plan says open-source.
  - The current state is best described as a working prototype/foundation, not a production launch.
  - The content should avoid local machine details and internal workflow names unless Jorge explicitly approves them.
