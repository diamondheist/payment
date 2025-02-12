'use client'

import { useEffect, useState, useCallback } from 'react';
import WalletConnector from './components/WalletConnector';
import { 
  generatePaymentLink, 
  handlePaymentCallback, 
  isTelegramWebApp,
  formatTonAmount 
} from '../utils/tonPayment';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

const WALLET_ADDRESS = 'UQA3x6PraY-6pdTf1dXG30aZvQJNU-0U2jgYc2cUJzageM01';

const PaymentPage = () => {
  const [paymentState, setPaymentState] = useState({
    status: '',
    isProcessing: false,
    amount: 10,
    error: ''
  });

  useEffect(() => {
    if (isTelegramWebApp()) {
      try {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      } catch (err) {
        setPaymentState(prev => ({
          ...prev,
          error: 'Failed to initialize Telegram interface'
        }));
      }
    }
  }, []);

  const handlePayment = useCallback(async () => {
    if (!isTelegramWebApp()) {
      setPaymentState(prev => ({
        ...prev,
        error: 'This app must be run within Telegram'
      }));
      return;
    }

    try {
      setPaymentState(prev => ({
        ...prev,
        isProcessing: true,
        error: '',
        status: ''
      }));

      const paymentLink = generatePaymentLink(paymentState.amount, WALLET_ADDRESS);
      
      if (!paymentLink) {
        throw new Error('Failed to generate payment link');
      }

      window.Telegram.WebApp.openInvoice(
        paymentLink,
        (status : string) => {
          handlePaymentCallback(status, {
            onSuccess: () => {
              setPaymentState(prev => ({
                ...prev,
                status: 'Payment successful!',
                isProcessing: false
              }));
            },
            onFailure: (error) => {
              setPaymentState(prev => ({
                ...prev,
                status: 'Payment failed',
                error,
                isProcessing: false
              }));
            },
            onCancel: () => {
              setPaymentState(prev => ({
                ...prev,
                status: 'Payment was cancelled',
                isProcessing: false
              }));
            }
          });
        }
      );
    } catch (err) {
      console.error('Payment error:', err);
      setPaymentState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to initiate payment',
        isProcessing: false
      }));
    }
  }, [paymentState.amount]);

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
              min="0.01"
              step="0.01"
              value={paymentState.amount}
              onChange={(e) => setPaymentState(prev => ({
                ...prev,
                amount: Number(e.target.value)
              }))}
              className="w-full px-3 py-2 border rounded-md"
              disabled={paymentState.isProcessing}
            />
          </div>

          {paymentState.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded">
              {paymentState.error}
            </div>
          )}

          {paymentState.status && (
            <div className={`p-3 rounded ${
              paymentState.status.includes('successful')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
            }`}>
              {paymentState.status}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={paymentState.isProcessing || paymentState.amount <= 0}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {paymentState.isProcessing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              <span>Pay {formatTonAmount(paymentState.amount)}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;