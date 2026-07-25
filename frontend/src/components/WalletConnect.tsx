import React, { useState, useEffect } from 'react';
import { Wallet, RefreshCw, AlertTriangle } from 'lucide-react';

interface WalletConnectProps {
  onWalletConnected: (address: string | null) => void;
}

const WORLD_CHAIN_CHAIN_ID_HEX = '0x1e0'; // 480

export default function WalletConnect({ onWalletConnected }: WalletConnectProps) {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);

  // 100% Zero-Request Page Load: NO window.ethereum requests on mount/reload!
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (!accounts || accounts.length === 0) {
          disconnectWalletStateOnly();
        } else if (userAddress) {
          silentAccountCheck(accounts[0]);
        }
      };

      const handleChainChanged = (newChainIdHex: string) => {
        const onWorldChain = newChainIdHex === WORLD_CHAIN_CHAIN_ID_HEX;
        setIsCorrectNetwork(onWorldChain);
        if (onWorldChain && userAddress) {
          fetchBalance(userAddress);
          onWalletConnected(userAddress);
        } else {
          onWalletConnected(null);
        }
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);
      window.ethereum.on?.('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener?.('chainChanged', handleChainChanged);
      };
    }
  }, [userAddress]);

  const silentAccountCheck = async (address: string) => {
    try {
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const onWorldChain = chainIdHex === WORLD_CHAIN_CHAIN_ID_HEX;
      setIsCorrectNetwork(onWorldChain);
      setUserAddress(address);

      if (onWorldChain) {
        onWalletConnected(address);
        await fetchBalance(address);
      } else {
        onWalletConnected(null);
      }
    } catch (err) {
      console.error('Silent account check error:', err);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      const balanceEth = (parseInt(balanceHex, 16) / 1e18).toFixed(4);
      setEthBalance(balanceEth);
    } catch (err) {
      console.error('Error fetching balance:', err);
    }
  };

  const ensureWorldChainNetwork = async (): Promise<boolean> => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: WORLD_CHAIN_CHAIN_ID_HEX }],
      });
      setIsCorrectNetwork(true);
      if (userAddress) {
        onWalletConnected(userAddress);
        await fetchBalance(userAddress);
      }
      return true;
    } catch (switchError: any) {
      // Error 4902 indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: WORLD_CHAIN_CHAIN_ID_HEX,
                chainName: 'World Chain',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://worldchain-mainnet.g.alchemy.com/public', 'https://rpc.worldchain.network'],
                blockExplorerUrls: ['https://worldscan.org'],
              },
            ],
          });
          setIsCorrectNetwork(true);
          if (userAddress) {
            onWalletConnected(userAddress);
            await fetchBalance(userAddress);
          }
          return true;
        } catch (addError) {
          console.error('Failed to add World Chain network:', addError);
        }
      }
      setIsCorrectNetwork(false);
      return false;
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask or a Web3 wallet is required. Please install MetaMask extension!');
      return;
    }

    setConnecting(true);
    try {
      // 1. Force network switch to World Chain first
      await ensureWorldChainNetwork();

      // 2. Request scoped permission via wallet_requestPermissions for Picture 1 targeted UI
      try {
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (permErr) {
        console.warn('Permission prompt interaction:', permErr);
      }

      // 3. Retrieve granted accounts
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setUserAddress(address);
        setIsCorrectNetwork(true);
        onWalletConnected(address);
        await fetchBalance(address);
      }
    } catch (err) {
      console.error('User rejected wallet connection or network switch:', err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWalletStateOnly = () => {
    setUserAddress(null);
    setEthBalance(null);
    onWalletConnected(null);
  };

  // EIP-2255: Real MetaMask Permission Revocation on Disconnect!
  const disconnectWallet = async () => {
    disconnectWalletStateOnly();

    if (typeof window !== 'undefined' && window.ethereum?.request) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch (err) {
        console.warn('MetaMask permission revocation notice:', err);
      }
    }
  };

  return (
    <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', height: '100%' }}>
      {/* Left Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.3)', flexShrink: 0 }}>
          <Wallet size={18} color="var(--color-accent-primary)" />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
              {userAddress ? `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}` : '1. Wallet Connection'}
            </span>
            {userAddress && (
              <span
                style={{
                  fontSize: '9px',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: isCorrectNetwork ? 'rgba(0, 214, 143, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                  color: isCorrectNetwork ? 'var(--color-success)' : 'var(--color-danger)',
                  border: isCorrectNetwork ? '1px solid rgba(0, 214, 143, 0.3)' : '1px solid rgba(239, 68, 68, 0.4)',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                }}
              >
                {isCorrectNetwork ? 'World Chain' : 'Wrong Network'}
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: isCorrectNetwork ? 'var(--color-text-secondary)' : 'var(--color-danger)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {userAddress
              ? isCorrectNetwork
                ? `${ethBalance || '0.0000'} World Chain ETH`
                : ''
              : 'Connect Wallet (World Chain)'}
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {userAddress ? (
          <>
            {!isCorrectNetwork && (
              <button
                onClick={ensureWorldChainNetwork}
                style={{
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: 'var(--color-danger)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                <AlertTriangle size={13} />
                <span>Switch to Base</span>
              </button>
            )}
            <button
              onClick={disconnectWallet}
              style={{
                fontSize: '11px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            onClick={connectWallet}
            className="btn-primary"
            disabled={connecting}
            style={{ fontSize: '11px', padding: '6px 14px', borderRadius: '8px', whiteSpace: 'nowrap' }}
          >
            {connecting ? <RefreshCw className="animate-spin" size={14} /> : <Wallet size={14} />}
            <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
