import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { getHWID } from './hwid';
import { fetchValidKey, createNewKey } from './db/keyQueries';
import type { Key } from '../types';

export class KeyGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeyGenerationError';
  }
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateKey = async (): Promise<Key> => {
  const hwid = getHWID();
  
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // First try to get existing valid key
      const existingKey = await fetchValidKey(hwid);
      if (existingKey) return existingKey;

      // Generate new key if none exists
      const now = new Date();
      const keyData = {
        key: uuidv4(),
        hwid,
        created_at: now.toISOString(),
        expires_at: addHours(now, 24).toISOString(),
        is_valid: true,
      };

      return await createNewKey(keyData);
    } catch (error) {
      console.error(`Key generation attempt ${attempt + 1} failed:`, error);
      
      if (attempt === MAX_RETRIES - 1) {
        throw new KeyGenerationError(
          'Failed to generate key after multiple attempts. Please try again.'
        );
      }
      
      await delay(RETRY_DELAY * (attempt + 1)); // Exponential backoff
    }
  }

  throw new KeyGenerationError('Failed to generate key');
};