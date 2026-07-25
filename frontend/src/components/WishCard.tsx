import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, CheckCircle2, ExternalLink, Sparkles, RefreshCw, AlertTriangle, ShieldAlert, Flame, Cpu, Clock, RotateCcw } from 'lucide-react';
import { ParsedWish } from './WishChat';
import { VerifiedHuman } from './WorldIDGate';

interface WishCardProps {
  wish: ParsedWish;
  verifiedHuman: VerifiedHuman | null;
}

export default function WishCard({
  wish,
  verifiedHuman,
}: WishCardProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');
  const [isExpired, setIsExpired] = useState<boolean>(false);

  const isExecuted = wish.status === 'EXECUTED';
  const isFailed = wish.status === 'FAILED';

  // Live Timer Countdown Hook for 24h Protection TTL
  useEffect(() => {
    const updateCountdown = () => {
      if (!wish.expiresAt || isExecuted) {
        setTimeLeftStr(isExecuted ? 'Executed' : '24h left');
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
  }, [wish.expiresAt, isExecuted]);

  const handleRenewWish = () => {
    // Optional: add logic to tell backend to renew wish.
    // For now, this is a placeholder since the button logic was requested to be simplified.
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        marginBottom: '16px',
        borderLeft: isExecuted
          ? '4px solid var(--color-success)'
          : isFailed
          ? '4px solid var(--color-danger)'
          : isExpired
          ? '4px solid var(--color-text-tertiary)'
          : '4px solid var(--color-accent-primary)',
        boxShadow: isExecuted
          ? '0 4px 12px rgba(0, 214, 143, 0.15)'
          : '0 4px 12px rgba(0, 0, 0, 0.15)',
        opacity: isExpired && !isExecuted ? 0.85 : 1,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color={isExpired && !isExecuted ? 'var(--color-text-tertiary)' : isExecuted ? 'var(--color-success)' : 'var(--color-accent-primary)'} />
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
            background: isExecuted
              ? 'rgba(0, 214, 143, 0.15)'
              : isFailed
              ? 'rgba(239, 68, 68, 0.25)'
              : isExpired
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(56, 189, 248, 0.15)',
            color: isExecuted
              ? 'var(--color-success)'
              : isFailed
              ? 'var(--color-danger)'
              : isExpired
              ? 'var(--color-text-tertiary)'
              : 'var(--color-accent-primary)',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isExecuted ? (
            'Fulfilled 🎉'
          ) : isFailed ? (
            'Execution Failed ❌'
          ) : isExpired ? (
            <>
              <Clock size={12} />
              <span>⌛ Protection Expired</span>
            </>
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

      {/* Execution Result Banner / Expired Renewal Button */}
      {isExecuted && wish.txHash ? (
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
              href={`https://worldscan.org/tx/${wish.txHash}`}
              target="_blank"
              rel="noreferrer"
              style={{ color: 'var(--color-accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <span>Worldscan</span>
              <ExternalLink size={12} />
            </a>
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
            TxHash: <code style={{ color: 'var(--color-text-primary)' }}>{wish.txHash.substring(0, 18)}...</code>
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '11px' }}>
            Transaction executed automatically by WISHERS Agent.
          </div>
        </div>
      ) : isExpired && !isExecuted ? (
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
      ) : null}
    </div>
  );
}
