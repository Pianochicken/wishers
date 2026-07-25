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
  const [activeView, setActiveView] = useState<'wishing' | 'wishes'>('wishing');

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

        {/* Active Wishes Tab */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setActiveView(activeView === 'wishing' ? 'wishes' : 'wishing')}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              background: activeView === 'wishes' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${activeView === 'wishes' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
              color: activeView === 'wishes' ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>Active Wishes</span>
            {activeWishList.length > 0 && (
              <span style={{
                background: 'var(--color-accent-primary)',
                color: '#000',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: '800'
              }}>
                {activeWishList.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 20px 20px' }}>

      {/* ── Step 1 Authentication (Side-by-Side 800px) ── */}
      <div style={{ maxWidth: '1000px', margin: '0 auto 4px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '16px' }}>
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

      {/* ── Main Content Area (Conditional View) ── */}
      {activeView === 'wishing' ? (
        <PrayingHands isOpen={isStep1Complete}>
          <WishChat
            verifiedHuman={verifiedHuman}
            onWishConfirmed={async (confirmedWish) => {
              // Optimistically update UI
              setActiveWishList([confirmedWish, ...activeWishList]);
              setActiveView('wishes'); // Switch to wishes view automatically
              
              // Send to backend Agent Poller
              if (verifiedHuman) {
                try {
                  await fetch('/api/wishes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      nullifierHash: verifiedHuman.nullifier,
                      wish: confirmedWish,
                    }),
                  });
                  console.log('✅ Wish successfully submitted to Agent Poller!');
                } catch (err) {
                  console.error('❌ Failed to submit wish to backend:', err);
                }
              }
            }}
          />
        </PrayingHands>
      ) : (
        <div style={{ maxWidth: '600px', margin: '40px auto 20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '24px', textAlign: 'center', color: 'var(--color-text-primary)' }}>
            Your Active Wishes
          </h2>
          {activeWishList.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
              You have no active wishes monitoring the blockchain.
              <br/><br/>
              <button 
                onClick={() => setActiveView('wishing')} 
                className="btn-primary" 
                style={{ padding: '8px 24px', borderRadius: '20px', fontSize: '13px' }}
              >
                Make a Wish
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
