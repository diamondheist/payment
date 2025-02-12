'use client'

import { useEffect, useState } from 'react';
import  WalletConnector  from './components/WalletConnector';
import { generatePaymentLink } from '../utils/tonPayment';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: any;
        ready: () => void;
        expand: () => void;
        openInvoice: (
          url: string,
          callback: (status: 'paid' | 'cancelled' | 'failed' | string) => void
        ) => void;
      };
    };
  }
}


const YOUR_WALLET_ADDRESS = 'UQA3x6PraY-6pdTf1dXG30aZvQJNU-0U2jgYc2cUJzageM01';

const PaymentPage = () => {
  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } catch (err) {
        console.error('Failed to initialize Telegram WebApp:', err);
        setError('Failed to initialize Telegram interface');
      }
    }
  }, []);

  const handlePayment = async () => {
    if (!window.Telegram?.WebApp) {
      setError('This app must be run within Telegram');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      setPaymentStatus('');

      const paymentLink = generatePaymentLink(amount, YOUR_WALLET_ADDRESS);
      
      window.Telegram.WebApp.openInvoice(paymentLink, (status: string) => {
        if (status === 'paid') {
          setPaymentStatus('Payment successful!');
        } else if (status === 'cancelled') {
          setPaymentStatus('Payment was cancelled');
        } else if (status === 'failed') {
          setPaymentStatus('Payment failed');
          setError('There was an issue processing your payment');
        }
        setIsProcessing(false);
      });
    } catch (err) {
      console.error('Payment error:', err);
      setError('Failed to initiate payment');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          TON Payment Demo
        </h1>
        
        <div className="space-y-6">
          <WalletConnector />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Amount (TON)
            </label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-md"
              disabled={isProcessing}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
              {error}
            </div>
          )}

          {paymentStatus && (
            <div className={`p-3 rounded ${
              paymentStatus.includes('successful')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
            }`}>
              {paymentStatus}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={isProcessing || amount <= 0}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <span>Pay {amount} TON</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;