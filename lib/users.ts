import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';


interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
  }
  
  export interface UserData {
    telegramId: number;
    username: string;
    firstName: string;
    lastName: string;
    isPremium: boolean;
    hashrate: number;
    createdAt: string;
  }

export const saveUserData = async (telegramData: TelegramUser): Promise<void> => {


  try {
    const userRef = doc(db, 'users', telegramData.id.toString());

    // Check if the user exists
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      const userData: UserData = {
        telegramId: telegramData.id,
        username: telegramData.username || '',
        firstName: telegramData.first_name,
        lastName: telegramData.last_name || '',
        isPremium: telegramData.is_premium || false,
        hashrate: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};