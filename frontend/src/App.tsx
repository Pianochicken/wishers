import React, { useState, useEffect } from 'react';
import WorldIDGate, { VerifiedHuman } from './components/WorldIDGate';
import WishChat, { ParsedWish } from './components/WishChat';
import WishingWell from './components/WishingWell';

export default function App() {
  const [backendStatus, setBackendStatus] = useState<string>('checking...');
  const [verifiedHuman, setVerifiedHuman] = useState<VerifiedHuman | null>(null);
  const [activeParsedWish, setActiveParsedWish] = useState<ParsedWish | null>(null);
  const [activeWishList, setActiveWishList] = useState<ParsedWish[]>([]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status === 'ok' ? 'Online' : 'Error'))
      .catch(() => setBackendStatus('Backend Offline'));
  }, []);

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>
      {/* Header Bar */}
      <header className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/wishers_logo_final.png" alt="WISHERS Logo" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.5px', background: 'var(--color-accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              WISHERS
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Human-Anchored AI Execution Agent</p>
          </div>
        </div>

        {/* Breathing Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--color-border)' }}>
          <div className="agent-breathing-dot"></div>
          <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>
            {backendStatus}
          </span>
        </div>
      </header>

      {/* World ID Gate */}
      <div style={{ marginBottom: '24px' }}>
        <WorldIDGate
          verifiedHuman={verifiedHuman}
          onVerified={(human) => setVerifiedHuman(human)}
        />
      </div>

      {/* Natural Language Wish Chat */}
      <WishChat
        verifiedHuman={verifiedHuman}
        onWishParsed={(wish) => setActiveParsedWish(wish)}
      />

      {/* Confirmation & Coin Tossing Modal */}
      <WishingWell
        parsedWish={activeParsedWish}
        onCancel={() => setActiveParsedWish(null)}
        onConfirmWish={(confirmedWish) => {
          setActiveWishList([confirmedWish, ...activeWishList]);
          setActiveParsedWish(null);
        }}
      />

      {/* Active Wish List */}
      {activeWishList.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Locked Active Wishes ({activeWishList.length})</h3>
          {activeWishList.map((w, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '16px', marginBottom: '12px', borderLeft: '4px solid var(--color-accent-primary)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{w.humanReadableSummary}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Status: Active Monitoring via The Graph</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
