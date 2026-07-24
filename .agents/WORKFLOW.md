# 🛠️ WISHERS Development & CI/CD Workflow Guidelines

> **Purpose:** 
> This document defines the engineering standards, testing verification protocol, and AI Spec-Driven Development compliance rules for WISHERS (ETHGlobal Lisbon 2026).

---

## 1. Spec-Driven AI Pair Programming Framework

To comply with **ETHGlobal's AI Guidelines** (Spec-Driven Development policy):
- **Human Role (Architect & Reviewer):** Sets intent, reviews code diffs, executes test commands, and controls git commits.
- **AI Role (Executor & Implementer):** Reads technical specifications from `.agents/skills/` and generates type-safe, resilient code.
- **Audit Trail:** All specifications, skill documents (`.agents/skills/`), and progress handoffs (`AI_HANDOFF.md`) MUST be committed to the repository to prove human direction to hackathon judges.

---

## 2. Incremental Development & Verification Protocol (4-Step Pipeline)

Every single feature MUST pass this 4-step pipeline before moving to the next task:

```
[1. Read Skill Spec] ➔ [2. Implement Code] ➔ [3. Verify & Build] ➔ [4. Update Handoff & Commit]
```

### Step 1: Spec Inspection
Before writing code, inspect the corresponding `.agents/skills/` specification (e.g., `wishers-world-id/SKILL.md`).

### Step 2: Implementation
Implement code following strict TypeScript types, avoiding `any`, and adhering to the UI/UX design tokens in `wishers-uiux-design/SKILL.md`.

### Step 3: Verification (CI/CD Quality Gate)
Never commit unverified code. Run the following verification check:
```bash
# 1. Type check
npx tsc --noEmit

# 2. Build check (Ensure production bundle compiles)
npm run build
```

### Step 4: State Preservation & Micro-Commit
1. Update `AI_HANDOFF.md` with:
   - Newly completed feature `[x]`
   - Current blockers (if any)
   - Next target for the next session
2. Perform a Git micro-commit:
   ```bash
   git add .
   git commit -m "feat(<scope>): <short descriptive summary>"
   ```

---

## 3. Git Commit Convention

We use **Conventional Commits** to present a clean, professional development history to judges:

- `feat(scope)`: A new user-facing feature or API endpoint (e.g., `feat(auth): implement World ID verification gate`)
- `fix(scope)`: A bug fix (e.g., `fix(uniswap): resolve decimal precision on quote calculation`)
- `docs(scope)`: Documentation, handoff, or skill updates (e.g., `docs(handoff): update milestone status`)
- `style(ui)`: UI/UX styling adjustments matching design system

---

## 4. AI Attribution & Transparency Compliance

As required by ETHGlobal:
- A dedicated `AI_ATTRIBUTION.md` (or README section) will disclose:
  1. **Prompt Specifications Used:** Located in `.agents/skills/`.
  2. **AI Tooling Involved:** Claude Opus 4.6 / Gemini 3.6 / OpenAI / Groq.
  3. **Human Contribution:** Architecture design, strategy, key API selection, human-in-the-loop verification, and prompt orchestration.
