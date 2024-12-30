import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
import type { Key } from '../types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getExistingValidKey = async (): Promise<Key | null> => {
  const hwid = getHWID();
  const now = new Date();

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const { data: existingKeys, error } = await supabase
        .from('keys')
        .select('*')
        .eq('hwid', hwid)
        .eq('is_valid', true)
        .gte('expires_at', now.toISOString())
        .limit(1);

      if (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        if (attempt < MAX_RETRIES - 1) {
          await delay(RETRY_DELAY);
          continue;
        }
        throw error;
      }

      return existingKeys && existingKeys.length > 0 ? existingKeys[0] : null;
    } catch (error) {
      if (attempt === MAX_RETRIES - 1) {
        throw error;
      }
      await delay(RETRY_DELAY);
    }
  }

  return null;
};