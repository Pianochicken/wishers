import express, { Request, Response } from 'express';
import { setSimulatedTvlCrash, getSimulatedTvlCrashState, getPoolRiskMetrics } from '../services/monitor';

const router = express.Router();

/**
 * POST /api/debug/simulate-tvl-drop
 * Dev Trigger Switch: Simulates a sudden 65% TVL Drop for 100% reliable demo video recording
 */
router.post('/simulate-tvl-drop', (req: Request, res: Response) => {
  try {
    const { active } = req.body;
    const newState = active !== undefined ? Boolean(active) : !getSimulatedTvlCrashState();

    setSimulatedTvlCrash(newState);

    res.json({
      status: 'success',
      simulatedCrashActive: newState,
      message: newState
        ? '🔥 Simulated 65% TVL Drop Activated! Active wishes will trigger emergency protective swaps.'
        : '🟢 TVL Crash Simulation Deactivated. Pools restored to safe levels.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error toggling simulated TVL crash:', error);
    res.status(500).json({ error: 'Failed to toggle simulated TVL crash' });
  }
});

/**
 * GET /api/debug/tvl-status
 * Returns live risk intelligence report for a DEX pool
 */
router.get('/tvl-status', async (req: Request, res: Response) => {
  try {
    const poolAddress = (req.query.pool as string) || '0x0000000000000000000000000000000000000000';
    const report = await getPoolRiskMetrics(poolAddress);
    res.json(report);
  } catch (error) {
    console.error('Error fetching pool risk metrics:', error);
    res.status(500).json({ error: 'Failed to fetch pool risk metrics' });
  }
});

export default router;
