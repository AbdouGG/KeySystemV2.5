import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
import type { Key } from '../types';

export const getExistingValidKey = async (): Promise<Key | null> => {
  try {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase configuration missing');
      return null;
    }

    const hwid = getHWID();
    const now = new Date();

    const { data: existingKeys, error } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true)
      .gte('expires_at', now.toISOString())
      .limit(1);

    if (error) {
      console.error('Error fetching key:', error);
      return null;
    }

    return existingKeys && existingKeys.length > 0 ? existingKeys[0] : null;
  } catch (error) {
    console.error('Failed to check existing key:', error);
    return null;
  }
};