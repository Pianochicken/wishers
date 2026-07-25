import express, { Request, Response } from 'express';
import { fetchPoolTVL } from '../services/thegraph.js';

const router = express.Router();

/**
 * GET /api/thegraph/pool/:address
 * Queries the Uniswap V3 Base Sepolia Subgraph for real-time TVL and liquidity.
 */
router.get('/pool/:address', async (req: Request, res: Response): Promise<void> => {
  try {
    const address = req.params.address as string;

    if (!address || !address.startsWith('0x')) {
      res.status(400).json({ error: 'Invalid pool address' });
      return;
    }

    const poolData = await fetchPoolTVL(address);
    
    // Evaluate Risk Status
    const tvlUsd = parseFloat(poolData.totalValueLockedUSD || '0');
    let riskStatus = 'SAFE';

    // Simple Risk Evaluation logic for MVP
    if (tvlUsd < 50000) {
      riskStatus = 'CRITICAL';
    } else if (tvlUsd < 200000) {
      riskStatus = 'WARNING';
    }

    res.json({
      status: 'success',
      pool: poolData,
      riskStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error fetching pool TVL:', error.message);
    res.status(500).json({ error: 'Failed to fetch pool TVL', details: error.message });
  }
});

export default router;
