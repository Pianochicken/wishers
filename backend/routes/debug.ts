import express, { Request, Response } from 'express';
import { getPoolMetrics } from '../services/monitor.js';

const router = express.Router();

/**
 * GET /api/debug/tvl-status
 * Returns live metrics for a DEX pool
 */
router.get('/tvl-status', async (req: Request, res: Response) => {
  try {
    const poolAddress = (req.query.pool as string) || '0x0000000000000000000000000000000000000000';
    const report = await getPoolMetrics(poolAddress);
    res.json(report);
  } catch (error) {
    console.error('Error fetching pool metrics:', error);
    res.status(500).json({ error: 'Failed to fetch pool metrics' });
  }
});

export default router;
