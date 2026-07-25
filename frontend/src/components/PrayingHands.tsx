import React from 'react';

interface PrayingHandsProps {
  isOpen: boolean;
  children?: React.ReactNode;
}

export default function PrayingHands({ isOpen, children }: PrayingHandsProps) {
  const handTransition = 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
  const handWidth = 200;

  return (
    <div style={{ position: 'relative', padding: '16px 0', width: '100%', overflow: 'visible' }}>
      {/* ── Hands & Center Portal Container ── */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: isOpen ? '360px' : '210px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        transition: 'all 0.6s ease',
      }}>

        {/* Left Hand Image */}
        <div style={{
          position: 'absolute',
          left: isOpen ? '-100px' : 'calc(50% - 200px)',
          top: '0',
          transition: handTransition,
          pointerEvents: 'none',
          zIndex: 2,
        }}>
          <img
            src="/hand-left.png"
            alt="Left praying hand"
            style={{
              width: `${handWidth}px`,
              height: 'auto',
              display: 'block',
              filter: isOpen ? 'drop-shadow(0 0 16px rgba(224, 231, 255, 0.4))' : 'none',
              transition: 'filter 0.6s ease',
            }}
          />
        </div>

        {/* Center Portal: Wish Chat box (Stretches between the hands!) */}
        {isOpen && (
          <div className="sacred-portal-expanded" style={{
            width: '100%',
            padding: `0 ${handWidth - 100 + 10}px`,
            zIndex: 1,
          }}>
            {children}
          </div>
        )}

        {/* Right Hand Image */}
        <div style={{
          position: 'absolute',
          right: isOpen ? '-100px' : 'calc(50% - 200px)',
          top: '0',
          transition: handTransition,
          pointerEvents: 'none',
          zIndex: 2,
        }}>
          <img
            src="/hand-right.png"
            alt="Right praying hand"
            style={{
              width: `${handWidth}px`,
              height: 'auto',
              display: 'block',
              filter: isOpen ? 'drop-shadow(0 0 16px rgba(56, 189, 248, 0.4))' : 'none',
              transition: 'filter 0.6s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
