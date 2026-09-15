import { createClient } from '@insforge/sdk';

const supabaseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://ccgv7qnz.ap-southeast.insforge.app';
const supabaseAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'ik_14797639230450fd54b0a27a44a3517b';

export const insforge = createClient({
  baseUrl: supabaseUrl,
  anonKey: supabaseAnonKey
});
