import { toNano } from 'ton';

// Generate payment link
export const generatePaymentLink = (
  amount: number,
  recipient: string
): string => {
  return `ton://transfer/${recipient}?amount=${toNano(amount)}`;
};

// Validate transaction (simplified)
export const validateTransaction = async (txHash: string): Promise<boolean> => {
  try {
    const response = await fetch(
      `https://toncenter.com/api/v2/getTransaction?hash=${txHash}`
    );
    const data = await response.json();
    return !!data?.result;
  } catch (error) {
    return false;
  }
};