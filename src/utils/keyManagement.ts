import { fetchValidKey } from './db/keyQueries';
import { getHWID } from './hwid';
import type { Key } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getExistingValidKey = async (): Promise<Key | null> => {
  const hwid = getHWID();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fetchValidKey(hwid);
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt === MAX_RETRIES - 1) {
        throw error;
      }
      
      await delay(RETRY_DELAY * (attempt + 1)); // Exponential backoff
    }
  }

  return null;
};