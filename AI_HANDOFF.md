# 🤖 WISHERS AI Handoff & Progress Tracker

> **AI Instruction:**
> When you are asked to take over this project in a new session, **ALWAYS read this file first**. It contains the current progress, architecture, and blockers. Resume work based on the "🎯 Current Focus".

---

# AI Session Handoff & Progress Log (WISHERS)

## 📌 Current Focus & Phase
- **Active Phase**: Phase 5 in Progress (Sub-Step 5.1 & 5.2 Complete: The Graph TVL Monitoring Service & Dev Trigger Switch)
- **Branch**: `develop`
- **Build Status**: `npm run typecheck` Passed (0 errors) | `npm run build` Passed (All 3 Workspaces)

---

## 🚧 Current Blockers / Bugs
*(Paste unresolved Error Logs here so the new AI can help debug)*
- *None yet. Ready for Hacking!*

## 🎯 Completed Milestones
1. ✅ **Git Infrastructure**: Initialized Git repository, `.gitignore`, and set up `develop` branch tracking `origin/develop`.
2. ✅ **npm Workspaces Monorepo Architecture**: Clean separation into `frontend/`, `backend/`, and `packages/wishers-mcp-server-thegraph/`.
3. ✅ **Phase 1 Setup Scaffold**: Vite React + Express API with `/api/health` and Palette C UI tokens (`#E0E7FF`, `#38BDF8`).
4. ✅ **Phase 2 World ID Gate (Verified 🎉)**: Verified live on physical phone via World App!
5. ✅ **Phase 3 Cyberpunk Wishing Well UX & 3-Layer AI Engine**: `backend/routes/ai.ts`, `<WishChat.tsx />`, `<WishingWell.tsx />` with 3D coin tossing & water ripple animations.
6. ✅ **Phase 4 Uniswap Trading API v1, RWA Stocks & Live Flywheel Hub**: `backend/routes/uniswap.ts`, `<WishCard.tsx />`, `<FlywheelHub.tsx />`, and `FEEDBACK.md`.
7. ✅ **Sub-Step 5.1 & 5.2 The Graph TVL Monitor & Dev Trigger Switch**:
   - `backend/services/monitor.ts`: Real-time TVL monitoring loop querying The Graph Uniswap V3 Subgraph, calculating 5-minute TVL delta (`tvlDelta5mPercent`), and outputting `CRITICAL_RUG_PULL_DETECTED` risk intelligence.
   - `backend/routes/debug.ts`: Dev/Demo TVL Crash Trigger Switch (`/api/debug/simulate-tvl-drop`) for 100% reliable video demo recording.

---

## 🚀 Next Steps (Phase 5 Continued: Standalone Monorepo MCP Server)
1. **Sub-Step 5.3**: Build **`packages/wishers-mcp-server-thegraph`** (Standalone Open-Source MCP Server exposing `query_pool_risk_intelligence` tool for Claude & Cursor).

## 📂 Architecture Reference
- **Frontend**: React + Vite (Vanilla CSS / Tailwind)
- **Backend**: Node.js + Express
- **Key SDKs & APIs**:
  - `IDKit v4` & `AgentKit` (World ID authentication & human delegation)
  - `Uniswap API v1` (Fetching quotes, routing, 0.1% fee implementation)
  - `The Graph` (Querying Subgraph liquidity & TVL data)
  - `OpenAI API` (Parsing user's natural language wishes)

## 📝 Next Steps for AI
1. Read `.agents/skills/wishers-world-id` and implement the frontend World ID gate.

---
*💡 Reminder: Spend 30 seconds to update this file and `git commit` before switching AI sessions.*
