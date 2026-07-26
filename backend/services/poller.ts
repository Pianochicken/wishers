import { getPendingWishes, updateWishStatus } from './wishes.js';
import { getPoolMetrics } from './monitor.js';
import { getAgentWallet } from './agent.js';
import { createAgentkitClient, formatSIWEMessage } from '@worldcoin/agentkit';
import { ethers } from 'ethers';

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
        // We use a REAL Uniswap V3 Pool address from Ethereum Mainnet!
        // This is the massive USDC/WETH 0.05% pool (0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640)
        const poolAddress = '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640';

        const metrics = await getPoolMetrics(poolAddress);
        
        let conditionMet = false;
        let metricUsed = '';
        let currentValue = 0;

        switch (wish.conditionType) {
          case 'PRICE_ABOVE':
            conditionMet = metrics.currentPrice > wish.thresholdValue;
            metricUsed = 'Price';
            currentValue = metrics.currentPrice;
            break;
          case 'PRICE_BELOW':
            conditionMet = metrics.currentPrice < wish.thresholdValue;
            metricUsed = 'Price';
            currentValue = metrics.currentPrice;
            break;
          case 'TVL_ABOVE':
            conditionMet = metrics.currentTvlUsd > wish.thresholdValue;
            metricUsed = 'TVL';
            currentValue = metrics.currentTvlUsd;
            break;
          case 'TVL_BELOW':
            conditionMet = metrics.currentTvlUsd < wish.thresholdValue;
            metricUsed = 'TVL';
            currentValue = metrics.currentTvlUsd;
            break;
          case 'PERCENTAGE_DROP':
            // For hackathon simplicity, we map percentage drop directly to the Dev Switch multiplier logic
            // Since the Dev Switch drops metrics by 65%, a < 50% threshold will naturally trigger it
            conditionMet = metrics.currentPrice < (1.0 * (1 - (wish.thresholdValue / 100)));
            metricUsed = 'Price (Drop)';
            currentValue = metrics.currentPrice;
            break;
          case 'PERCENTAGE_RISE':
            conditionMet = metrics.currentPrice > (1.0 * (1 + (wish.thresholdValue / 100)));
            metricUsed = 'Price (Rise)';
            currentValue = metrics.currentPrice;
            break;
        }

        if (conditionMet) {
          console.log(`🚨 [Agent Poller] INTENT CONDITION MET for wish ${wish.id}!`);
          console.log(`🚨 [Agent Poller] Trigger: ${wish.conditionType}. Current ${metricUsed}: ${currentValue.toFixed(4)} vs Threshold: ${wish.thresholdValue}`);
          console.log(`⚡ [Agent Poller] Automatically executing emergency swap for human ${wish.nullifierHash.substring(0, 8)}...`);
          
          // Reconstruct the Agent's Ethers Wallet
          const agentWallet = getAgentWallet(wish.nullifierHash);
          
          // Execute the REAL swap using Uniswap API
          let swapAmount = wish.actionAmount;
          if (swapAmount.toUpperCase() === 'ALL') {
             try {
               const balance = await agentWallet.provider!.getBalance(agentWallet.address);
               const gasBuffer = ethers.parseEther("0.005"); // Reserve 0.005 ETH for gas
               if (balance > gasBuffer) {
                  swapAmount = ethers.formatEther(balance - gasBuffer);
               } else {
                  console.warn(`⚠️ [Agent Poller] Balance too low to safely swap 'ALL' and pay gas for wish ${wish.id}. Falling back to 0.001 ETH.`);
                  swapAmount = '0.0001';
               }
             } catch (err) {
               console.warn(`⚠️ [Agent Poller] Failed to fetch balance for wish ${wish.id}. Falling back to 0.001 ETH.`, err);
               swapAmount = '0.0001';
             }
          }

          // WISHERS AgentKit Flow:
          // Generate SIWE Payload Manually for One-Roundtrip execution (bypassing x402 402 challenge)
          const fullUrl = `http://localhost:${process.env.PORT || 3001}/api/agentkit/execute-swap`;
          const payloadData = {
            version: '1',
            domain: 'localhost',
            uri: fullUrl,
            chainId: 'eip155:480',
            type: 'eip191' as const,
            address: agentWallet.address,
            nonce: Date.now().toString(),
            issuedAt: new Date().toISOString()
          };
          
          const message = formatSIWEMessage(payloadData, agentWallet.address);
          const signature = await agentWallet.signMessage(message);
          const xAgentKitHeader = Buffer.from(JSON.stringify({ ...payloadData, signature })).toString('base64');

          console.log(`🛡️ [Agent Poller] Agent (${agentWallet.address}) signing request for human-backed verification...`);
          
          try {
            const response = await fetch(fullUrl, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'agentkit': xAgentKitHeader
              },
              body: JSON.stringify({
                wishId: wish.id,
                nullifierHash: wish.nullifierHash,
                swapAmount,
                destinationTokenSymbol: wish.destinationTokenSymbol
              })
            });

            if (response.ok) {
              const result = await response.json();
              console.log(`✅ [Agent Poller] AgentKit execution successful! TxHash: ${result.txHash}`);
            } else {
              const errData = await response.json();
              console.error(`❌ [Agent Poller] AgentKit execution rejected:`, errData);
            }
          } catch (e) {
            console.error(`❌ [Agent Poller] AgentKit network error:`, e);
          }
        } else {
          console.log(`[Agent Poller] Wish ${wish.id} condition not met. (Current ${metricUsed}: ${currentValue.toFixed(4)} | Needs: ${wish.conditionType} ${wish.thresholdValue})`);
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
