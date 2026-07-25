---
name: wishers-openai-fc
description: LLM Function Calling (Structured Outputs) and Auto-Fallback integration for the WISHERS ETHGlobal Lisbon 2026 project. Use this skill to translate natural language user inputs into structured JSON objects (wishes) that the Agent can execute.
---

# WISHERS — Intent Parsing & LLM Auto-Fallback Skill

## Overview

The core UX of WISHERS relies on translating natural language (e.g., *"If the TVL of PEPE drops 50% in 5 minutes, market sell all my PEPE"*) into a machine-readable JSON object that our backend cron jobs and Uniswap/The Graph integrations can monitor and execute.

To achieve this reliably and ensure the service never goes down due to API rate limits (a common hackathon failure point), we use an **Auto-Fallback Strategy**:
1. **Primary**: OpenAI (`gpt-4o-mini`) via Structured Outputs / Function Calling.
2. **Fallback**: Groq (`llama-3-8b-instant` or `llama-3.3-70b-versatile`) via JSON mode.

## 1. Defining the Wish Schema (Structured Output)

Before calling any LLM, we must define the exact JSON shape we expect back.

```typescript
// The schema definition for Function Calling
const wishSchema = {
  name: "create_wish",
  description: "Creates a structured financial wish based on user conditions.",
  parameters: {
    type: "object",
    properties: {
      conditionType: {
        type: "string",
        enum: ["PRICE_DROP", "PRICE_SPIKE", "TVL_DROP", "DEPEG"],
        description: "The type of market condition to monitor."
      },
      targetTokenSymbol: {
        type: "string",
        description: "The symbol of the token to monitor (e.g., 'PEPE')."
      },
      thresholdValue: {
        type: "number",
        description: "The numerical value that triggers the condition."
      },
      actionType: {
        type: "string",
        enum: ["SWAP", "NOTIFY"],
        description: "What to do when the condition is met."
      },
      actionAmount: {
        type: "string",
        description: "The amount to swap, e.g., 'ALL' or a specific number like '1.5'."
      }
    },
    required: ["conditionType", "targetTokenSymbol", "thresholdValue", "actionType", "actionAmount"]
  }
};
```

## 2. The Auto-Fallback Implementation (Backend only)

> **CRITICAL SECURITY NOTE:** All LLM calls MUST happen on the Express.js backend. Never expose OpenAI/Groq API keys to the frontend React app. The user funds these API calls indirectly via the Uniswap 0.1% `integratorFee`.

```typescript
import OpenAI from "openai";
import Groq from "groq-sdk";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function parseUserWish(userInput: string) {
  try {
    // 1st Attempt: OpenAI (High precision, Structured Outputs)
    console.log("[LLM] Attempting OpenAI GPT-4o-mini...");
    return await parseWithOpenAI(userInput);

  } catch (error) {
    console.warn("[LLM] OpenAI failed (Rate limit / Quota). Falling back to Groq Llama-3...");
    
    try {
      // 2nd Attempt: Groq (Ultra-fast, Free tier generous)
      return await parseWithGroq(userInput);
      
    } catch (fallbackError) {
      console.error("[LLM] Both Primary and Fallback LLMs failed!");
      throw new Error("Unable to parse wish at this time. Please try again later.");
    }
  }
}
```

### Primary: OpenAI Function Calling

```typescript
async function parseWithOpenAI(userInput: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a DeFi assistant. Extract the user's intent." },
      { role: "user", content: userInput }
    ],
    tools: [
      {
        type: "function",
        function: wishSchema
      }
    ],
    tool_choice: { type: "function", function: { name: "create_wish" } }
  });

  const toolCall = response.choices[0].message.tool_calls?.[0];
  if (!toolCall) throw new Error("No tool call returned");

  return JSON.parse(toolCall.function.arguments);
}
```

### Fallback: Groq JSON Mode

Groq APIs are nearly identical to OpenAI's SDK, but depending on the model, forced tool calling might be less stable than explicit JSON mode.

```typescript
async function parseWithGroq(userInput: string) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { 
        role: "system", 
        content: `You are a DeFi assistant. Extract the user's intent and output ONLY a raw JSON object adhering to this schema: ${JSON.stringify(wishSchema.parameters)}. Do not include markdown formatting or explanations.` 
      },
      { role: "user", content: userInput }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error("No content returned from Groq");

  return JSON.parse(content);
}
```

## 3. Connecting to the UI

The frontend provides a seamless experience. The user sees an "Auto" model selector by default.

```tsx
// Frontend React Component
async function handleWishSubmit(text: string) {
  setLoading(true);
  try {
    const response = await fetch("/api/parse-wish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: text, model: "auto" }) // "auto" triggers the fallback logic
    });
    const wishJson = await response.json();
    
    // Save the parsed wish to the database, linked to the World ID nullifier
    setParsedWish(wishJson);
  } catch (err) {
    toast.error("Failed to parse wish.");
  } finally {
    setLoading(false);
  }
}
```

## Key Gotchas

1. **System Prompt Strictness:** When using Groq in `json_object` mode, you *must* explicitly tell the model in the system prompt to output JSON. If you don't, the API will throw a 400 error.
2. **Token Mapping:** The LLM returns a symbol (e.g., "PEPE"). Your backend needs a utility function or a database table to map "PEPE" to its actual Base chain contract address (`0x...`) before querying The Graph or Uniswap.
3. **Validation:** Never trust the LLM output blindly. Always run the returned JSON through a validator (like `zod`) before saving it to your database.
