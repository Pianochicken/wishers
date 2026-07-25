import { Router, Request, Response } from 'express';
import {
  createAgentBookVerifier,
  InMemoryAgentKitStorage,
  parseAgentkitHeader,
  validateAgentkitMessage,
  verifyAgentkitSignature,
  AGENTKIT,
  declareAgentkitExtension
} from '@worldcoin/agentkit';
import { executeEmergencySwap } from '../services/uniswapTrading.js';
import { getAgentWallet } from '../services/agent.js';
import { updateWishStatus } from '../services/wishes.js';

const router = Router();
export const agentBook = createAgentBookVerifier();
export const storage = new InMemoryAgentKitStorage();

/**
 * Manually verify if the incoming Request is backed by a registered Agent Wallet
 */
async function verifyAgentIsHumanBacked(req: Request) {

  const header = req.headers[AGENTKIT] || req.headers['agentkit'];
  if (!header) {
    console.warn('❌ [AgentKit] Missing AgentKit header in request!');
    return null;
  }

  try {
    const payload = parseAgentkitHeader(header as string);
    
    // We construct the full URL exactly as agentkit.fetch would have generated it
    const fullUrl = `http://localhost:${process.env.PORT || 3001}${req.originalUrl}`;
    const validation = await validateAgentkitMessage(payload, fullUrl);
    
    if (!validation.valid) {
      console.warn('❌ [AgentKit] Payload validation failed');
      return null;
    }

    const verification = await verifyAgentkitSignature(payload);
    if (!verification.valid || !verification.address) {
      console.warn('❌ [AgentKit] Signature verification failed', (verification as any).error);
      return null;
    }

    console.log(`🛡️ [AgentKit] Signature valid for address: ${verification.address}`);

    // AgentKit lookupHuman throws or returns null if not registered
    let humanId = await agentBook.lookupHuman(verification.address);
    console.log(`🛡️ [AgentKit] lookupHuman result: ${humanId}`);



    return humanId; 
  } catch (err) {
    console.error('❌ [AgentKit] Verification error:', err);
    return null;
  }
}

/**
 * Protected Agent execution endpoint
 * The AI Poller acts as an Agent Client calling this endpoint.
 */
router.post('/execute-swap', async (req: Request, res: Response): Promise<any> => {
  const { wishId, nullifierHash, swapAmount, destinationTokenSymbol } = req.body;

  console.log(`\n🛡️ [AgentKit] Received execution request for wish ${wishId}`);
  console.log(`🛡️ [AgentKit] Verifying cryptographic proof of human delegation...`);

  // 1. Verify AgentKit Signature
  const humanId = await verifyAgentIsHumanBacked(req);
  
  if (!humanId) {
    console.error(`❌ [AgentKit] Access Denied! Agent is not human-backed or signature is invalid.`);
    return res.status(403).json({ error: 'Access Denied: Agent is not human-backed.' });
  }

  console.log(`✅ [AgentKit] Access Granted! Verified human-backed agent execution.`);

  try {
    // Reconstruct the wallet for execution
    const agentWallet = getAgentWallet(nullifierHash);
    
    const realTxHash = await executeEmergencySwap(agentWallet, swapAmount, destinationTokenSymbol);

    if (realTxHash) {
      console.log(`✅ [AgentKit] Swap Executed! TxHash: ${realTxHash}`);
      updateWishStatus(wishId, 'EXECUTED', realTxHash);
      return res.json({ success: true, txHash: realTxHash });
    } else {
      console.log(`❌ [AgentKit] Swap Execution Failed.`);
      return res.status(500).json({ error: 'Swap failed' });
    }
  } catch (error) {
    console.error(`❌ [AgentKit] Error executing swap:`, error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
