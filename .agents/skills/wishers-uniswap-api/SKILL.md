---
name: wishers-uniswap-api
description: Uniswap Trading API v1 (REST) integration patterns for the WISHERS ETHGlobal Lisbon 2026 project. Use this skill when building DeFi quote fetching, transaction routing, swap execution logic, and the built-in fee collection (integratorFee). Also covers approval checks and the mandatory FEEDBACK.md file for bounty eligibility.
---

# WISHERS — Uniswap Trading API Integration Skill

## Overview

WISHERS uses the **Uniswap Trading API v1** (REST) for:
1. Fetching live token quotes and price impact for the user's wish conditions.
2. Generating the best execution route across Uniswap V2/V3/V4 liquidity pools.
3. Constructing the `calldata` for the Agent to execute the swap on behalf of the user.
4. **Monetization:** Automatically collecting a fee on successful wishes via the `integratorFee` mechanism.

**Target Prize Track:** Best API Integration ($7,000)

## API Endpoint & Authentication

- **Base URL:** `https://trade-api.gateway.uniswap.org/v1`
- **API Key Portal:** https://hub.uniswap.org/
- **OpenAPI Spec:** `https://trade-api.gateway.uniswap.org/v1/api.json`

**Required Headers for ALL requests:**
```
x-api-key: YOUR_UNISWAP_API_KEY
Content-Type: application/json
```

## Core Workflow: check_approval → quote → swap

The integration follows a strict three-step sequence:

### Step 1: Check Approval (Permit2)

Before the user can swap ERC20 tokens, the Permit2 contract must be approved to spend their tokens.

> **DEMO TIP:** For the hackathon demo, swap FROM native ETH (address `0x0000000000000000000000000000000000000000`). Native ETH does NOT require Permit2 approval. This skips the entire approval flow and saves 5+ minutes of demo setup.

```typescript
// POST /check_approval
async function checkApproval(
  walletAddress: string,
  tokenAddress: string,
  amount: string,
  chainId: number
) {
  const response = await fetch("https://trade-api.gateway.uniswap.org/v1/check_approval", {
    method: "POST",
    headers: {
      "x-api-key": process.env.UNISWAP_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      walletAddress,
      token: tokenAddress,
      amount,
      chainId,
      includeGasInfo: true,
    }),
  });

  const data = await response.json();
  // If data.approval is null → user already has sufficient allowance
  // If data.approval is an object → it contains a tx to send for approval
  // If data.cancel is an object → must cancel existing approval first
  return data;
}
```

### Step 2: Fetch Quote (with Integrator Fee)

> **CRITICAL:** The fee mechanism (`integratorFee`) is associated with your API key and configured via the Uniswap Developer Hub (hub.uniswap.org), NOT passed in the request body. The fee is automatically reflected in the `aggregatedOutputs` field of the quote response.
>
> If fee configuration via request body is supported (check hub.uniswap.org during the hackathon), you may use the `integratorFee` field in the request body with `x-universal-router-version: 2.1.1` header.

```typescript
// POST /quote
async function fetchQuote(
  swapperAddress: string,
  tokenIn: string,
  tokenOut: string,
  amount: string,  // In smallest unit (Wei for ETH, 6 decimals for USDC, etc.)
  chainId: number
) {
  const requestBody = {
    type: "EXACT_INPUT",
    tokenInChainId: chainId,
    tokenOutChainId: chainId,
    tokenIn,
    tokenOut,
    amount,
    swapper: swapperAddress,
    slippageTolerance: 0.5,       // 0.5%
    protocols: ["V2", "V3", "V4"],
    routingPreference: "BEST_PRICE",
    urgency: "normal",
  };

  const response = await fetch("https://trade-api.gateway.uniswap.org/v1/quote", {
    method: "POST",
    headers: {
      "x-api-key": process.env.UNISWAP_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Quote failed: ${JSON.stringify(error)}`);
  }

  return await response.json();
  // Returns: { quote, routing, permitData, aggregatedOutputs, ... }
}
```

**Key fields in the quote response:**
| Field | Description |
|-------|-------------|
| `quote.route` | The optimal swap path across pools |
| `quote.input` | `{ amount, token }` — what the user sends |
| `quote.output` | `{ amount, token, recipient }` — what the user receives |
| `quote.gasFeeUSD` | Estimated gas cost in USD |
| `quote.priceImpact` | Price impact percentage |
| `quote.slippage` | Applied slippage tolerance |
| `quote.aggregatedOutputs` | Array showing output distribution (user portion + fee portion) |
| `permitData` | Permit2 signature data the user needs to sign |
| `routing` | `"CLASSIC"` (AMM) or `"DUTCH_V2"` / `"DUTCH_V3"` (UniswapX gasless) |

### Step 3A: Execute Swap (Classic AMM Route)

If `routing === "CLASSIC"`, use the `/swap` endpoint to get the transaction calldata.

```typescript
// POST /swap
async function createSwapTransaction(
  quoteResponse: any,    // The full response from /quote
  signature: string      // The user's Permit2 signature
) {
  const requestBody = {
    quote: quoteResponse.quote,
    permitData: quoteResponse.permitData,
    signature,
    simulateTransaction: true,
    urgency: "normal",
  };

  const response = await fetch("https://trade-api.gateway.uniswap.org/v1/swap", {
    method: "POST",
    headers: {
      "x-api-key": process.env.UNISWAP_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const swapData = await response.json();
  // swapData contains: { swap: { to, data, value, gasLimit }, gasFee, ... }
  return swapData;
}
```

### Step 3B: Submit Order (UniswapX Gasless Route)

If `routing` is `"DUTCH_V2"`, `"DUTCH_V3"`, or `"PRIORITY"`, use the `/order` endpoint instead. These orders are **gasless** — the filler pays gas.

```typescript
// POST /order
async function submitOrder(
  quoteResponse: any,
  signature: string
) {
  const requestBody = {
    ...quoteResponse,
    signature,
  };

  const response = await fetch("https://trade-api.gateway.uniswap.org/v1/order", {
    method: "POST",
    headers: {
      "x-api-key": process.env.UNISWAP_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  return await response.json();
  // Returns: { orderId } — track status via GET /orders?orderId=xxx
}
```

### Step 4: Check Swap/Order Status

```typescript
// GET /swaps?txHashes=0x...&chainId=8453
// GET /orders?orderId=xxx
async function checkSwapStatus(txHash: string, chainId: number) {
  const response = await fetch(
    `https://trade-api.gateway.uniswap.org/v1/swaps?txHashes=${txHash}&chainId=${chainId}`,
    {
      headers: { "x-api-key": process.env.UNISWAP_API_KEY! },
    }
  );
  return await response.json();
}
```

## Agent Execution (Connecting to AgentKit)

Once we have the swap calldata from `/swap`, the human-backed Agent executes it:

```typescript
// The Agent sends the transaction using its delegated identity
const swapTx = swapData.swap;
const transaction = {
  to: swapTx.to,        // Universal Router contract address
  data: swapTx.data,    // Encoded swap calldata (includes fee)
  value: swapTx.value,  // ETH value (for native ETH swaps)
  gasLimit: swapTx.gasLimit,
};

const txHash = await agentWallet.sendTransaction(transaction);
console.log(`Wish Executed! TX: ${txHash}`);
```

## Fee Collection Mechanism (Business Model)

The integrator fee is how WISHERS generates revenue to sustain AI API costs.

**How it works:**
1. Fee is configured in the Uniswap Developer Hub (associated with your API key).
2. When you call `/quote`, the response's `aggregatedOutputs` array shows two entries:
   - The user's portion (e.g., `bps: 9975`)
   - The fee portion (e.g., `bps: 25`, `fee: "INTEGRATOR"`, with your `feeRecipient` address)
3. When you call `/swap`, the returned calldata **automatically includes** the fee split.
4. When the transaction executes on-chain, the Universal Router sends the fee to your address.

**Example `aggregatedOutputs` from a quote response:**
```json
[
  {
    "amount": "993829944455360",
    "token": "0x0000000000000000000000000000000000000000",
    "recipient": "0xUserWalletAddress",
    "bps": 9975
  },
  {
    "amount": "2490801865802",
    "token": "0x0000000000000000000000000000000000000000",
    "recipient": "0xWishersTreasuryAddress",
    "bps": 25,
    "fee": "INTEGRATOR"
  }
]
```

## Common Token Addresses (Base Network — chainId: 8453)

| Token | Address |
|-------|---------|
| ETH (native) | `0x0000000000000000000000000000000000000000` |
| WETH | `0x4200000000000000000000000000000000000006` |
| USDC | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| USDbC (Bridged) | `0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6Ca` |

## Hackathon Bounty Requirements (MANDATORY)

To qualify for the Uniswap prize track, we MUST:

1. **Use the Uniswap Trading API** with a valid API key from hub.uniswap.org.
2. **Create a `FEEDBACK.md` file** in the GitHub repo root containing honest feedback on:
   - Developer Experience (DX): Overall experience
   - Functionality: What worked well and what didn't
   - Bugs: Specific issues encountered
   - Documentation: Gaps or unclear areas
   - Friction & Improvements: Missing endpoints, feature requests
3. **Fill out the official Uniswap Hackathon Feedback form** (link provided during the event).

## Key Gotchas

1. **Amount is in smallest unit:** Always convert human amounts (e.g., `1.5` ETH → `1500000000000000000`, `100` USDC → `100000000`) using `ethers.parseUnits(amount, decimals)`.
2. **`swapper` is required in `/quote`:** This is the wallet address that will execute the swap, not just a price check.
3. **Classic vs. UniswapX:** Check the `routing` field in the quote response. `CLASSIC` → use `/swap`. `DUTCH_V2`/`DUTCH_V3`/`PRIORITY` → use `/order`.
4. **Permit2 signature flow:** For ERC20 token swaps, the user must sign the `permitData` returned by `/quote` before calling `/swap`.
5. **Native ETH swaps skip Permit2:** Use `0x0000000000000000000000000000000000000000` as `tokenIn` to avoid the entire approval/permit flow. **← STRONGLY RECOMMENDED FOR DEMO.**
6. **`/indicative_quote` is deprecated.** Always use `/quote`.
7. **Rate limiting:** The API has rate limits. Cache quotes briefly (they expire quickly anyway).
