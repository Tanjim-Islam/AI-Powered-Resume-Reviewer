const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  };
}

export function isSupabaseConfigured() {
  return getSupabasePublicConfig() !== null;
}
