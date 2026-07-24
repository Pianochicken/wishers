import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface WalletConnectProps {
  onWalletConnected: (address: string | null) => void;
}

const BASE_SEPOLIA_CHAIN_ID_HEX = '0x14a34'; // 84532

export default function WalletConnect({ onWalletConnected }: WalletConnectProps) {
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [ethBalance, setEthBalance] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);

  useEffect(() => {
    // Auto-check if MetaMask is already connected
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          handleAccountSetup(accounts[0]);
        }
      }).catch(console.error);

      // Listen for network changes
      window.ethereum.on?.('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const ensureBaseSepoliaNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_CHAIN_ID_HEX }],
      });
      setIsCorrectNetwork(true);
      return true;
    } catch (switchError: any) {
      // Error 4902 indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BASE_SEPOLIA_CHAIN_ID_HEX,
                chainName: 'Base Sepolia Testnet',
                nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              },
            ],
          });
          setIsCorrectNetwork(true);
          return true;
        } catch (addError) {
          console.error('Failed to add Base Sepolia network:', addError);
        }
      }
      setIsCorrectNetwork(false);
      return false;
    }
  };

  const handleAccountSetup = async (address: string) => {
    setUserAddress(address);
    onWalletConnected(address);

    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainIdHex !== BASE_SEPOLIA_CHAIN_ID_HEX) {
      const switched = await ensureBaseSepoliaNetwork();
      if (!switched) return;
    } else {
      setIsCorrectNetwork(true);
    }

    try {
      // Fetch Real Base Sepolia ETH Balance
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

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('MetaMask or a Web3 wallet is required. Please install MetaMask extensions!');
      return;
    }

    setConnecting(true);
    try {
      // Force switch to Base Sepolia
      const switched = await ensureBaseSepoliaNetwork();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        await handleAccountSetup(accounts[0]);
      }
    } catch (err) {
      console.error('User rejected wallet connection or network switch:', err);
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setUserAddress(null);
    setEthBalance(null);
    onWalletConnected(null);
  };

  return (
    <div className="glass-card" style={{ padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <Wallet size={16} color="var(--color-accent-primary)" />
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{userAddress ? `${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}` : 'Base Sepolia Wallet'}</span>
            {userAddress && (
              <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '10px', background: isCorrectNetwork ? 'rgba(0, 214, 143, 0.15)' : 'rgba(239, 68, 68, 0.2)', color: isCorrectNetwork ? 'var(--color-success)' : '#EF4444', fontWeight: '700' }}>
                {isCorrectNetwork ? 'Base Sepolia Only' : 'Wrong Network'}
              </span>
            )}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)' }}>
            {userAddress
              ? isCorrectNetwork
                ? `${ethBalance || '0.0000'} Base Sepolia ETH`
                : 'Please switch network to Base Sepolia'
              : 'Connect wallet (Enforced: Base Sepolia Testnet)'}
          </div>
        </div>
      </div>

      {userAddress ? (
        <div style={{ display: 'flex', gap: '6px' }}>
          {!isCorrectNetwork && (
            <button
              onClick={ensureBaseSepoliaNetwork}
              style={{
                fontSize: '11px',
                padding: '5px 10px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#EF4444',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Switch to Base
            </button>
          )}
          <button
            onClick={disconnectWallet}
            style={{
              fontSize: '11px',
              padding: '5px 10px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="btn-primary"
          disabled={connecting}
          style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px' }}
        >
          {connecting ? <RefreshCw className="animate-spin" size={14} /> : <Wallet size={14} />}
          <span>{connecting ? 'Connecting...' : 'Connect Base Sepolia'}</span>
        </button>
      )}
    </div>
  );
}
