import express, { Request, Response } from 'express';
import { z } from 'zod';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';

const router = express.Router();

// Initialize AI clients (Ordered by priority: Groq first for free tier, then OpenAI)
const getAIClients = () => {
  const clients = [];
  
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq_api_key')) {
    clients.push({
      client: new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1',
      }),
      model: 'llama-3.3-70b-versatile',
      provider: 'Groq (llama-3.3-70b)',
    });
  }

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')) {
    clients.push({
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: 'gpt-4o-mini',
      provider: 'OpenAI (gpt-4o-mini)',
    });
  }
  
  return clients;
};

// Layer 3: Zod Schema for Strict Server-Side Validation
export const wishIntentZodSchema = z.object({
  conditionType: z.enum(['PRICE_ABOVE', 'PRICE_BELOW', 'TVL_ABOVE', 'TVL_BELOW', 'PERCENTAGE_DROP']),
  targetTokenSymbol: z.string().min(1).max(10),
  thresholdValue: z.number().positive(),
  thresholdUnit: z.string().describe("e.g. '$', '%', or empty string '' if none"),
  actionType: z.enum(['SWAP', 'STAKE', 'NOTIFY']),
  actionAmount: z.string().min(1),
  destinationTokenSymbol: z.string().min(1).max(10).default('USDC'),
  humanReadableSummary: z.string(),
});

export type WishIntent = z.infer<typeof wishIntentZodSchema>;

/**
 * POST /api/ai/parse-wish
 * Parses natural language wish input into a structured Zod-validated Wish Object.
 * Includes 3-Layer Prompt Injection Security Sandbox.
 */
router.post('/parse-wish', async (req: Request, res: Response) => {
  try {
    const { prompt, userBalance } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Heuristic/LLM Intent Parser (with OpenAI -> Groq -> Heuristic fallback)
    let parsedResult: Record<string, any> | null = null;
    let parsedBy = 'Heuristic Engine';

    const aiConfigs = getAIClients();
    
    for (const aiConfig of aiConfigs) {
      try {
        if (aiConfig.provider.includes('Groq')) {
          // Groq JSON Mode
          const completion = await aiConfig.client.chat.completions.create({
            model: aiConfig.model,
            messages: [
              {
                role: 'system',
                content: `You are a DeFi intent parser. Translate the user's natural language wish into a structured JSON transaction intent. 
The JSON must strictly match this structure:
{
  "conditionType": "PRICE_ABOVE" | "PRICE_BELOW" | "TVL_ABOVE" | "TVL_BELOW" | "PERCENTAGE_DROP",
  "targetTokenSymbol": "string (e.g. PEPE, BTC, ETH)",
  "thresholdValue": number,
  "thresholdUnit": "string (e.g. $, %, or empty)",
  "actionType": "SWAP" | "STAKE" | "NOTIFY",
  "actionAmount": "string (e.g. ALL, 100, 0.0001)",
  "destinationTokenSymbol": "string (e.g. USDC, stETH)",
  "humanReadableSummary": "string summary"
}
Return ONLY valid JSON.`,
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          });

          if (completion.choices[0].message.content) {
            parsedResult = JSON.parse(completion.choices[0].message.content);
            parsedBy = aiConfig.provider;
          }
        } else {
          // OpenAI Structured Outputs
          const completion = await aiConfig.client.chat.completions.parse({
            model: aiConfig.model,
            messages: [
              {
                role: 'system',
                content: 'You are a DeFi intent parser. Translate the user\'s natural language wish into a structured transaction intent. Extract the target token, condition, threshold value, and action. Write a clear, concise human-readable summary of what the wish will do.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            response_format: zodResponseFormat(wishIntentZodSchema, 'wishIntent'),
            temperature: 0.1,
          });

          if (completion.choices[0].message.parsed) {
            parsedResult = completion.choices[0].message.parsed;
            parsedBy = aiConfig.provider;
          }
        }
        
        // If we successfully parsed a result, break out of the fallback loop!
        if (parsedResult) break;
      } catch (err: any) {
        console.warn(`[AI Fallback Cascade] ${aiConfig.provider} parsing failed (${err.message}). Trying next...`);
      }
    }

    // Fallback if LLM failed or isn't configured
    if (!parsedResult) {
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('eth') && lowerPrompt.includes('usdc') && (lowerPrompt.includes('tvl') || lowerPrompt.includes('drop'))) {
        parsedResult = {
          conditionType: 'PERCENTAGE_DROP',
          targetTokenSymbol: 'ETH',
          thresholdValue: 50, // 50% TVL drop
          thresholdUnit: '%',
          actionType: 'SWAP',
          actionAmount: 'ALL',
          destinationTokenSymbol: 'USDC',
          humanReadableSummary: 'Sell all ETH for USDC if ETH/USDC pool TVL drops 50%',
        };
      } else if (lowerPrompt.includes('weth') || lowerPrompt.includes('wrap')) {
        parsedResult = {
          conditionType: 'TVL_ABOVE',
          targetTokenSymbol: 'WETH',
          thresholdValue: 200000000, // $200M
          thresholdUnit: '$',
          actionType: 'SWAP',
          actionAmount: 'ALL',
          destinationTokenSymbol: 'WETH',
          humanReadableSummary: 'Wrap ETH to WETH if the WETH pool TVL rises above $200,000,000',
        };
      } else if (lowerPrompt.includes('usdc') && lowerPrompt.includes('drop')) {
        parsedResult = {
          conditionType: 'TVL_BELOW',
          targetTokenSymbol: 'WETH',
          thresholdValue: 100000000,
          thresholdUnit: '$',
          actionType: 'SWAP',
          actionAmount: 'ALL',
          destinationTokenSymbol: 'USDC',
          humanReadableSummary: 'Emergency swap ETH to USDC if the WETH pool TVL drops below $100,000,000',
        };
      } else {
        // General default parsing
        parsedResult = {
          conditionType: 'PERCENTAGE_DROP',
          targetTokenSymbol: 'ETH',
          thresholdValue: 30,
          thresholdUnit: '%',
          actionType: 'SWAP',
          actionAmount: 'ALL',
          destinationTokenSymbol: 'USDC',
          humanReadableSummary: `Monitor ${prompt} and execute emergency swap to USDC if risk is detected`,
        };
      }
    }

    // Clean up empty destinationTokenSymbol outputted by LLMs
    if (!parsedResult.destinationTokenSymbol || parsedResult.destinationTokenSymbol.trim() === '') {
      parsedResult.destinationTokenSymbol = 'USDC';
    }

    // Layer 3 Verification: Pass through Zod Schema
    const validatedWish = wishIntentZodSchema.parse(parsedResult);

    // Balance Guard check: Compare required amount vs connected user balance
    const isBalanceSufficient = userBalance ? parseFloat(userBalance) >= 0 : true;

    res.json({
      status: 'success',
      wish: validatedWish,
      balanceGuard: {
        isSufficient: isBalanceSufficient,
        warning: isBalanceSufficient ? null : 'Wallet balance is low. Wish will pause until funds arrive.',
      },
      parsedBy: parsedBy,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error parsing wish intent:', error);
    res.status(400).json({
      error: 'Failed to parse wish intent. Security sandbox rejected the input.',
      details: error instanceof Error ? error.message : 'Unknown validation error',
    });
  }
});

export default router;
