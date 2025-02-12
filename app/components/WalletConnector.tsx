"use client"; // Mark as a client component

import { useState, useEffect } from 'react';
import { TonConnect, Wallet, WalletConnectionSource } from '@tonconnect/sdk';

// Conditionally initialize the connector only on the client
let connector: TonConnect | null = null;
if (typeof window !== 'undefined') {
  connector = new TonConnect({
    manifestUrl: 'https://your-app.com/tonconnect-manifest.json',
    network: 'mainnet'
  } as any);
}

// Define universal wallet source
const UNIVERSAL_WALLET_SOURCE: WalletConnectionSource = {
  jsBridgeKey: 'tonkeeper',
  bridgeUrl: 'https://bridge.tonapi.io/bridge',
  universalLink: 'https://app.tonkeeper.com/ton-connect'
};

export const WalletConnector = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If the connector is not initialized (e.g. during SSR), simply stop loading.
    if (!connector) {
      setIsLoading(false);
      return;
    }

    const checkConnection = async () => {
      try {
        const wallet = connector.wallet;
        if (wallet) {
          setWalletAddress(wallet.account.address);
        }
      } catch (err) {
        console.error('Failed to restore connection:', err);
        setError('Failed to check wallet connection');
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();

    // Subscribe to connection status changes
    const unsubscribe = connector.onStatusChange((wallet: Wallet | null) => {
      if (wallet) {
        setWalletAddress(wallet.account.address);
        setError(null);
      } else {
        setWalletAddress(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnect = async () => {
    if (!connector) {
      console.error('TonConnect not initialized');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Connect using the universal wallet source
      await connector.connect(UNIVERSAL_WALLET_SOURCE);

      // Get the wallet address after connecting
      const wallet = connector.wallet;
      if (wallet) {
        setWalletAddress(wallet.account.address);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connector) {
      console.error('TonConnect not initialized');
      return;
    }

    try {
      await connector.disconnect();
      setWalletAddress(null);
      setError(null);
    } catch (err) {
      console.error('Disconnection error:', err);
      setError('Failed to disconnect wallet');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
      
      {walletAddress ? (
        <div className="flex items-center gap-2">
          <p className="text-sm">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </p>
          <button
            onClick={handleDisconnect}
            className="text-red-500 text-sm hover:text-red-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect TON Wallet
        </button>
      )}
    </div>
  );
};
