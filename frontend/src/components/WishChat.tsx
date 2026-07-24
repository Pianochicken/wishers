import React, { useState } from 'react';
import { Sparkles, Send, ShieldAlert, TrendingUp, DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';
import { VerifiedHuman } from './WorldIDGate';

export interface ParsedWish {
  conditionType: 'TVL_DROP' | 'PRICE_DROP' | 'PRICE_SPIKE' | 'DEPEG';
  targetTokenSymbol: string;
  thresholdValue: number;
  actionType: 'SWAP' | 'NOTIFY';
  actionAmount: string;
  destinationTokenSymbol: string;
  humanReadableSummary: string;
  createdAt?: number;
  expiresAt?: number;
  durationHours?: number;
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

  // Dual-Tier Smart Preset Wish Chips (Using ETH & Mock Tokens)
  const trendingChips = [
    {
      icon: <ShieldAlert size={14} color="var(--color-danger)" />,
      label: '🛡️ Shield ETH: Swap to USDC if TVL drops 50%',
      prompt: 'If ETH/USDC pool TVL drops 50%, sell all my ETH for MockUSDC',
    },
    {
      icon: <TrendingUp size={14} color="var(--color-accent-primary)" />,
      label: '📈 RWA Hedge: Buy Nvidia Stock (dNVDA) if ETH < $3000',
      prompt: 'If ETH dips below $3,000, buy tokenized Nvidia stock (dNVDA)',
    },
    {
      icon: <DollarSign size={14} color="var(--color-warning)" />,
      label: '💵 Depeg Guard: Swap USDT to USDC if < $0.992',
      prompt: 'If USDT drops below $0.992, emergency swap USDT to MockUSDC',
    },
  ];

  const handleParseWish = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLoading(true);
    setBalanceWarning(null);

    try {
      const res = await fetch('/api/wish/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          verifiedHuman: verifiedHuman,
        }),
      });

      const data = await res.json();
      if (data.status === 'success' && data.parsedWish) {
        const now = Date.now();
        const durationHours = 24;
        const completeWish: ParsedWish = {
          ...data.parsedWish,
          createdAt: now,
          expiresAt: now + durationHours * 3600 * 1000,
          durationHours: durationHours,
        };
        onWishParsed(completeWish);
      }
    } catch (err) {
      console.error('Error parsing wish:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--color-accent-primary)" />
          <h2 style={{ fontSize: '15px', fontWeight: '700' }}>Express Your Financial Wish</h2>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
          AI Sandbox Ready
        </span>
      </div>

      {/* Preset Chips Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <button
          onClick={() => setActiveTab('trending')}
          style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '6px',
            border: activeTab === 'trending' ? '1px solid var(--color-accent-primary)' : '1px solid transparent',
            background: activeTab === 'trending' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: activeTab === 'trending' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🔥 Smart Presets
        </button>
      </div>

      {/* Preset Chips Carousel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {trendingChips.map((chip, idx) => (
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
              padding: '10px 12px',
              borderRadius: '8px',
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
            <span style={{ flex: 1 }}>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="e.g. If ETH pool drops 50%, swap to USDC..."
          onKeyDown={(e) => e.key === 'Enter' && handleParseWish(inputPrompt)}
          style={{
            width: '100%',
            padding: '12px 45px 12px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleParseWish(inputPrompt)}
          disabled={loading || !inputPrompt.trim()}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--color-accent-gradient)',
            border: 'none',
            borderRadius: '8px',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            opacity: loading || !inputPrompt.trim() ? 0.5 : 1,
          }}
        >
          {loading ? <RefreshCw className="animate-spin" size={14} color="#fff" /> : <Send size={14} color="#fff" />}
        </button>
      </div>
    </div>
  );
}
