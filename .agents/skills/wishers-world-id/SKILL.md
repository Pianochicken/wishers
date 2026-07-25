---
name: wishers-world-id
description: World ID (IDKit v4) and AgentKit integration patterns for the WISHERS ETHGlobal Lisbon 2026 project. Use this skill when building the World ID verification gate, AgentKit agent registration, or the human-backed agent delegation flow.
---

# WISHERS — World ID + AgentKit Integration Skill

## Overview

WISHERS uses two World SDKs:
1. **IDKit v4** (`@worldcoin/idkit`) — Frontend React widget for user verification
2. **AgentKit** (`@worldcoin/agentkit`) — Backend server-side hooks to verify agents are human-backed

**Target Prize Track:** AgentKit New Use Cases ($8,000)

## MCP Reference Endpoint
This skill is backed by World's official Docs MCP Server:
- **World Docs MCP Endpoint:** `https://docs.world.org/mcp` (Query live SDK signatures and developer portal specs in real-time).

## Critical Requirement (WILL BE DISQUALIFIED WITHOUT THIS)

> AgentKit track explicitly disqualifies: "Human-backed benefits for AI agents (i.e API calls, discounts)"
>
> WISHERS must demonstrate that the AI agent's **execution rights** are tied to human verification,
> not just login gating. The agent acts with **delegated authority** from a verified human.

## IDKit v4 Integration (Frontend - React)

### Installation

```bash
npm i @worldcoin/idkit
```

### Prerequisites (Developer Portal)

Create an app at https://developer.worldcoin.org and note:
- `app_id` (e.g., `app_xxxxx`)
- `rp_id` (e.g., `rp_xxxxx`)
- `signing_key` — **store as server-side secret only, NEVER expose to client**

### Frontend Component (React)

```tsx
import { IDKitRequestWidget, orbLegacy, type RpContext } from "@worldcoin/idkit";
import { useState } from "react";

function WorldIDGate({ onVerified }: { onVerified: (nullifier: string) => void }) {
  const [open, setOpen] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);

  const handleOpen = async () => {
    // Step 1: Get RP signature from backend
    const rpSig = await fetch("/api/rp-signature", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "wishers-verify" }),
    }).then((r) => r.json());

    setRpContext({
      rp_id: "rp_xxxxx", // Replace with your rp_id
      nonce: rpSig.nonce,
      created_at: rpSig.created_at,
      expires_at: rpSig.expires_at,
      signature: rpSig.sig,
    });
    setOpen(true);
  };

  if (!rpContext) {
    return <button onClick={handleOpen}>Verify with World ID</button>;
  }

  return (
    <IDKitRequestWidget
      open={open}
      onOpenChange={setOpen}
      app_id="app_xxxxx" // Replace with your app_id
      action="wishers-verify"
      rp_context={rpContext}
      allow_legacy_proofs={true}
      preset={orbLegacy({})}
      handleVerify={async (result) => {
        const response = await fetch("/api/verify-proof", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            rp_id: rpContext.rp_id,
            idkitResponse: result,
          }),
        });

        if (!response.ok) {
          throw new Error("Backend verification failed");
        }
        
        const data = await response.json();
        onVerified(data.nullifier);
      }}
      onSuccess={(result) => {
        // UI update: show the dashboard, hide the gate
        console.log("Verification successful!");
      }}
    />
  );
}
```

### Testing with Simulator

For development, use `environment: "staging"` and the World ID Simulator:
- Simulator URL: https://simulator.worldcoin.org/

## Backend Integration (Express.js)

### Installation

```bash
npm i @worldcoin/idkit-core @worldcoin/agentkit
```

### RP Signature Endpoint

```typescript
// POST /api/rp-signature
import { signRequest } from "@worldcoin/idkit-core/signing";

app.post("/api/rp-signature", (req, res) => {
  const { action } = req.body;

  const { sig, nonce, createdAt, expiresAt } = signRequest({
    signingKeyHex: process.env.RP_SIGNING_KEY!,
    action,
  });

  res.json({
    sig,
    nonce,
    created_at: createdAt,
    expires_at: expiresAt,
  });
});
```

### Proof Verification Endpoint

```typescript
// POST /api/verify-proof
app.post("/api/verify-proof", async (req, res) => {
  const { rp_id, idkitResponse } = req.body;

  // Forward proof to World Developer Portal for verification
  const response = await fetch(
    `https://developer.world.org/api/v4/verify/${rp_id}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(idkitResponse),
    }
  );

  if (!response.ok) {
    return res.status(400).json({ error: "Verification failed" });
  }

  // Extract nullifier for sybil resistance
  const nullifier = idkitResponse.responses?.[0]?.nullifier;

  // Check if this nullifier already has a wishlist (one human = one wishlist)
  if (activeWishlists.has(nullifier)) {
    return res.status(403).json({
      error: "This human already has an active wishlist.",
      message: "One human, one agent, one fair share.",
    });
  }

  // Store nullifier → create session
  activeWishlists.set(nullifier, { createdAt: Date.now(), wishes: [] });

  res.json({ success: true, nullifier });
});
```

## AgentKit Integration (Agent Delegation)

AgentKit extends x402 to let websites distinguish human-backed agents from bots.

### Agent Registration (Pre-hackathon CLI)

```bash
# Install
npm install @worldcoin/agentkit

# Register agent wallet address
npx @worldcoin/agentkit-cli register <agent-wallet-address>

# Check status
npx @worldcoin/agentkit-cli status <agent-wallet-address>
```

### Agent Client (for x402-protected API calls)

```typescript
import { createAgentkitClient } from "@worldcoin/agentkit";

const agentkit = createAgentkitClient({
  signer: {
    address: agentWallet.address,
    chainId: "eip155:8453", // Base
    type: "eip191",
    signMessage: (message) => agentWallet.signMessage(message),
  },
});

// Use agentkit.fetch instead of regular fetch for x402-protected APIs
const response = await agentkit.fetch("https://api.example.com/data");
```

### Server-Side Hooks (Express.js compatible)

The hooks pattern works with any framework, not just Hono:

```typescript
import {
  createAgentBookVerifier,
  createAgentkitHooks,
  InMemoryAgentKitStorage,
  parseAgentkitHeader,
  validateAgentkitMessage,
  verifyAgentkitSignature,
  AGENTKIT,
} from "@worldcoin/agentkit";

const agentBook = createAgentBookVerifier();
const storage = new InMemoryAgentKitStorage(); // Fine for hackathon

const hooks = createAgentkitHooks({
  agentBook,
  storage,
  mode: { type: "free-trial", uses: 10 }, // 10 free wish executions per human
});
```

### Manual Verification (Low-level, for Express)

```typescript
async function verifyAgentIsHumanBacked(req: Request) {
  const header = req.headers[AGENTKIT] || req.headers["agentkit"];
  if (!header) return null;

  const payload = parseAgentkitHeader(header as string);

  const validation = await validateAgentkitMessage(
    payload,
    `https://${req.hostname}${req.path}`
  );
  if (!validation.valid) return null;

  const verification = await verifyAgentkitSignature(payload);
  if (!verification.valid || !verification.address) return null;

  const humanId = await agentBook.lookupHuman(verification.address);
  return humanId; // null = not human-backed, string = anonymous human ID
}
```

## WISHERS-Specific Flow

```
1. User opens WISHERS → World ID Gate shown
2. User scans World ID → IDKit returns verification proof
3. Backend verifies proof → extracts nullifier
4. Backend checks: has this nullifier been seen? (sybil resistance)
5. If new: create AgentKit session with delegated identity
6. User creates wishes via AI chat
7. Agent monitors market conditions autonomously
8. When condition triggers → Agent executes WITH human delegation proof
9. Execution logged with human backing verification
```

## Environment Variables (.env)

```
WORLD_APP_ID=app_xxxxx
WORLD_RP_ID=rp_xxxxx
RP_SIGNING_KEY=sk_xxxxx  # NEVER expose to frontend
```

## Key Gotchas

1. **RP Signature must be generated server-side** — never expose `signing_key` to the client
2. **Nullifier is per-app, per-action** — same human, different app = different nullifier
3. **IDKit v4 uses `orbLegacy` preset** — don't forget `allow_legacy_proofs: true`
4. **InMemoryAgentKitStorage is fine for hackathons** — data lost on restart is OK
5. **Simulator requires `environment: "staging"`** — switch to `"production"` for live demo
6. **The verification API endpoint is** `POST https://developer.world.org/api/v4/verify/{rp_id}`
