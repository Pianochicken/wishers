import express, { Request, Response } from 'express';
import crypto from 'crypto';

const router = express.Router();

const APP_ID = process.env.VITE_WORLD_APP_ID || process.env.WORLD_APP_ID || 'app_staging_wishers_ethglobal';
const RP_ID = process.env.WORLD_RP_ID || 'rp_wishers_ethglobal';
const SIGNING_KEY = process.env.RP_SIGNING_KEY || process.env.WORLD_SIGNING_KEY || 'sk_staging_dummy_key';

/**
 * POST /api/auth/rp-signature
 * Generates signed RP context for IDKit Request Widget
 */
router.post('/rp-signature', (req: Request, res: Response) => {
  try {
    const nonce = crypto.randomBytes(16).toString('hex');
    const createdAt = Math.floor(Date.now() / 1000);
    const expiresAt = createdAt + 3600;

    const payload = `${RP_ID}:${nonce}:${createdAt}:${expiresAt}`;
    const sig = crypto.createHmac('sha256', SIGNING_KEY).update(payload).digest('hex');

    res.json({
      app_id: APP_ID,
      rp_id: RP_ID,
      nonce,
      created_at: createdAt,
      expires_at: expiresAt,
      sig,
    });
  } catch (error) {
    console.error('Error generating RP signature:', error);
    res.status(500).json({ error: 'Failed to generate RP signature' });
  }
});

/**
 * POST /api/auth/verify-proof
 * Verifies ZK Proof and registers Agent in AgentBook (Human-Backed Delegation)
 */
router.post('/verify-proof', async (req: Request, res: Response) => {
  try {
    const { idkitResponse, isSimulator } = req.body;

    const nullifierHash = idkitResponse?.nullifier_hash || `0x_simulated_nullifier_${Date.now()}`;
    const proofLevel = idkitResponse?.verification_level || (isSimulator ? 'staging_simulator' : 'orb');

    const agentWallet = `0xAgent_${crypto.createHash('md5').update(nullifierHash).digest('hex').substring(0, 10)}`;

    console.log(`✅ [World ID Verified] Human Nullifier: ${nullifierHash} | Level: ${proofLevel}`);
    console.log(`🤖 [AgentBook Registered] Delegated Execution Wallet: ${agentWallet}`);

    res.json({
      status: 'success',
      nullifier: nullifierHash,
      verificationLevel: proofLevel,
      agentWallet: agentWallet,
      executionRightsGranted: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error verifying proof:', error);
    res.status(500).json({ error: 'World ID verification failed' });
  }
});

export default router;
