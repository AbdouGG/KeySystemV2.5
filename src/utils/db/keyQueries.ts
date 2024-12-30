import { supabase } from '../../config/supabase';
import type { Key } from '../../types';

export const fetchValidKey = async (hwid: string): Promise<Key | null> => {
  const { data, error } = await supabase
    .from('keys')
    .select('*')
    .eq('hwid', hwid)
    .eq('is_valid', true)
    .gte('expires_at', new Date().toISOString())
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No key found
    }
    throw error;
  }

  return data;
};

export const createNewKey = async (keyData: Omit<Key, 'id'>): Promise<Key> => {
  const { data, error } = await supabase
    .from('keys')
    .insert([keyData])
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error('Failed to create key');

  return data;
};