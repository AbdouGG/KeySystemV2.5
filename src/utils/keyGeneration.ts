import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { supabase } from '../config/supabase';
import { getHWID } from './hwid';
import type { Key } from '../types';

export class KeyGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeyGenerationError';
  }
}

export const generateKey = async (): Promise<Key> => {
  try {
    const hwid = getHWID();
    const now = new Date();
    
    // First check for existing valid key
    const { data: existingKeys, error: fetchError } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true)
      .gte('expires_at', now.toISOString())
      .limit(1);

    if (fetchError) {
      throw new KeyGenerationError('Failed to check existing keys');
    }

    if (existingKeys && existingKeys.length > 0) {
      return existingKeys[0];
    }

    // Generate new key if no valid key exists
    const key = uuidv4();
    const expiresAt = addHours(now, 24);

    const { data, error } = await supabase
      .from('keys')
      .insert([
        {
          key,
          hwid,
          created_at: now.toISOString(),
          expires_at: expiresAt.toISOString(),
          is_valid: true,
        },
      ])
      .select()
      .single();

    if (error || !data) {
      throw new KeyGenerationError('Failed to generate new key');
    }

    return data;
  } catch (error) {
    if (error instanceof KeyGenerationError) {
      throw error;
    }
    throw new KeyGenerationError('Unexpected error during key generation');
  }
};