import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, CheckCircle2, ExternalLink, Sparkles, RefreshCw, AlertTriangle, ShieldAlert, Flame, Cpu, Clock, RotateCcw } from 'lucide-react';
import { ParsedWish } from './WishChat';
import { VerifiedHuman } from './WorldIDGate';

interface WishCardProps {
  wish: ParsedWish;
  verifiedHuman: VerifiedHuman | null;
  connectedWalletAddress: string | null;
  onSwapExecuted: (result: any) => void;
  isSimulatedCrashActive: boolean;
  onToggleSimulatedCrash: () => void;
}

export default function WishCard({
  wish: initialWish,
  verifiedHuman,
  connectedWalletAddress,
  onSwapExecuted,
  isSimulatedCrashActive,
  onToggleSimulatedCrash,
}: WishCardProps) {
  const [wish, setWish] = useState<ParsedWish>(initialWish);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [shieldIntercepting, setShieldIntercepting] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  // Live Timer Countdown Hook for 24h Protection TTL
  useEffect(() => {
    const updateCountdown = () => {
      if (!wish.expiresAt) {
        setTimeLeftStr('24h left');
        return;
      }

      const now = Date.now();
      const diffMs = wish.expiresAt - now;

      if (diffMs <= 0) {
        setTimeLeftStr('Expired');
        setIsExpired(true);
      } else {
        setIsExpired(false);
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeLeftStr(`${hours}h ${mins}m left`);
        } else if (mins > 0) {
          setTimeLeftStr(`${mins}m ${secs}s left`);
        } else {
          setTimeLeftStr(`${secs}s left`);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [wish.expiresAt]);

  const handleRenewWish = () => {
    const now = Date.now();
    const durationHours = 24;
    setWish((prev) => ({
      ...prev,
      createdAt: now,
      expiresAt: now + durationHours * 3600 * 1000,
    }));
    setIsExpired(false);
  };

  // Cinematic 3-Stage Shield Reaction Flow (Red Alert -> Agent Intercepting -> Fulfilled)
  useEffect(() => {
    if (isSimulatedCrashActive && !executionResult && !executing && !shieldIntercepting && !isExpired) {
      setShieldIntercepting(true);

      // Delay 5s so judges/users can clearly see the red alert & agent reaction before executing swap
      const timer = setTimeout(() => {
        handleExecuteSwap(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSimulatedCrashActive, isExpired]);

  const handleExecuteSwap = async (isAutoShieldTrigger = false) => {
    if (isExpired) return;
    setExecuting(true);
    let realSignedTxHash: string | null = null;

    try {
      // 1. Fetch Dynamic Uniswap Quote and Target Treasury Recipient from Backend API
      const quoteRes = await fetch('/api/uniswap/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenInSymbol: wish.targetTokenSymbol || 'ETH',
          tokenOutSymbol: wish.destinationTokenSymbol || 'USDC',
          amount: wish.actionAmount || '0.001',
          swapperAddress: connectedWalletAddress || verifiedHuman?.agentWallet,
        }),
      });

      const quoteData = await quoteRes.json();
      const targetTreasury = quoteData.integratorFee?.treasuryRecipient || quoteData.treasuryRecipient;

      // 2. Dynamically calculate Hex value from the user's parsed wish amount
      const numericAmount = parseFloat(wish.actionAmount || '0.001');
      const amountInWeiHex = '0x' + BigInt(Math.floor(numericAmount * 1e18)).toString(16);

      // 3. Check if MetaMask is connected for Real On-Chain Base Sepolia Transaction
      if (typeof window !== 'undefined' && window.ethereum && targetTreasury) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          const activeWallet = connectedWalletAddress || (accounts && accounts.length > 0 ? accounts[0] : null);
          if (activeWallet) {
            // Prompt MetaMask with dynamically computed Hex value and target treasury
            const txParams = {
              from: activeWallet,
              to: targetTreasury,
              value: amountInWeiHex, // Dynamically computed Wei in Hex from wish.actionAmount
              gas: '0x5208', // 21000 standard gas limit
            };
            realSignedTxHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [txParams],
            });
          }
        } catch (metamaskErr) {
          console.warn('MetaMask signing bypassed or cancelled by user, falling back to Agent delegation execution:', metamaskErr);
        }
      }

      // 4. Complete Swap Execution via Backend API
      const res = await fetch('/api/uniswap/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wish,
          agentWallet: connectedWalletAddress || verifiedHuman?.agentWallet || '0xAgent_DelegatedWallet',
          triggeredByShield: isAutoShieldTrigger,
          userSignedTxHash: realSignedTxHash,
        }),
      });

      const data = await res.json();
      if (data.status === 'executed') {
        setExecutionResult(data);
        onSwapExecuted(data);
      }
    } catch (err) {
      console.error('Swap execution error:', err);
    } finally {
      setExecuting(false);
      setShieldIntercepting(false);
    }
  };

  const isCriticalAlert = (isSimulatedCrashActive || shieldIntercepting) && !executionResult && !isExpired;

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        marginBottom: '16px',
        borderLeft: executionResult
          ? '4px solid var(--color-success)'
          : isExpired
          ? '4px solid var(--color-text-tertiary)'
          : isCriticalAlert
          ? '4px solid var(--color-danger)'
          : '4px solid var(--color-accent-primary)',
        boxShadow: isCriticalAlert
          ? '0 0 25px rgba(239, 68, 68, 0.45)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
        opacity: isExpired ? 0.85 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCriticalAlert ? (
            <ShieldAlert size={20} color="var(--color-danger)" className="animate-pulse" />
          ) : (
            <Sparkles size={16} color={isExpired ? 'var(--color-text-tertiary)' : 'var(--color-accent-primary)'} />
          )}
          <span style={{ fontWeight: '700', fontSize: '14px' }}>
            {wish.targetTokenSymbol} &rarr; {wish.destinationTokenSymbol}
          </span>
        </div>

        {/* Dynamic Status Badge with Live Countdown */}
        <span
          style={{
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '12px',
            background: executionResult
              ? 'rgba(0, 214, 143, 0.15)'
              : isExpired
              ? 'rgba(255, 255, 255, 0.08)'
              : isCriticalAlert
              ? 'rgba(239, 68, 68, 0.25)'
              : 'rgba(56, 189, 248, 0.15)',
            color: executionResult
              ? 'var(--color-success)'
              : isExpired
              ? 'var(--color-text-tertiary)'
              : isCriticalAlert
              ? 'var(--color-danger)'
              : 'var(--color-accent-primary)',
            border: isCriticalAlert ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid transparent',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {executionResult ? (
            'Fulfilled 🎉'
          ) : isExpired ? (
            <>
              <Clock size={12} />
              <span>⌛ Protection Expired</span>
            </>
          ) : isCriticalAlert ? (
            '🚨 CRITICAL RUG PULL DETECTED (-65%)'
          ) : (
            <>
              <Clock size={12} />
              <span>🟢 Monitoring ({timeLeftStr})</span>
            </>
          )}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
        "{wish.humanReadableSummary}"
      </p>

      {/* Interception Warning Box when TVL drops */}
      {isCriticalAlert && !executionResult && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--color-danger)',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          <Cpu className="animate-spin" size={18} color="var(--color-danger)" />
          <span>🤖 AI Agent Intercepted Pool Crash! Executing Emergency Panic Sell...</span>
        </div>
      )}

      {/* Dev Crash Switch Trigger Bar */}
      {!executionResult && !isExpired && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={onToggleSimulatedCrash}
            disabled={shieldIntercepting || executing}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: isSimulatedCrashActive ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
              background: isSimulatedCrashActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: isSimulatedCrashActive ? 'var(--color-danger)' : 'var(--color-text-secondary)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Flame size={14} color={isSimulatedCrashActive ? 'var(--color-danger)' : 'var(--color-warning)'} />
            <span>{isSimulatedCrashActive ? '🔥 TVL Crash Active' : '⚡ Simulate 65% TVL Drop (Demo Trigger)'}</span>
          </button>
        </div>
      )}

      {/* Execution Result Banner / Expired Renewal Button / Manual Trigger Button */}
      {executionResult ? (
        <div
          style={{
            background: 'rgba(0, 214, 143, 0.08)',
            borderRadius: '10px',
            padding: '12px',
            border: '1px solid rgba(0, 214, 143, 0.25)',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} />
              <span>{executionResult.isRealOnChainTx ? 'Real On-Chain Signed & Swapped via MetaMask' : 'Shield Protected & Swapped by Agent'}</span>
            </div>
            <a
              href={`https://sepolia.basescan.org/tx/${executionResult.txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <span>BaseScan</span>
              <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
            TxHash: <code style={{ color: 'var(--color-text-primary)' }}>{executionResult.txHash.substring(0, 18)}...</code>
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
            0.1% Integrator Fee: <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>{executionResult.integratorFeeCollected?.amount}</span> &rarr; Flywheel Hub
          </div>
        </div>
      ) : isExpired ? (
        <button
          onClick={handleRenewWish}
          className="btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '10px 16px',
            fontSize: '12px',
            background: 'var(--color-accent-gradient)',
          }}
        >
          <RotateCcw size={15} />
          <span>⚡ Renew 24h Protection Free</span>
        </button>
      ) : (
        <button
          className="btn-primary"
          onClick={() => handleExecuteSwap(false)}
          disabled={executing || shieldIntercepting}
          style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '12px' }}
        >
          {executing || shieldIntercepting ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
          <span>{executing || shieldIntercepting ? 'Agent Executing Emergency Swap...' : '⚡ Test Trigger Swap Now (Real On-Chain Sign)'}</span>
        </button>
      )}
    </div>
  );
}
