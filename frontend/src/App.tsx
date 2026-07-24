import React, { useState, useEffect } from 'react';
import WorldIDGate, { VerifiedHuman } from './components/WorldIDGate';

export default function App() {
  const [backendStatus, setBackendStatus] = useState<string>('checking...');
  const [verifiedHuman, setVerifiedHuman] = useState<VerifiedHuman | null>(null);

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

      {/* Main Container */}
      <main className="glass-card" style={{ padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔮</div>
        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Wish it. Your agent handles the rest.</h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
          {verifiedHuman
            ? 'Your dedicated AI Agent is active and ready to process your natural language wishes.'
            : 'WISHERS empowers verified humans with an autonomous AI execution agent for DeFi protection and RWA stock hedging.'}
        </p>
      </main>
    </div>
  );
}
