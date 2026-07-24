import React from 'react';
import { Coins, Flame, Cpu, Users, ArrowUpRight } from 'lucide-react';

interface FlywheelHubProps {
  totalFeesCollectedEth: number;
}

export default function FlywheelHub({ totalFeesCollectedEth }: FlywheelHubProps) {
  const llmTreasury = (totalFeesCollectedEth * 0.4).toFixed(6);
  const sponsorBuyback = (totalFeesCollectedEth * 0.3).toFixed(6);
  const ubaYield = (totalFeesCollectedEth * 0.3).toFixed(6);

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(56, 189, 248, 0.3)', background: 'linear-gradient(180deg, rgba(18, 20, 28, 0.9) 0%, rgba(10, 11, 15, 0.95) 100%)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            <Coins size={20} color="var(--color-accent-primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Uniswap 0.1% Flywheel Hub</h3>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Transparent Revenue Split & Sponsor Token Buybacks</p>
          </div>
        </div>

        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--color-accent-primary)', border: '1px solid rgba(56, 189, 248, 0.3)', fontWeight: '600' }}>
          10 bips (0.1%)
        </span>
      </div>

      {/* Accumulated Fee Counter Banner */}
      <div style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '12px', padding: '16px', border: '1px solid var(--color-border)', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Total Accumulated Integrator Fees</div>
          <div style={{ fontSize: '22px', fontWeight: '800', background: 'var(--color-accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {totalFeesCollectedEth.toFixed(6)} ETH
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px', justifyContent: 'flex-end' }}>
            <span>Live Collector</span>
            <ArrowUpRight size={14} />
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)' }}>Uniswap API v1</div>
        </div>
      </div>

      {/* 3-Way Split Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        {/* 40% LLM Gas Treasury */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', padding: '12px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <Cpu size={18} color="var(--color-accent-primary)" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>LLM Treasury</div>
          <div style={{ fontSize: '10px', color: 'var(--color-accent-primary)', fontWeight: '700', marginBottom: '4px' }}>40% Split</div>
          <div style={{ fontSize: '12px', fontWeight: '700' }}>{llmTreasury} ETH</div>
        </div>

        {/* 30% Sponsor Buyback */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', padding: '12px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <Flame size={18} color="var(--color-warning)" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>Sponsor Buyback</div>
          <div style={{ fontSize: '10px', color: 'var(--color-warning)', fontWeight: '700', marginBottom: '4px' }}>30% Buyback</div>
          <div style={{ fontSize: '12px', fontWeight: '700' }}>{sponsorBuyback} ETH</div>
          <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>$UNI / $WLD / $GRT</div>
        </div>

        {/* 30% UBA Yield Pool */}
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', padding: '12px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <Users size={18} color="var(--color-success)" style={{ marginBottom: '6px' }} />
          <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '2px' }}>UBA Yield Pool</div>
          <div style={{ fontSize: '10px', color: 'var(--color-success)', fontWeight: '700', marginBottom: '4px' }}>30% Rewards</div>
          <div style={{ fontSize: '12px', fontWeight: '700' }}>{ubaYield} ETH</div>
          <div style={{ fontSize: '9px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>World ID Humans</div>
        </div>
      </div>
    </div>
  );
}
