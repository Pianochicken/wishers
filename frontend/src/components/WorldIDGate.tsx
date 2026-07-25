import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Bot, CheckCircle2, RefreshCw, QrCode, Zap, LogOut } from 'lucide-react';
import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';

export interface VerifiedHuman {
  nullifier: string;
  verificationLevel: string;
  agentWallet: string;
  executionRightsGranted: boolean;
}

export interface RpContext {
  rp_id: string;
  nonce: string;
  created_at: number;
  expires_at: number;
  signature: string;
}

interface WorldIDGateProps {
  onVerified: (human: VerifiedHuman | null) => void;
  verifiedHuman: VerifiedHuman | null;
}

export default function WorldIDGate({ onVerified, verifiedHuman }: WorldIDGateProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'world_app' | 'simulator'>('world_app');
  const [rpContext, setRpContext] = useState<RpContext | null>(null);

  const appId = import.meta.env.VITE_WORLD_APP_ID;
  const action = 'wishers-verify';

  // Fast Simulator Verification for Demo / Testing
  const handleFastSimulatorVerify = async () => {
    setLoading(true);
    try {
      const sigRes = await fetch('/api/auth/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const sigData = await sigRes.json();

      const verifyRes = await fetch('/api/auth/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: sigData.app_id,
          rp_id: sigData.rp_id,
          isSimulator: true,
          idkitResponse: {
            nullifier_hash: 'mock_nullifier_123',
            verification_level: 'orb',
          },
        }),
      });

      const data: VerifiedHuman = await verifyRes.json();
      onVerified(data);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare Signed RP Context for Official World ID Modal
  const handleOpenIDKit = async (openWidget: () => void) => {
    setLoading(true);
    try {
      const sigRes = await fetch('/api/auth/rp-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const sigData = await sigRes.json();

      setRpContext({
        rp_id: sigData.rp_id,
        nonce: sigData.nonce,
        created_at: sigData.created_at,
        expires_at: sigData.expires_at,
        signature: sigData.sig,
      });

      setTimeout(() => {
        openWidget();
      }, 100);
    } catch (err) {
      console.error('Failed to get RP signature for World ID:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real World App / Official IDKit Proof Handler
  const handleIDKitSuccess = async (result: any) => {
    setLoading(true);
    try {
      const verifyRes = await fetch('/api/auth/verify-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isSimulator: false,
          idkitResponse: result,
        }),
      });

      const data: VerifiedHuman = await verifyRes.json();
      console.log('✅ [World ID] Verification Success!');
      console.log('🔑 YOUR REAL NULLIFIER HASH (Copy this for curl):', data.nullifier);
      onVerified(data);
    } catch (err) {
      console.error('World ID Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (verifiedHuman) {
    return (
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', borderLeft: '4px solid var(--color-success)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0, 214, 143, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0, 214, 143, 0.3)', flexShrink: 0 }}>
            <CheckCircle2 size={18} color="var(--color-success)" />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Human Verified</span>
              <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: '10px', background: 'rgba(0, 214, 143, 0.15)', color: 'var(--color-success)', fontWeight: '700' }}>
                {verifiedHuman.verificationLevel}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', wordBreak: 'break-all' }}>
              Agent: <code style={{ color: 'var(--color-text-primary)', userSelect: 'all' }}>{verifiedHuman.agentWallet}</code>
            </div>
          </div>
        </div>
        
        {/* Disconnect Button */}
        <div style={{ flexShrink: 0 }}>
          <button
            onClick={() => onVerified(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 68, 68, 0.3)';
              e.currentTarget.style.color = '#ff4444';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
            }}
          >
            <LogOut size={12} />
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', height: '100%' }}>
      {/* Left Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.3)', flexShrink: 0 }}>
          <ShieldCheck size={18} color="var(--color-accent-primary)" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
              World ID Verification
            </span>
            <button
              onClick={() => setMode(mode === 'world_app' ? 'simulator' : 'world_app')}
              title="Click to toggle between Official World App QR & Fast Demo Mode"
              style={{
                fontSize: '9px',
                padding: '2px 6px',
                borderRadius: '6px',
                background: mode === 'world_app' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--color-border)',
                color: mode === 'world_app' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
                whiteSpace: 'nowrap',
              }}
            >
              {mode === 'world_app' ? '📱 Official QR' : '⚡ Demo Mode'}
            </button>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Prove humanity to unlock Agent
          </div>
        </div>
      </div>

      {/* Right Action Button */}
      <div style={{ flexShrink: 0 }}>
        {mode === 'world_app' ? (
          <IDKitWidget
            app_id={appId as `app_${string}`}
            action={action}
            onSuccess={handleIDKitSuccess}
            handleVerify={handleIDKitSuccess}
            verification_levels={[VerificationLevel.Orb, VerificationLevel.Device]}
          >
            {({ open }: { open: () => void }) => (
              <button
                className="btn-primary"
                onClick={() => handleOpenIDKit(open)}
                disabled={loading}
                style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}
              >
                {loading ? <RefreshCw className="animate-spin" size={14} /> : <QrCode size={14} />}
                <span>{loading ? 'Signing...' : 'Scan World App'}</span>
              </button>
            )}
          </IDKitWidget>
        ) : (
          <button className="btn-primary" onClick={handleFastSimulatorVerify} disabled={loading} style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}>
            {loading ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
            <span>{loading ? 'Verifying...' : 'Fast Demo Verify'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
