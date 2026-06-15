import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

// Only use mock fetch if we are actually using the mock URL
const options = supabaseUrl === 'https://mock.supabase.co' ? {
  global: { 
    fetch: async (url: string, options: any) => {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
} : {};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options as any);
