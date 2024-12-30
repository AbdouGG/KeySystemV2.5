import { v4 as uuidv4 } from 'uuid';
import { addHours } from 'date-fns';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { getHWID } from './hwid';

export const generateKey = async () => {
  try {
    if (!isSupabaseConfigured()) {
      throw new Error('Database configuration is missing');
    }

    if (!supabase) {
      throw new Error('Database client is not initialized');
    }

    const key = uuidv4();
    const now = new Date();
    const expiresAt = addHours(now, 24);
    const hwid = getHWID();

    // Check for existing valid key
    const { data: existingKeys, error: fetchError } = await supabase
      .from('keys')
      .select('*')
      .eq('hwid', hwid)
      .eq('is_valid', true)
      .gte('expires_at', now.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    if (existingKeys && existingKeys.length > 0) {
      return existingKeys[0];
    }

    // Create new key
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

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from key creation');
    }

    return data;
  } catch (error) {
    console.error('Key generation failed:', error);
    throw error;
  }
};