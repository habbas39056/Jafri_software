import { createClient } from '@supabase/supabase-js';

const mockFetch = async (url: string, options: any) => {
  return new Response(JSON.stringify([]), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

export const supabase = createClient('https://mock.supabase.co', 'mock-key', {
  global: { fetch: mockFetch as any }
});
