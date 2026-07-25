import { ethers } from 'ethers';

// Base Sepolia Chain ID
const CHAIN_ID = 84532;

// Token Addresses for Base Sepolia
const NATIVE_ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
const TOKEN_ADDRESS_MAP: Record<string, string> = {
  'WETH': '0x4200000000000000000000000000000000000006',
  'USDC': '0x036CBD53842c5426634e7929541eC2318f3dCF7e',
};

/**
 * Executes a real emergency swap using the Uniswap Trading API v1
 * on behalf of the user's Agent Wallet.
 */
export async function executeEmergencySwap(wallet: ethers.Wallet, amountEth: string, destinationSymbol: string): Promise<string | null> {
  const apiKey = process.env.UNISWAP_API_KEY;
  const treasuryAddress = process.env.WISHERS_TREASURY_ADDRESS || wallet.address;

  if (!apiKey || apiKey === 'your_uniswap_api_key') {
    console.error('❌ [Uniswap Trading] UNISWAP_API_KEY is missing or invalid!');
    return null;
  }

  const tokenOutAddress = TOKEN_ADDRESS_MAP[destinationSymbol.toUpperCase()];
  if (!tokenOutAddress) {
    console.error(`❌ [Uniswap Trading] Unsupported destination token: ${destinationSymbol}`);
    return null;
  }

  try {
    console.log(`[Uniswap Trading] 🔄 Fetching Quote for ${amountEth} ETH -> ${destinationSymbol.toUpperCase()}...`);
    
    // Step 1: Fetch Quote from Uniswap API
    // We swap FROM Native ETH to skip the Permit2 approval flow!
    const quoteBody = {
      type: 'EXACT_INPUT',
      tokenInChainId: CHAIN_ID,
      tokenOutChainId: CHAIN_ID,
      tokenIn: NATIVE_ETH_ADDRESS,
      tokenOut: tokenOutAddress,
      amount: ethers.parseEther(amountEth).toString(), // Convert ETH to Wei
      swapper: wallet.address,
      slippageTolerance: 0.5,
      protocols: ['V2', 'V3'],
      routingPreference: 'BEST_PRICE',
      urgency: 'normal',
      // Integrator Fee configuration (if supported via body in this version, else it uses API Hub settings)
      portionBips: 10,
      portionRecipient: treasuryAddress,
    };

    const quoteResponse = await fetch('https://trade-api.gateway.uniswap.org/v1/quote', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quoteBody),
    });

    if (!quoteResponse.ok) {
      const err = await quoteResponse.json();
      console.error('❌ [Uniswap Trading] Quote Failed:', err);
      return null;
    }

    const quoteData = await quoteResponse.json();
    console.log(`[Uniswap Trading] ✅ Quote Fetched successfully. Routing: ${quoteData.routing}`);

    // Step 2: Get Swap Calldata (We expect CLASSIC or WRAP routing for Native ETH -> WETH)
    if (quoteData.routing !== 'CLASSIC' && quoteData.routing !== 'WRAP') {
      console.warn(`[Uniswap Trading] Expected CLASSIC or WRAP routing, got ${quoteData.routing}. Cannot proceed with /swap endpoint.`);
      return null;
    }

    console.log(`[Uniswap Trading] 🔄 Building Swap Transaction...`);
    
    const swapBody = {
      quote: quoteData.quote,
      // permitData: Not needed because we are using Native ETH
      // signature: Not needed for Native ETH
      simulateTransaction: true,
      urgency: 'normal',
    };

    const swapResponse = await fetch('https://trade-api.gateway.uniswap.org/v1/swap', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(swapBody),
    });

    if (!swapResponse.ok) {
      const err = await swapResponse.json();
      console.error('❌ [Uniswap Trading] Swap Build Failed:', err);
      return null;
    }

    const swapData = await swapResponse.json();
    console.log(`[Uniswap Trading] ✅ Swap Transaction Built.`);

    // Step 3: Execute Transaction using Ethers.js
    console.log(`[Uniswap Trading] ✍️ Agent Wallet (${wallet.address}) is signing and sending the transaction...`);
    
    const swapTx = swapData.swap;
    const transaction = {
      to: swapTx.to,
      data: swapTx.data,
      value: swapTx.value, // This contains the ETH amount being swapped + gas offset if any
      // We let ethers estimate the gas limit and gas price dynamically instead of forcing swapTx.gasLimit
    };

    // Send the transaction!
    const txResponse = await wallet.sendTransaction(transaction);
    console.log(`[Uniswap Trading] 🚀 Transaction broadcasted! Hash: ${txResponse.hash}`);
    
    // Wait for 1 confirmation
    await txResponse.wait(1);
    console.log(`[Uniswap Trading] 🎯 Transaction Confirmed!`);
    
    return txResponse.hash;

  } catch (error) {
    console.error('❌ [Uniswap Trading] Execution Error:', error);
    return null;
  }
}
