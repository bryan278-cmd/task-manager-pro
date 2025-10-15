# Cline Rules
# Cline Project Rules — Task Manager Pro (Next.js 15 + React 19)

## Scope
- This repo is a local-only training app (no backend).
- Tech: Next.js 15, React 19, JavaScript, inline styles, localStorage.
- Files you may edit: `pages/**`, `styles/**`, `public/**`, and `docs_for_cline/**`.
- Do NOT create databases or external services.

## Git & Branching
- Always work on feature branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`, `chore/<short-name>`.
- One logical change per PR.
- Commit messages: conventional (`feat:`, `fix:`, `docs:`, `chore:`) with a clear summary in English.

## Safety & Approvals
- Before adding dependencies, ask explicitly.
- Before deleting/renaming files or folders, propose the diff first.
- If a change affects >50 lines, show a mini-plan and get confirmation.

## Coding Rules
- Keep components small and readable.
- No external CSS frameworks for now; prefer inline styles or small local CSS.
- Accessibility: keyboard focusable controls, ARIA labels when needed.
- Performance: avoid unnecessary re-renders; prefer `useMemo`/`useCallback` when beneficial.
- Hydration safety: any randomness must run in `useEffect` (client only).

## UI/UX Guidelines
- Colors: Primary `#0070f3`, Hover `#4B5EAA`, Success `#10b981`.
- Transitions: `0.3s ease` only.
- Keep a clean, minimal look; consistent spacing and typography.

## Task Features (Current Milestones)
- Priority scoring + badges (done).
- Randomized task subset on mount (hydration-safe).
- Next milestones: Dark mode with persistence, infinite scroll, 50+ tasks, pagination/fetch-more UX.

## What to do when unsure
- Stop, summarize options (pros/cons), and ask for a decision in one short message.
