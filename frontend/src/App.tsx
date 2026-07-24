import React, { useState, useEffect } from 'react';
import WorldIDGate, { VerifiedHuman } from './components/WorldIDGate';
import WalletConnect from './components/WalletConnect';
import WishChat, { ParsedWish } from './components/WishChat';
import WishingWell from './components/WishingWell';
import WishCard from './components/WishCard';
import FlywheelHub from './components/FlywheelHub';

export default function App() {
  const [backendStatus, setBackendStatus] = useState<string>('checking...');
  const [verifiedHuman, setVerifiedHuman] = useState<VerifiedHuman | null>(null);
  const [connectedWalletAddress, setConnectedWalletAddress] = useState<string | null>(null);
  const [activeParsedWish, setActiveParsedWish] = useState<ParsedWish | null>(null);
  const [activeWishList, setActiveWishList] = useState<ParsedWish[]>([]);
  const [totalFeesCollectedEth, setTotalFeesCollectedEth] = useState<number>(0.00015);
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
    // Accumulate 0.1% fee
    setTotalFeesCollectedEth((prev) => prev + 0.00005);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '20px' }}>
      {/* Header Bar */}
      <header className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="WISHERS Logo" style={{ width: '38px', height: '38px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)' }} />
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

      {/* Web3 Wallet Connection Component */}
      <WalletConnect onWalletConnected={(addr) => setConnectedWalletAddress(addr)} />

      {/* World ID Gate */}
      <div style={{ marginBottom: '24px' }}>
        <WorldIDGate
          verifiedHuman={verifiedHuman}
          onVerified={(human) => setVerifiedHuman(human)}
        />
      </div>

      {/* Uniswap 0.1% Flywheel Hub */}
      <FlywheelHub totalFeesCollectedEth={totalFeesCollectedEth} />

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

      {/* Active Wish Cards List with Real Web3 Wallet & Rug Pull Shield */}
      {activeWishList.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Active Wishes ({activeWishList.length})</h3>
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
  );
}
