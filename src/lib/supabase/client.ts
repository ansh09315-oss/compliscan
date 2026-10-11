import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for Client Components.
 * Configured with @supabase/ssr to store session tokens in cookies
 * instead of browser localStorage, preventing client-side token exposure to XSS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  );
}
