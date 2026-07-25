import React, { useState } from 'react';
import { Sparkles, Send, ShieldAlert, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* ── Main Big Dialog Input Box ── */}
      <div className="glass-card" style={{ padding: '20px', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--color-accent-primary)" />
            <h2 style={{ fontSize: '15px', fontWeight: '700' }}>Express Your Wish</h2>
          </div>
        </div>

        {/* Large Multi-Line Chat Textarea Box */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="e.g. If ETH pool drops 50%, swap my ETH to USDC to shield my portfolio..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleParseWish(inputPrompt);
              }
            }}
            style={{
              width: '100%',
              minHeight: '230px',
              padding: '14px 50px 14px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              lineHeight: '1.5',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={() => handleParseWish(inputPrompt)}
            disabled={loading || !inputPrompt.trim()}
            style={{
              position: 'absolute',
              right: '12px',
              bottom: '16px',
              background: 'var(--color-accent-gradient)',
              border: 'none',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: loading || !inputPrompt.trim() ? 0.5 : 1,
              boxShadow: '0 2px 10px rgba(56, 189, 248, 0.3)',
            }}
          >
            {loading ? <RefreshCw className="animate-spin" size={16} color="#0A0B0F" /> : <Send size={16} color="#0A0B0F" />}
          </button>
        </div>
      </div>

      {/* ── Smart Presets Section (Positioned Below the Chat Box) ── */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-text-secondary)', marginBottom: '8px', paddingLeft: '4px' }}>
          🔥 SMART PRESETS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.025)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {chip.icon}
              <span style={{ flex: 1, fontWeight: '500' }}>{chip.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
