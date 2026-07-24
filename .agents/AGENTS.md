# Workspace Agent Rules & Mandates

## Core Operational Mandate
Before executing any user request that involves writing or modifying code, you MUST follow the 4-Step Pipeline defined in `.agents/WORKFLOW.md`:

1. **Spec Check**: Always inspect the relevant skill in `.agents/skills/` first.
2. **Implementation**: Write strict TypeScript code with full type coverage. Adhere to UI/UX design tokens in `.agents/skills/wishers-uiux-design/SKILL.md`.
3. **Verification**: Proactively verify the changes by running build/typecheck commands (`npx tsc --noEmit` / `npm run build`) via `run_command` before declaring a feature complete.
4. **Handoff & Commit Proposal**: Proactively update `AI_HANDOFF.md` with current progress, and suggest the exact Conventional Commit command to the user.

## Enforcement
- Never ask the user to verify broken code.
- Never output raw un-typed JavaScript.
- Always communicate in English for committed code/docs, and Traditional Chinese for user chat responses.
