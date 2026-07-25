import dotenv from 'dotenv';

dotenv.config();

export interface PoolMetrics {
  poolAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  currentPrice: number;
  currentTvlUsd: number;
  timestamp: string;
}

// Dev Trigger State Switch for Instant Demo Testing
let simulatedCrashActive = false;

export function setSimulatedTvlCrash(active: boolean) {
  simulatedCrashActive = active;
  console.log(`⚠️ [Dev Switch] Simulated Crash Trigger is now: ${active ? 'ACTIVE 🔥' : 'OFF 🟢'}`);
}

export function getSimulatedTvlCrashState() {
  return simulatedCrashActive;
}

import { fetchPoolTVL } from './thegraph.js';

/**
 * Queries Uniswap V3 Subgraph via The Graph Decentralized Gateway
 * Returns both Price and TVL to be evaluated by the true intent-driven Poller
 */
export async function getPoolMetrics(poolAddress: string): Promise<PoolMetrics> {
  try {
    const pool = await fetchPoolTVL(poolAddress);
    
    // Use the real data from the subgraph!
    const basePrice = parseFloat(pool.token0Price || '1.0');
    let baseTvl = parseFloat(pool.totalValueLockedUSD || '0');
    
    if (baseTvl === 0) {
      // In testnet, TVL USD might be 0 due to missing price oracles. 
      // We inject a realistic base TVL for demonstration so the math works!
      baseTvl = 2500000;
    }
    
    // If Dev Trigger is pulled, simulate a sudden 65% Drop across both metrics!
    const currentPrice = simulatedCrashActive ? basePrice * 0.35 : basePrice;
    const currentTvl = simulatedCrashActive ? baseTvl * 0.35 : baseTvl;

    return {
      poolAddress,
      token0Symbol: pool.token0.symbol,
      token1Symbol: pool.token1.symbol,
      currentPrice,
      currentTvlUsd: currentTvl,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.log(`📡 [The Graph] Subgraph pool data unavailable for ${poolAddress}. Gracefully falling back to Local DEX Simulation Engine...`);
    
    const basePrice = 1.0;
    const baseTvl = 2500000;
  
    // If Dev Trigger is pulled, simulate a sudden 65% drop
    const currentPrice = simulatedCrashActive ? basePrice * 0.35 : basePrice;
    const currentTvl = simulatedCrashActive ? baseTvl * 0.35 : baseTvl;
  
    return {
      poolAddress,
      token0Symbol: 'ETH',
      token1Symbol: 'USDC',
      currentPrice,
      currentTvlUsd: currentTvl,
      timestamp: new Date().toISOString(),
    };
  }
}
