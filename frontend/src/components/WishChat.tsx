import React, { useState } from 'react';
import { Sparkles, Send, ShieldAlert, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { VerifiedHuman } from './WorldIDGate';
import { API_BASE } from '../config';
import WishingWell from './WishingWell';

export interface ParsedWish {
  conditionType: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'TVL_ABOVE' | 'TVL_BELOW' | 'PERCENTAGE_DROP';
  targetTokenSymbol: string;
  thresholdValue: number;
  thresholdUnit: string;
  actionType: 'SWAP' | 'STAKE' | 'NOTIFY';
  actionAmount: string;
  destinationTokenSymbol: string;
  humanReadableSummary: string;
  createdAt?: number;
  expiresAt?: number;
  durationHours?: number;
  id?: string;
  status?: 'PENDING' | 'EXECUTED' | 'FAILED';
  txHash?: string;
}

interface WishChatProps {
  verifiedHuman: VerifiedHuman | null;
  onWishConfirmed: (wish: ParsedWish) => void;
}

export default function WishChat({ verifiedHuman, onWishConfirmed }: WishChatProps) {
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedWish, setParsedWish] = useState<ParsedWish | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);


  const handleParseWish = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/ai/parse-wish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          verifiedHuman: verifiedHuman,
        }),
      });

      const data = await res.json();
      if (data.status === 'success' && data.wish) {
        const now = Date.now();
        const durationHours = 24;
        const completeWish: ParsedWish = {
          ...data.wish,
          createdAt: now,
          expiresAt: now + durationHours * 3600 * 1000,
          durationHours: durationHours,
        };
        setParsedWish(completeWish);
      }
    } catch (err) {
      console.error('Error parsing wish:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '740px', margin: '0 auto' }}>
      
      {/* ── 3D Flip Container ── */}
      <div style={{
        display: 'grid',
        perspective: '1200px',
        width: '100%',
        animation: isConfirmed ? 'fadeOutUp 0.8s forwards cubic-bezier(0.16, 1, 0.3, 1)' : undefined,
      }}>
        
        {/* FRONT FACE (Chat Input) */}
        <div className="glass-card" style={{
          gridArea: '1 / 1',
          padding: '20px', borderRadius: '18px',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: parsedWish ? 'rotateY(-180deg)' : 'rotateY(0deg)',
          pointerEvents: parsedWish ? 'none' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative', // Front card always dictates container height
          zIndex: parsedWish ? 1 : 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--color-accent-primary)" />
              <h2 style={{ fontSize: '15px', fontWeight: '700' }}>Express Your Wish</h2>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', flex: 1 }}>
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
                flex: 1, // Let it stretch
                minHeight: '230px',
                padding: '14px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                lineHeight: '1.5',
                outline: 'none',
                resize: 'none', // Disable resize so it doesn't break flex height
                fontFamily: 'inherit',
              }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
            <button
              className={loading ? 'animate-pulse' : ''}
              onClick={() => handleParseWish(inputPrompt)}
              disabled={loading || !inputPrompt.trim()}
              style={{
                background: 'var(--color-accent-gradient)',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#0A0B0F',
                fontWeight: '600',
                fontSize: '13px',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading || !inputPrompt.trim() ? 0.7 : 1,
                boxShadow: loading ? '0 0 15px rgba(56, 189, 248, 0.6)' : '0 2px 10px rgba(56, 189, 248, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
              <span>{loading ? 'Consulting Oracle...' : 'Make a Wish'}</span>
            </button>
          </div>
        </div>

        {/* BACK FACE (WishingWell Confirmation) */}
        <div className="glass-card" style={{
          gridArea: '1 / 1',
          padding: '0', borderRadius: '18px',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: parsedWish ? 'rotateY(0deg)' : 'rotateY(180deg)',
          pointerEvents: parsedWish ? 'auto' : 'none',
          zIndex: parsedWish ? 2 : 1,
          overflowY: 'auto', // Allow scrolling if back content is too tall
          overflowX: 'hidden',
          position: 'absolute', // Back card always adapts to front card height
          top: 0, left: 0, right: 0, bottom: 0,
        }}>
          {parsedWish && (
            <WishingWell 
              parsedWish={parsedWish}
              onCancel={() => setParsedWish(null)}
              onConfirmWish={(wish) => {
                setIsConfirmed(true);
                onWishConfirmed(wish);
              }}
            />
          )}
        </div>
      </div>


    </div>
  );
}
