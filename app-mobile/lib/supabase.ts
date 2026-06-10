import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl      = process.env.EXPO_PUBLIC_SUPABASE_URL      ?? '';
const supabaseAnonKey  = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (__DEV__ && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn(
    '[CafeLocco] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. ' +
    'Supabase calls will fail until they are added to app-mobile/.env — the app still runs.',
  );
}

// Fall back to harmless placeholders so createClient() never throws at import
// time when env vars are missing. Without this the whole app crashes on launch
// (createClient('') throws "supabaseUrl is required"). With it, the client
// simply fails network calls and the app renders its logged-out state.
const url = supabaseUrl || 'https://placeholder.supabase.co';
const anonKey = supabaseAnonKey || 'public-anon-placeholder';

// Native: persist the session securely via expo-secure-store.
// Web: expo-secure-store has no implementation — let supabase-js use its
// default (localStorage) by leaving storage undefined.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(url, anonKey, {
  auth: {
    storage: Platform.OS === 'web' ? undefined : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
