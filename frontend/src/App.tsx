import React, { useState, useEffect } from 'react';
import WorldIDGate, { VerifiedHuman } from './components/WorldIDGate';
import WalletConnect from './components/WalletConnect';
import PrayingHands from './components/PrayingHands';
import WishChat, { ParsedWish } from './components/WishChat';

import WishCard from './components/WishCard';

export default function App() {
  const [backendStatus, setBackendStatus] = useState<string>('checking...');
  const [verifiedHuman, setVerifiedHuman] = useState<VerifiedHuman | null>(null);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [activeWishList, setActiveWishList] = useState<ParsedWish[]>([]);
  const [isSimulatedCrashActive, setIsSimulatedCrashActive] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status === 'ok' ? 'Online' : 'Error'))
      .catch(() => setBackendStatus('Backend Offline'));
  }, []);

  const handleToggleSimulatedCrash = async () => {
    try {
      const res = await fetch('/api/debug/simulate-tvl-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !isSimulatedCrashActive }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIsSimulatedCrashActive(data.simulatedCrashActive);
      }
    } catch (err) {
      console.error('Error toggling TVL crash simulation:', err);
    }
  };

  const handleSwapExecuted = (result: any) => {
    console.log('Swap executed successfully:', result);
  };

  const isStep1Complete = Boolean(connectedWalletAddress && verifiedHuman);

  return (
    <>
      {/* ── Top Full-Width Header Banner ── */}
      <header style={{
        width: '100%',
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(10, 11, 15, 0.6)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Main Logo & Title Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src="/logo.png"
            alt="WISHERS Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              objectFit: 'cover',
              boxShadow: '0 0 16px rgba(56, 189, 248, 0.4)',
              border: '1px solid rgba(224, 231, 255, 0.2)',
              display: 'block',
            }}
          />
          <div>
            <h1 style={{
              fontSize: '18px',
              fontWeight: '800',
              letterSpacing: '-0.5px',
              background: 'var(--color-accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: '1.2',
            }}>
              WISHERS
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '500', margin: 0 }}>
              Human-Anchored AI Execution Agent
            </p>
          </div>
        </div>

        {/* Online Agent Breathing Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid var(--color-border)',
        }}>
          <div className="agent-breathing-dot"></div>
          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            {backendStatus}
          </span>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 20px 20px' }}>

      {/* ── Step 1 Authentication (Standard Width 540px) ── */}
      <div style={{ maxWidth: '540px', margin: '0 auto 4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <WalletConnect onWalletConnected={(addr) => setConnectedWalletAddress(addr)} />
        <WorldIDGate
          verifiedHuman={verifiedHuman}
          onVerified={(human) => setVerifiedHuman(human)}
        />
      </div>

      {/* ── Single Clean Status Pill Badge (Below Auth Cards) ── */}
      <div style={{ textAlign: 'center', margin: '16px 0 0px' }}>
        <span style={{
          fontSize: '12px', fontWeight: '600',
          color: isStep1Complete ? 'var(--color-success)' : 'var(--color-accent-primary)',
          background: isStep1Complete ? 'rgba(0,214,143,0.1)' : 'rgba(56,189,248,0.1)',
          padding: '6px 18px', borderRadius: '20px',
          border: isStep1Complete ? '1px solid rgba(0,214,143,0.3)' : '1px solid rgba(56,189,248,0.3)',
          transition: 'all 0.4s ease',
          display: 'inline-block',
        }}>
          {isStep1Complete
            ? '✨ Wish Portal Opened — Make Your Wish'
            : '🙏 Complete Wallet & World ID Verification to Open Portal'}
        </span>
      </div>

      {/* ── Praying Hands Visual + Expanded Wish Chat Portal ── */}
      <PrayingHands isOpen={isStep1Complete}>
        <WishChat
          verifiedHuman={verifiedHuman}
          onWishConfirmed={(confirmedWish) => {
            setActiveWishList([confirmedWish, ...activeWishList]);
          }}
        />
      </PrayingHands>

      {/* ── Active Wishes Monitoring Cards (Standard Width 540px) ── */}
      {isStep1Complete && (
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          {activeWishList.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
                Active Wishes ({activeWishList.length})
              </h3>
              {activeWishList.map((wish, idx) => (
                <WishCard
                  key={idx}
                  wish={wish}
                  verifiedHuman={verifiedHuman}
                  connectedWalletAddress={connectedWalletAddress}
                  onSwapExecuted={handleSwapExecuted}
                  isSimulatedCrashActive={isSimulatedCrashActive}
                  onToggleSimulatedCrash={handleToggleSimulatedCrash}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}
