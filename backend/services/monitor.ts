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

import { fetchPoolTVL } from './thegraph.js';

/**
 * Queries Uniswap V3 Subgraph via The Graph Decentralized Gateway
 * Returns both Price and TVL to be evaluated by the true intent-driven Poller
 */
export async function getPoolMetrics(poolAddress: string): Promise<PoolMetrics> {
  try {
    const pool = await fetchPoolTVL(poolAddress);
    
    // Use the real data from the subgraph!
    const basePrice = parseFloat(pool.token0Price || '0');
    const baseTvl = parseFloat(pool.totalValueLockedUSD || '0');

    return {
      poolAddress,
      token0Symbol: pool.token0.symbol,
      token1Symbol: pool.token1.symbol,
      currentPrice: basePrice,
      currentTvlUsd: baseTvl,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    console.log(`📡 [The Graph] Subgraph pool data unavailable for ${poolAddress}. Error: ${err.message}`);
    // Return safe fallback 0 values so the poller doesn't crash, but conditions won't meet falsely
    return {
      poolAddress,
      token0Symbol: 'ETH',
      token1Symbol: 'USDC',
      currentPrice: 0,
      currentTvlUsd: 0,
      timestamp: new Date().toISOString(),
    };
  }
}
