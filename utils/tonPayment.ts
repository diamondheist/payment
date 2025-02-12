import { toNano } from 'ton';

// Constants
const TON_CENTER_API = 'https://toncenter.com/api/v2';
const MIN_AMOUNT = 0.01;
const MAX_AMOUNT = 1000;

interface TransactionResponse {
  ok: boolean;
  result?: {
    transaction_id: string;
    status: string;
    // Add other fields as needed
  };
  error?: string;
}

// Generate payment link with validation
export const generatePaymentLink = (
    amount: number,
    recipient: string
  ): string | null => {
    try {
      // Validate amount
      if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
        throw new Error(`Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT} TON`);
      }
  
      // Validate recipient address
      if (!recipient.match(/^[0-9A-Za-z_-]{48}$/)) {
        throw new Error('Invalid TON wallet address');
      }
  
      const amountInNano = toNano(amount).toString();
      
      // Replace YOUR_BOT_USERNAME with your actual bot username (without @)
      return `https://t.me/Diamondheistbot/pay?amount=${amountInNano}&address=${recipient}`;
      
    } catch (error) {
      console.error('Error generating payment link:', error);
      return null;
    }
  };

// Validate transaction with more robust error handling
export const validateTransaction = async (
  txHash: string
): Promise<TransactionResponse> => {
  try {
    // Validate transaction hash format
    if (!txHash.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error('Invalid transaction hash format');
    }

    const response = await fetch(
      `${TON_CENTER_API}/getTransaction?hash=${txHash}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      ok: true,
      result: data.result
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// New utility function to format TON amount
export const formatTonAmount = (amount: number): string => {
  return `${amount.toFixed(2)} TON`;
};

// New utility function to check if we're in Telegram environment
export const isTelegramWebApp = (): boolean => {
  return !!(typeof window !== 'undefined' && window.Telegram?.WebApp);
};

// New utility function to handle payment callbacks
export const handlePaymentCallback = (
  status: string,
  callbacks: {
    onSuccess?: () => void;
    onFailure?: (error: string) => void;
    onCancel?: () => void;
  }
): void => {
  switch (status) {
    case 'paid':
      callbacks.onSuccess?.();
      break;
    case 'cancelled':
      callbacks.onCancel?.();
      break;
    case 'failed':
      callbacks.onFailure?.('Payment failed');
      break;
    default:
      callbacks.onFailure?.(`Unknown status: ${status}`);
  }
};