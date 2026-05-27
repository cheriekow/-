import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'supabase_sync_url';
const STORAGE_ANON_KEY = 'supabase_sync_anon_key';

let activeClient: SupabaseClient | null = null;

/**
 * Gets the configured Supabase URL and Anon Key, checking localStorage first, then falling back to Vite env variables.
 */
export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const localUrl = localStorage.getItem(STORAGE_URL_KEY);
  const localKey = localStorage.getItem(STORAGE_ANON_KEY);

  if (localUrl && localKey) {
    return { url: localUrl, anonKey: localKey };
  }

  // Fallback to environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  return null;
}

/**
 * Checks if Supabase has been configured (either via localStorage or env variables).
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

function sanitizeUrl(url: string): string {
  let clean = url.trim();
  if (clean.endsWith('/rest/v1/')) {
    clean = clean.slice(0, -9);
  } else if (clean.endsWith('/rest/v1')) {
    clean = clean.slice(0, -8);
  }
  return clean;
}

/**
 * Returns the active Supabase client. If it doesn't exist but a config exists, it creates it.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (activeClient) {
    return activeClient;
  }

  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  try {
    activeClient = createClient(sanitizeUrl(config.url), config.anonKey, {
      auth: {
        persistSession: false // We do not need user auth sessions since we are using anon public key directly
      }
    });
    return activeClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Saves Supabase credentials to localStorage and initializes/re-initializes the active client.
 */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(STORAGE_URL_KEY, url.trim());
  localStorage.setItem(STORAGE_ANON_KEY, anonKey.trim());
  activeClient = null; // Reset to force recreation with new config
  getSupabaseClient();
}

/**
 * Clears Supabase credentials from localStorage and resets the active client.
 */
export function clearSupabaseConfig(): void {
  localStorage.removeItem(STORAGE_URL_KEY);
  localStorage.removeItem(STORAGE_ANON_KEY);
  activeClient = null;
}

/**
 * Tests connection with provided credentials (or current ones if not provided)
 * by making a lightweight query.
 */
export async function testSupabaseConnection(url?: string, anonKey?: string): Promise<boolean> {
  let clientToTest: SupabaseClient | null = null;

  if (url && anonKey) {
    try {
      clientToTest = createClient(sanitizeUrl(url), anonKey.trim(), {
        auth: { persistSession: false }
      });
    } catch {
      return false;
    }
  } else {
    clientToTest = getSupabaseClient();
  }

  if (!clientToTest) {
    return false;
  }

  try {
    // Try to query the couple_preferences table (or select a simple value to test network/auth)
    // Querying couple_preferences table limit 1 is a good test since it ensures the table exists and API works.
    const { error } = await clientToTest.from('couple_preferences').select('id').limit(1);
    if (error) {
      console.error('Supabase connection test failed with query error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase connection test failed with exception:', error);
    return false;
  }
}
