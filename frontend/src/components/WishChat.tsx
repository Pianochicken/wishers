import React, { useState } from 'react';
import { Sparkles, Send, ShieldAlert, TrendingUp, DollarSign, Wallet, RefreshCw, AlertTriangle } from 'lucide-react';
import { VerifiedHuman } from './WorldIDGate';

export interface ParsedWish {
  conditionType: 'TVL_DROP' | 'PRICE_DROP' | 'PRICE_SPIKE' | 'DEPEG';
  targetTokenSymbol: string;
  thresholdValue: number;
  actionType: 'SWAP' | 'NOTIFY';
  actionAmount: string;
  destinationTokenSymbol: string;
  humanReadableSummary: string;
}

interface WishChatProps {
  verifiedHuman: VerifiedHuman | null;
  onWishParsed: (wish: ParsedWish) => void;
}

export default function WishChat({ verifiedHuman, onWishParsed }: WishChatProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'trending'>('trending');
  const [balanceWarning, setBalanceWarning] = useState<string | null>(null);

  // Demo Portfolio Tokens (Simulated wallet holdings)
  const portfolioTokens = [
    { symbol: 'PEPE', balance: '10,000', icon: '🐸' },
    { symbol: 'ETH', balance: '0.5', icon: '🔷' },
  ];

  // Dual-Tier Smart Preset Wish Chips
  const trendingChips = [
    {
      icon: <ShieldAlert size={14} color="var(--color-danger)" />,
      label: '🛡️ Rug Pull Shield: PEPE TVL Drop 50%',
      prompt: 'If PEPE/USDC pool TVL drops 50%, sell all my PEPE for USDC',
    },
    {
      icon: <TrendingUp size={14} color="var(--color-accent-primary)" />,
      label: '📈 RWA Hedge: Buy NVDA Stock if ETH < $3000',
      prompt: 'If ETH dips below $3,000, buy tokenized Nvidia stock (dNVDA)',
    },
    {
      icon: <DollarSign size={14} color="var(--color-warning)" />,
      label: '💵 Depeg Guard: Swap USDT to USDC if < $0.992',
      prompt: 'Swap USDT to USDC if USDT price depegs below $0.992',
    },
  ];

  const portfolioChips = [
    {
      icon: <ShieldAlert size={14} color="var(--color-danger)" />,
      label: '🛡️ Shield 10,000 PEPE: Auto Sell on TVL Drop',
      prompt: 'If PEPE pool TVL drops 50%, sell all 10000 PEPE for USDC',
    },
    {
      icon: <TrendingUp size={14} color="var(--color-accent-primary)" />,
      label: '📈 Hedge 0.5 ETH: Swap to NVDA Stock on Dip',
      prompt: 'If ETH dips 10%, swap 0.1 ETH to tokenized Nvidia stock (dNVDA)',
    },
  ];

  const handleParseWish = async (promptToParse?: string) => {
    const targetPrompt = promptToParse || inputPrompt;
    if (!targetPrompt.trim()) return;

    setLoading(true);
    setBalanceWarning(null);

    try {
      const res = await fetch('/api/ai/parse-wish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: targetPrompt,
          userBalance: '100', // Simulated connected balance
        }),
      });

      const data = await res.json();
      if (data.status === 'success') {
        if (data.balanceGuard?.warning) {
          setBalanceWarning(data.balanceGuard.warning);
        }
        onWishParsed(data.wish);
      }
    } catch (err) {
      console.error('Error parsing wish:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
      {/* Header & Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--color-accent-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Express Your Financial Wish</h3>
        </div>

        {/* Preset Tabs Switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '10px' }}>
          <button
            onClick={() => setActiveTab('trending')}
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'trending' ? 'var(--color-accent-primary)' : 'transparent',
              color: activeTab === 'trending' ? '#0A0B0F' : 'var(--color-text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            🔥 Market Trends
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'portfolio' ? 'var(--color-accent-primary)' : 'transparent',
              color: activeTab === 'portfolio' ? '#0A0B0F' : 'var(--color-text-secondary)',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            👛 Your Wallet
          </button>
        </div>
      </div>

      {/* Preset Chips Wall */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {(activeTab === 'trending' ? trendingChips : portfolioChips).map((chip, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputPrompt(chip.prompt);
              handleParseWish(chip.prompt);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '12px',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {chip.icon}
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Balance Warning (if triggered) */}
      {balanceWarning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 170, 0, 0.1)', border: '1px solid rgba(255, 170, 0, 0.3)', color: 'var(--color-warning)', fontSize: '12px', marginBottom: '16px' }}>
          <AlertTriangle size={16} />
          <span>{balanceWarning}</span>
        </div>
      )}

      {/* Natural Language Prompt Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleParseWish();
        }}
        style={{ display: 'flex', gap: '8px' }}
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder={verifiedHuman ? "Type your wish... (e.g. Sell PEPE if TVL drops 50%)" : "Verify World ID to unlock AI Agent..."}
          disabled={!verifiedHuman || loading}
          style={{
            flex: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={!verifiedHuman || loading || !inputPrompt.trim()}
          style={{ padding: '12px 16px', borderRadius: '12px' }}
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
