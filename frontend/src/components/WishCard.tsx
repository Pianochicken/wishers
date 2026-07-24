import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, CheckCircle2, ExternalLink, Sparkles, RefreshCw, AlertTriangle, ShieldAlert, Flame, Cpu } from 'lucide-react';
import { ParsedWish } from './WishChat';
import { VerifiedHuman } from './WorldIDGate';

interface WishCardProps {
  wish: ParsedWish;
  verifiedHuman: VerifiedHuman | null;
  onSwapExecuted: (result: any) => void;
  isSimulatedCrashActive: boolean;
  onToggleSimulatedCrash: () => void;
}

export default function WishCard({
  wish,
  verifiedHuman,
  onSwapExecuted,
  isSimulatedCrashActive,
  onToggleSimulatedCrash,
}: WishCardProps) {
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [shieldIntercepting, setShieldIntercepting] = useState(false);

  // Cinematic 3-Stage Shield Reaction Flow (Red Alert -> Agent Intercepting -> Fulfilled)
  useEffect(() => {
    if (isSimulatedCrashActive && !executionResult && !executing && !shieldIntercepting) {
      setShieldIntercepting(true);

      // Delay 2.5s so judges/users can clearly see the red alert & agent reaction before executing swap
      const timer = setTimeout(() => {
        handleExecuteSwap(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSimulatedCrashActive]);

  const handleExecuteSwap = async (isAutoShieldTrigger = false) => {
    setExecuting(true);

    try {
      const res = await fetch('/api/uniswap/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wish,
          agentWallet: verifiedHuman?.agentWallet || '0xAgent_DelegatedWallet',
          triggeredByShield: isAutoShieldTrigger,
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

  const isCriticalAlert = (isSimulatedCrashActive || shieldIntercepting) && !executionResult;

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        marginBottom: '16px',
        borderLeft: executionResult
          ? '4px solid var(--color-success)'
          : isCriticalAlert
          ? '4px solid #EF4444'
          : '4px solid var(--color-accent-primary)',
        boxShadow: isCriticalAlert
          ? '0 0 25px rgba(239, 68, 68, 0.45)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isCriticalAlert ? (
            <ShieldAlert size={20} color="#EF4444" className="animate-pulse" />
          ) : (
            <Sparkles size={16} color="var(--color-accent-primary)" />
          )}
          <span style={{ fontWeight: '700', fontSize: '14px' }}>
            {wish.targetTokenSymbol} &rarr; {wish.destinationTokenSymbol}
          </span>
        </div>

        {/* Dynamic Status Badge */}
        <span
          style={{
            fontSize: '11px',
            padding: '3px 10px',
            borderRadius: '12px',
            background: executionResult
              ? 'rgba(0, 214, 143, 0.15)'
              : isCriticalAlert
              ? 'rgba(239, 68, 68, 0.25)'
              : 'rgba(56, 189, 248, 0.15)',
            color: executionResult
              ? 'var(--color-success)'
              : isCriticalAlert
              ? '#EF4444'
              : 'var(--color-accent-primary)',
            border: isCriticalAlert ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid transparent',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {executionResult
            ? 'Fulfilled 🎉'
            : isCriticalAlert
            ? '🚨 CRITICAL RUG PULL DETECTED (-65%)'
            : '🟢 Monitoring Active'}
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
            color: '#EF4444',
            fontSize: '12px',
            fontWeight: '600',
          }}
        >
          <Cpu className="animate-spin" size={18} color="#EF4444" />
          <span>🤖 AI Agent Intercepted Pool Crash! Executing Emergency Panic Sell...</span>
        </div>
      )}

      {/* Dev Crash Switch Trigger Bar */}
      {!executionResult && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={onToggleSimulatedCrash}
            disabled={shieldIntercepting || executing}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: isSimulatedCrashActive ? '1px solid #EF4444' : '1px solid var(--color-border)',
              background: isSimulatedCrashActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: isSimulatedCrashActive ? '#EF4444' : 'var(--color-text-secondary)',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Flame size={14} color={isSimulatedCrashActive ? '#EF4444' : 'var(--color-warning)'} />
            <span>{isSimulatedCrashActive ? '🔥 TVL Crash Active' : '⚡ Simulate 65% TVL Drop (Demo Trigger)'}</span>
          </button>
        </div>
      )}

      {/* Execution Result Banner / Manual Trigger Button */}
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
              <span>Shield Protected & Swapped by Agent</span>
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
      ) : (
        <button
          className="btn-primary"
          onClick={() => handleExecuteSwap(false)}
          disabled={executing || shieldIntercepting}
          style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '12px' }}
        >
          {executing || shieldIntercepting ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
          <span>{executing || shieldIntercepting ? 'Agent Executing Emergency Swap...' : '⚡ Test Trigger Swap Now'}</span>
        </button>
      )}
    </div>
  );
}
