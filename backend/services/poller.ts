import { getPendingWishes, updateWishStatus } from './wishes.js';
import { getPoolRiskMetrics } from './monitor.js';
import { getAgentWallet } from './agent.js';
import { executeEmergencySwap } from './uniswapTrading.js';

let pollingInterval: NodeJS.Timeout | null = null;

export function startAgentPolling(intervalMs: number = 30000) {
  if (pollingInterval) {
    console.log('[Agent Poller] Polling is already running.');
    return;
  }

  console.log(`[Agent Poller] Starting AI Agent background polling every ${intervalMs / 1000} seconds...`);

  pollingInterval = setInterval(async () => {
    const activeWishes = getPendingWishes();
    
    console.log(`[Agent Poller] 🔍 Checking... Currently monitoring ${activeWishes.length} active wishes.`);

    if (activeWishes.length === 0) {
      return; // Nothing to monitor
    }

    for (const wish of activeWishes) {
      try {
        if (wish.conditionType === 'TVL_DROP') {
          // Hardcoded PEPE/USDC pool on Base Sepolia for demo purposes,
          // In a real app, this would be derived from the wish's target token.
          const poolAddress = '0x1234567890123456789012345678901234567890'; // Replace with actual address or derive it

          const riskReport = await getPoolRiskMetrics(poolAddress);
          
          if (riskReport.riskLevel === 'CRITICAL_RUG_PULL_DETECTED' || riskReport.recommendedAction === 'EMERGENCY_SWAP_NOW') {
            console.log(`🚨 [Agent Poller] RUG PULL DETECTED for wish ${wish.id}!`);
            console.log(`🚨 [Agent Poller] TVL dropped by ${riskReport.tvlDelta5mPercent.toFixed(2)}%`);
            console.log(`⚡ [Agent Poller] Automatically executing emergency swap for human ${wish.nullifierHash.substring(0, 8)}...`);
            
            // Reconstruct the Agent's Ethers Wallet
            const agentWallet = getAgentWallet(wish.nullifierHash);
            
            // Execute the REAL swap using Uniswap API
            // Hardcoded to 0.0001 ETH for hackathon safety
            const realTxHash = await executeEmergencySwap(agentWallet, '0.0001');
            
            if (realTxHash) {
              console.log(`✅ [Agent Poller] Emergency Swap Executed! TxHash: ${realTxHash}`);
              console.log(`🔗 [Agent Poller] View on Basescan: https://sepolia.basescan.org/tx/${realTxHash}`);
              // Mark wish as executed so we don't trigger it again
              updateWishStatus(wish.id, 'EXECUTED');
            } else {
              console.log(`❌ [Agent Poller] Emergency Swap Failed. Will retry next tick.`);
            }
          } else {
            console.log(`[Agent Poller] Wish ${wish.id} condition not met. Risk Level: ${riskReport.riskLevel}`);
          }
        }
      } catch (error) {
        console.error(`[Agent Poller] Error monitoring wish ${wish.id}:`, error);
      }
    }
  }, intervalMs);
}

export function stopAgentPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('[Agent Poller] Stopped background polling.');
  }
}
