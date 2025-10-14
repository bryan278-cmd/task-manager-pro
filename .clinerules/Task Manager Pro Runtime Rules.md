RUNTIME RULES (ENFORCED)
- Scope: Next.js 15 + React 19, client-only app; no server/DB; localStorage allowed.
- Never edit/delete: node_modules/, .next/, .git/, system folders. Work only inside repo root.
- Plan First → Act After: Always show a file-by-file diff plan and test steps; act only after approval.
- Keep changes minimal; reference absolute paths (e.g., pages/index.js).
- Hydration safety: Move random/time/DOM logic into useEffect; use a mounted flag.
- Accessibility & UX: keep contrast >= 4.5:1; transitions 0.3s ease; hover scale <= 1.02 on desktop only.
- Git discipline: branch per feature; small English commits; PR with What/Why/How/Testing.

WORKFLOW SHORTCUTS
- Feature: plan diffs → apply → run `npm run dev` → create PR.
- Hydration fix: move non-deterministic code to useEffect, gate with mounted.
- Dark mode: toggle + persist in localStorage; respect system preference in useEffect.
