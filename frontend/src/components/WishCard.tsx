import React, { useState } from 'react';
import { ShieldCheck, Play, CheckCircle2, ExternalLink, Sparkles, RefreshCw } from 'lucide-react';
import { ParsedWish } from './WishChat';
import { VerifiedHuman } from './WorldIDGate';

interface WishCardProps {
  wish: ParsedWish;
  verifiedHuman: VerifiedHuman | null;
  onSwapExecuted: (result: any) => void;
}

export default function WishCard({ wish, verifiedHuman, onSwapExecuted }: WishCardProps) {
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const handleExecuteNow = async () => {
    setExecuting(true);

    try {
      const res = await fetch('/api/uniswap/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wish,
          agentWallet: verifiedHuman?.agentWallet || '0xAgent_DelegatedWallet',
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
    }
  };

  return (
    <div className="glass-card" style={{ padding: '20px', marginBottom: '16px', borderLeft: executionResult ? '4px solid var(--color-success)' : '4px solid var(--color-accent-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--color-accent-primary)" />
          <span style={{ fontWeight: '700', fontSize: '14px' }}>{wish.targetTokenSymbol} &rarr; {wish.destinationTokenSymbol}</span>
        </div>
        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: executionResult ? 'rgba(0, 214, 143, 0.15)' : 'rgba(56, 189, 248, 0.15)', color: executionResult ? 'var(--color-success)' : 'var(--color-accent-primary)', fontWeight: '600' }}>
          {executionResult ? 'Fulfilled 🎉' : 'Active Monitoring'}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '14px', lineHeight: '1.4' }}>
        "{wish.humanReadableSummary}"
      </p>

      {/* Execution Result Banner */}
      {executionResult ? (
        <div style={{ background: 'rgba(0, 214, 143, 0.08)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(0, 214, 143, 0.25)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: '600' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} />
              <span>Swap Executed by Delegated Agent</span>
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
          onClick={handleExecuteNow}
          disabled={executing}
          style={{ width: '100%', justifyContent: 'center', padding: '10px 16px', fontSize: '12px' }}
        >
          {executing ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
          <span>{executing ? 'Agent Executing Swap on Uniswap...' : '⚡ Test Trigger Swap Now (Instant Execution)'}</span>
        </button>
      )}
    </div>
  );
}
