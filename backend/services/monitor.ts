import dotenv from 'dotenv';

dotenv.config();

export interface RiskIntelligenceReport {
  poolAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  currentTvlUsd: number;
  previousTvlUsd: number;
  tvlDelta5mPercent: number;
  riskLevel: 'CRITICAL_RUG_PULL_DETECTED' | 'WARNING_HIGH_VOLATILITY' | 'SAFE_NORMAL_MONITORING';
  recommendedAction: 'EMERGENCY_SWAP_NOW' | 'CONTINUE_MONITORING';
  timestamp: string;
}

// Memory Cache for Pool History (5-Minute TVL Sliding Window)
const poolTvlHistoryCache: Record<string, { tvlUsd: number; updatedAt: number }> = {};

// Dev Trigger State Switch for Instant Demo Testing
let simulatedTvlCrashActive = false;

export function setSimulatedTvlCrash(active: boolean) {
  simulatedTvlCrashActive = active;
  console.log(`⚠️ [Dev Switch] Simulated TVL Crash Trigger is now: ${active ? 'ACTIVE 🔥' : 'OFF 🟢'}`);
}

export function getSimulatedTvlCrashState() {
  return simulatedTvlCrashActive;
}

import { fetchPoolTVL } from './thegraph.js';

/**
 * Queries Uniswap V3 Subgraph via The Graph Decentralized Gateway
 */
export async function queryTheGraphPoolTVL(poolAddress: string): Promise<{ token0: string; token1: string; tvlUsd: number }> {
  try {
    const pool = await fetchPoolTVL(poolAddress);
    
    // If Dev Trigger is pulled, simulate a sudden 65% TVL drop (Rug Pull)
    const baseTvl = parseFloat(pool.totalValueLockedUSD || '0');
    const currentTvl = simulatedTvlCrashActive ? baseTvl * 0.35 : baseTvl;

    return {
      token0: pool.token0.symbol,
      token1: pool.token1.symbol,
      tvlUsd: currentTvl,
    };
  } catch (err) {
    console.warn('The Graph gateway call failed in monitor.ts, falling back to local DEX monitor simulation:', err);
    
    // Fallback Baseline Monitoring Values (DEX Pool Simulation)
    const isEthPool = poolAddress.toLowerCase().includes('eth') || poolAddress.toLowerCase().includes('0x00000');
    const baseTvl = isEthPool ? 12500000 : 2500000;
  
    // If Dev Trigger is pulled, simulate a sudden 65% TVL drop (Rug Pull)
    const currentTvl = simulatedTvlCrashActive ? baseTvl * 0.35 : baseTvl;
  
    return {
      token0: isEthPool ? 'ETH' : 'PEPE',
      token1: 'USDC',
      tvlUsd: currentTvl,
    };
  }
}

/**
 * Calculates Pool Risk Intelligence Report
 */
export async function getPoolRiskMetrics(poolAddress: string): Promise<RiskIntelligenceReport> {
  const currentData = await queryTheGraphPoolTVL(poolAddress);
  const now = Date.now();

  const cached = poolTvlHistoryCache[poolAddress];
  const previousTvlUsd = cached ? cached.tvlUsd : currentData.tvlUsd;

  // Calculate 5-Minute Delta
  const tvlDelta5mPercent = previousTvlUsd > 0
    ? ((currentData.tvlUsd - previousTvlUsd) / previousTvlUsd) * 100
    : 0;

  // Update Cache
  poolTvlHistoryCache[poolAddress] = { tvlUsd: currentData.tvlUsd, updatedAt: now };

  let riskLevel: RiskIntelligenceReport['riskLevel'] = 'SAFE_NORMAL_MONITORING';
  let recommendedAction: RiskIntelligenceReport['recommendedAction'] = 'CONTINUE_MONITORING';

  if (simulatedTvlCrashActive || tvlDelta5mPercent <= -50) {
    riskLevel = 'CRITICAL_RUG_PULL_DETECTED';
    recommendedAction = 'EMERGENCY_SWAP_NOW';
  } else if (tvlDelta5mPercent <= -20) {
    riskLevel = 'WARNING_HIGH_VOLATILITY';
  }

  return {
    poolAddress,
    token0Symbol: currentData.token0,
    token1Symbol: currentData.token1,
    currentTvlUsd: currentData.tvlUsd,
    previousTvlUsd,
    tvlDelta5mPercent,
    riskLevel,
    recommendedAction,
    timestamp: new Date().toISOString(),
  };
}
