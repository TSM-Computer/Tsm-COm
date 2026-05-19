import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvCredentials = () => ({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY,
});

const sanitizeUrl = (url: string | undefined) => {
  if (!url) return undefined;
  return url.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
};

const getLocalCredentials = () => ({
  url: localStorage.getItem('supabase_url'),
  key: localStorage.getItem('supabase_key'),
});

export const getSupabaseConfig = () => {
  const env = getEnvCredentials();
  const local = getLocalCredentials();
  
  const rawUrl = env.url || local.url;
  const url = sanitizeUrl(rawUrl);
  const key = env.key || local.key;
  const isFromEnv = !!env.url;

  return { url, key, isConfigured: !!(url && key), isFromEnv };
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  const { url, key, isConfigured } = getSupabaseConfig();
  
  if (!isConfigured) return null;
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(url!, key!);
  }
  return supabaseInstance;
};

// For backward compatibility and immediate use
const { url: initialUrl, key: initialKey } = getSupabaseConfig();
export const supabase = createClient(
  initialUrl || 'https://placeholder.supabase.co', 
  initialKey || 'placeholder'
);

export const isSupabaseConfigured = !!(initialUrl && initialKey);

export const updateSupabaseLocalConfig = (url: string, key: string) => {
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  window.location.reload(); // Reload to re-initialize client
};
