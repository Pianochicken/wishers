# WISHERS — Uniswap Trading API Integration Feedback

## 1. Project Overview
**WISHERS** is a Human-Anchored AI Execution Agent built for ETHGlobal Lisbon 2026. It empowers verified humans (via World ID) to express natural language financial wishes (e.g. *"Sell ETH to USDC if TVL drops 50%"* or *"Hedge into Tokenized Nvidia Stock dNVDA if ETH dips below $3000"*).

WISHERS integrates **Uniswap Trading API v1** (`https://trade-api.gateway.uniswap.org/v1`) for quote calculation, route generation, and automated trade execution.

---

## 2. Uniswap Trading API Integration Highlights
- **Quote & Route Generation**: Utilized `/v1/quote` (EXACT_INPUT) for computing price impact and execution paths across V2 and V3 pools on Base Sepolia.
- **Native ETH Optimization**: Swaps using Native ETH (`0x0000000000000000000000000000000000000000`) skip Permit2 approval overhead, accelerating user onboarding.

---

## 3. Developer Experience & Feedback

### What Went Well:
- The REST API endpoint structure (`/quote`, `/swap`, `/check_approval`) is clean, predictable, and easy to parse in TypeScript.
- Error codes and JSON responses are well-structured for AI agent function calling.

### Recommendations & Wishlist for Uniswap Developer Team:
1. **Dynamic `integratorFee` Request Body Param**: Adding support for passing custom `portionBips` and `portionRecipient` dynamically in the `/v1/quote` request body (rather than strictly pre-configured in Developer Hub) would be tremendously helpful for multi-tiered fee dApps.
2. **Sub-second WebSocket Quotes**: A WebSocket quote stream would enable real-time price impact displays in natural language AI chat interfaces.

---
*Built with ❤️ for ETHGlobal Lisbon 2026*
