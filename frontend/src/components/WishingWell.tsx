import React, { useState } from 'react';
import { Coins, ArrowRight, Sparkles, X } from 'lucide-react';
import { ParsedWish } from './WishChat';

interface WishingWellProps {
  parsedWish: ParsedWish | null;
  onCancel: () => void;
  onConfirmWish: (wish: ParsedWish) => void;
}

export default function WishingWell({ parsedWish, onCancel, onConfirmWish }: WishingWellProps) {
  const [tossing, setTossing] = useState(false);

  if (!parsedWish) return null;

  const handleTossCoin = () => {
    setTossing(true);
    setTimeout(() => {
      setTossing(false);
      onConfirmWish(parsedWish);
    }, 1400); // 1.4s coin tossing parabolic arc & water ripple animation
  };

  return (
    <div style={{ padding: '28px', position: 'relative', overflowY: 'auto', overflowX: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Close Button / Cancel Flip */}
        <button onClick={onCancel} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--color-text-tertiary)', cursor: 'pointer', zIndex: 10 }}>
          <X size={20} />
        </button>

        {/* 3D Wishing Well & Coin Animation Arena */}
        <div style={{ textAlign: 'center', marginBottom: '20px', position: 'relative' }}>
          
          {/* Cyberpunk Water Ripples */}
          {tossing && (
            <>
              <div className="well-ripple-active" style={{ animationDelay: '0s' }}></div>
              <div className="well-ripple-active" style={{ animationDelay: '0.4s' }}></div>
              <div className="well-ripple-active" style={{ animationDelay: '0.8s' }}></div>
            </>
          )}

          {/* Glowing 3D Gold Coin Icon */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.25) 0%, rgba(56,189,248,0.12) 100%)', border: '2px solid #FFD700', marginBottom: '12px', boxShadow: '0 0 20px rgba(255, 215, 0, 0.4)' }}>
            <div className={tossing ? 'coin-tossing-active' : ''}>
              <Coins size={32} color="#FFD700" />
            </div>
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Confirm Your Wish</h3>
        </div>

        {/* Parsed Parameters Card */}
        <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-border)', marginBottom: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Target Token:</span>
            <span style={{ fontWeight: '700', color: 'var(--color-accent-primary)' }}>{parsedWish.targetTokenSymbol}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Condition:</span>
            <span style={{ fontWeight: '600', color: 'var(--color-warning)' }}>
              {parsedWish.conditionType} &ge; {parsedWish.thresholdValue}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Action:</span>
            <span style={{ fontWeight: '600', color: 'var(--color-success)' }}>
              {parsedWish.actionType} {parsedWish.actionAmount} &rarr; {parsedWish.destinationTokenSymbol}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Integrator Fee:</span>
            <span style={{ fontWeight: '500', color: 'var(--color-text-primary)' }}>0.1% (Sponsor Buyback)</span>
          </div>
        </div>

        {/* Human Readable Summary */}
        <div style={{ background: 'rgba(56, 189, 248, 0.08)', borderRadius: '10px', padding: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '24px', fontSize: '12px', color: 'var(--color-accent-glow)', lineHeight: '1.5', display: 'flex', gap: '8px' }}>
          <Sparkles size={16} color="var(--color-accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <span style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>"{parsedWish.humanReadableSummary}"</span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontWeight: '600', cursor: 'pointer' }}>
            Edit Wish
          </button>
          <button className="btn-primary" onClick={handleTossCoin} disabled={tossing} style={{ flex: 1.5, justifyContent: 'center' }}>
            <span>{tossing ? 'Tossing Coin...' : 'Toss Coin & Lock Wish'}</span>
            {!tossing && <ArrowRight size={16} />}
          </button>
        </div>
    </div>
  );
}
