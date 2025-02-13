'use client'

import React, { useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const wallet = useTonWallet();

  
  const transaction = {
    validUntil: Math.floor(Date.now() / 1000) + 180, // 3 minutes validity
    messages: [
      {
        address: "UQA3x6PraY-6pdTf1dXG30aZvQJNU-0U2jgYc2cUJzageM01", // Replace with actual recipient address
        amount: "10000000",
      },
    ],
  };

  const handlePurchase = async () => {
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Send the transaction
      const result = await tonConnectUI.sendTransaction(transaction);
      console.log('Transaction sent:', result);

      // Update Firebase after transaction confirmation
      const userRef = doc(db, 'users', address as string);
      await updateDoc(userRef, {
        hashrate: increment(1),
        lastPurchase: new Date().toISOString(),
        transactionHistory: {
          timestamp: new Date().toISOString(),
          amount: "10000000",
          txHash: result.boc // Transaction hash
        }
      });

      setSuccess(true);
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  const walletDevice = wallet?.device.appName ?? 'No wallet connected';
  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connect wallet';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">TON Mining</h1>
          <div className="mt-4">
            <TonConnectButton />
          </div>
        </div>

        {/* Wallet Info */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Connected Address: 
              <span className="ml-2 font-mono text-blue-600">{shortAddress}</span>
            </p>
            <p className="text-sm text-gray-600">
              Wallet Type: 
              <span className="ml-2 font-medium">{walletDevice}</span>
            </p>
          </div>
        </div>

        {/* Purchase Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Hashrate</h2>
          <p className="text-gray-600 mb-4">
            Increase your mining power by purchasing additional hashrate
          </p>
          <button
            onClick={handlePurchase}
            disabled={isLoading || !wallet}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
              ${!wallet ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isLoading ? 'Processing...' : 'Buy Hashrate (0.01 TON)'}
          </button>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 p-4 rounded-md">
            <p className="text-green-700">
              Purchase successful! Your hashrate has been increased.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;