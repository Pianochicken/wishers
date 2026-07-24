import React, { useState } from 'react';
import { ShieldCheck, UserCheck, Bot, CheckCircle2, RefreshCw, QrCode } from 'lucide-react';
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
  onVerified: (human: VerifiedHuman) => void;
  verifiedHuman: VerifiedHuman | null;
}

export default function WorldIDGate({ onVerified, verifiedHuman }: WorldIDGateProps) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'simulator' | 'world_app'>('simulator');
  const [rpContext, setRpContext] = useState<RpContext | null>(null);

  const appId = import.meta.env.VITE_WORLD_APP_ID || 'app_staging_e4093952fef9bc655c65f9bf60032b9a';
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
            nullifier_hash: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
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
      onVerified(data);
    } catch (err) {
      console.error('World ID Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (verifiedHuman) {
    return (
      <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--color-success)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontWeight: '600', fontSize: '14px' }}>Human Verified via World ID</span>
          </div>
          <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(0, 214, 143, 0.15)', color: 'var(--color-success)', border: '1px solid rgba(0, 214, 143, 0.3)' }}>
            {verifiedHuman.verificationLevel}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={14} color="var(--color-accent-primary)" />
            <span>Nullifier: <code style={{ color: 'var(--color-text-primary)' }}>{verifiedHuman.nullifier}</code></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot size={14} color="var(--color-accent-primary)" />
            <span>Agent Wallet: <code style={{ color: 'var(--color-text-primary)' }}>{verifiedHuman.agentWallet}</code></span>
          </div>
        </div>

        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-tertiary)' }}>
          <span>AgentBook Execution Rights Granted</span>
          <span style={{ color: 'var(--color-success)', fontWeight: '600' }}>Active</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <ShieldCheck size={26} color="var(--color-accent-primary)" />
        </div>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>World ID Gate & Agent Delegation</h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
        Prove you are a verified human to assign a dedicated AI Agent with delegated execution rights.
      </p>

      {/* Simulator vs Real World App Switch */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setMode('simulator')}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: mode === 'simulator' ? 'var(--color-accent-primary)' : 'var(--color-border)',
            background: mode === 'simulator' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: mode === 'simulator' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          ⚡ Fast Demo Simulator
        </button>
        <button
          onClick={() => setMode('world_app')}
          style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: mode === 'world_app' ? 'var(--color-accent-primary)' : 'var(--color-border)',
            background: mode === 'world_app' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            color: mode === 'world_app' ? 'var(--color-accent-primary)' : 'var(--color-text-secondary)',
            cursor: 'pointer',
          }}
        >
          📱 Official World App QR
        </button>
      </div>

      {mode === 'simulator' ? (
        <button className="btn-primary" onClick={handleFastSimulatorVerify} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
          <span>{loading ? 'Verifying Proof...' : 'Verify with World ID (Demo Mode)'}</span>
        </button>
      ) : (
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
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? <RefreshCw className="animate-spin" size={18} /> : <QrCode size={18} />}
              <span>{loading ? 'Signing RP Context...' : 'Scan QR with World App / Simulator'}</span>
            </button>
          )}
        </IDKitWidget>
      )}
    </div>
  );
}
