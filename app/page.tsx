'use client'

import React, { useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { CHAIN } from '@tonconnect/protocol';


const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const wallet = useTonWallet();

  const handlePurchase = async () => {
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        network: CHAIN.MAINNET,  // Add network specification here

        messages: [
          {
            address: "UQA3x6PraY-6pdTf1dXG30aZvQJNU-0U2jgYc2cUJzageM01",
            amount: "20000000",
          }
        ]
      });
      
      console.log('Transaction sent:', result);
      setSuccess(true);
    } catch (err) {
      console.error('Transaction failed:', err);
      setError('Transaction failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const walletDevice = wallet?.device.appName ?? 'No wallet connected';
  const shortAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Connect wallet';

  return (
    <div className="min-h-screen bg-gray-50 py-12 space-y-8 px-4">
     
        <div className="text-center flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-900">Transaction</h1>
            <div className='mt-4 flex justify-center'><TonConnectButton /></div>
        </div>

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
              ${!wallet ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isLoading ? 'Processing...' : 'Buy Hashrate (0.02 TON)'}
          </button>
        </div>

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
  );
};

export default Page;