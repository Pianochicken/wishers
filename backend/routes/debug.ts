import express, { Request, Response } from 'express';
import { setSimulatedTvlCrash, getSimulatedTvlCrashState, getPoolMetrics } from '../services/monitor.js';

const router = express.Router();

/**
 * POST /api/debug/simulate-tvl-drop
 * Dev Trigger Switch: Simulates a sudden 65% Crash for 100% reliable demo video recording
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
        ? '🔥 Simulated 65% Crash Activated! Active wishes will trigger emergency protective swaps.'
        : '🟢 Crash Simulation Deactivated. Pools restored to normal levels.',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error toggling simulated crash:', error);
    res.status(500).json({ error: 'Failed to toggle simulated crash' });
  }
});

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
