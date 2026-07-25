---
name: wishers-thegraph
description: The Graph integration patterns for the WISHERS ETHGlobal Lisbon 2026 project. Use this skill when building the "Rug Pull Shield" feature, specifically for querying real-time TVL (Total Value Locked) and liquidity pool data from the Uniswap V3 subgraph.
---

# WISHERS — The Graph Integration Skill

## Overview

WISHERS uses **The Graph** to power its signature feature: the **Rug Pull Shield**.
To detect if a token is being rugged, the AI Agent must monitor the token's Liquidity Pool (LP) for sudden drops in Total Value Locked (TVL). The most efficient and decentralized way to do this is by querying the Uniswap V3 Subgraph via The Graph.

**Target Prize Track:** Best AI Tooling ($5,000) & Best AI Use Case ($3,000)
> **CRITICAL BOUNTY STRATEGY:** This skill pairs with The Graph's official Subgraph MCP (`https://thegraph.com/docs/en/ai-overview/`) and our open-source `packages/thegraph-mcp` server, allowing AI agents to query 15,000+ DEX Subgraphs dynamically!

## MCP Server Infrastructure
WISHERS exports an open-source MCP Server in `packages/thegraph-mcp`:
- **Tool Name:** `query_pool_tvl`
- **Output:** Calculated Risk Intelligence Metrics (`CRITICAL`, `WARNING`, `SAFE`).

## API Endpoint & Authentication

To query the decentralized network, you need an API key from The Graph Studio.

- **Base Network Subgraph ID (Uniswap V3):** `G3FPDaq8KdDqwa33Q8P8A4EwM91aZfH7gG8rE7wE4B8L` (Example for Base)
- **Endpoint Format:** `https://gateway.thegraph.com/api/[YOUR_API_KEY]/subgraphs/id/[SUBGRAPH_ID]`

**Headers required:**
```
Content-Type: application/json
```

## Core Workflow: The Rug Pull Shield Query

The Agent needs to periodically check the TVL of a specific pool. If the TVL drops by a user-defined percentage (e.g., 50% in 5 minutes), the Agent triggers the Uniswap API skill to panic-sell.

### 1. The GraphQL Query

We query the `Pool` entity for `totalValueLockedUSD` and `liquidity`.

```graphql
query GetPoolTVL($poolAddress: ID!) {
  pool(id: $poolAddress) {
    id
    token0 {
      symbol
      id
    }
    token1 {
      symbol
      id
    }
    liquidity
    totalValueLockedUSD
    totalValueLockedToken0
    totalValueLockedToken1
  }
}
```

### 2. Implementation (Fetch API)

```typescript
// POST /query
async function fetchPoolTVL(poolAddress: string) {
  const SUBGRAPH_ID = "YOUR_SUBGRAPH_ID"; 
  const API_KEY = process.env.THE_GRAPH_API_KEY!;
  const endpoint = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/${SUBGRAPH_ID}`;

  const query = `
    query GetPoolTVL($poolAddress: ID!) {
      pool(id: $poolAddress) {
        id
        token0 { symbol }
        token1 { symbol }
        liquidity
        totalValueLockedUSD
      }
    }
  `;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: {
        // Subgraph IDs are strictly lowercase
        poolAddress: poolAddress.toLowerCase(), 
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`The Graph query failed: ${response.statusText}`);
  }

  const { data } = await response.json();
  
  if (!data || !data.pool) {
    throw new Error("Pool not found in subgraph");
  }

  return data.pool;
}
```

### 3. Agent Logic: Triggering the Shield

When the AI Agent parses a wish like *"If the TVL of the PEPE/USDC pool drops below $100k, sell my PEPE"*:

1. **Monitor:** The Agent calls `fetchPoolTVL()` every X minutes (or uses a cron job).
2. **Evaluate:**
   ```typescript
   const poolData = await fetchPoolTVL("0xPepeUsdcPoolAddress");
   const currentTvl = parseFloat(poolData.totalValueLockedUSD);
   
   if (currentTvl < 100000) {
     // Condition met! Trigger Uniswap API Skill to execute swap
     console.log("Rug Pull Shield Activated! TVL dropped.");
     await executeEmergencySwap(); 
   }
   ```

## Key Gotchas

1. **Case Sensitivity:** Addresses in The Graph (`id` fields) are **strictly lowercase**. Always run `.toLowerCase()` on wallet or contract addresses before passing them as GraphQL variables.
2. **Delayed Syncing:** Subgraphs on The Graph can sometimes be a few blocks behind the chain tip. For a Rug Pull Shield, this slight delay is acceptable, but log the `_meta { block { number } }` if you need precision.
3. **Derived Metrics:** `totalValueLockedUSD` is a derived metric calculated by the subgraph mappings. In Uniswap V3 (concentrated liquidity), calculating exact TVL is complex, so relying on the subgraph's pre-calculated USD value saves immense backend processing time.
4. **API Key Security:** Do not expose `THE_GRAPH_API_KEY` to the frontend. All subgraph queries must be proxied through the Express backend.

## Hackathon Bounty Requirements

To qualify for The Graph prize track, we MUST:
1. Prove we are using The Graph to query blockchain data (done via the TVL query).
2. Highlight how this SKILL file acts as "Reusable AI Infrastructure" for agents to autonomously interact with The Graph. (Include this narrative in the final Demo / README).
