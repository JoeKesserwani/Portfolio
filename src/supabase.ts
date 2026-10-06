import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}

export function getSupabaseClient(): SupabaseClient {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    throw new Error("Supabase is not configured. Follow the setup instructions in README.md.");
  }
  client ??= createClient(url, anonKey);
  return client;
}

export function isAdminEmail(email: string | null | undefined): boolean {
  const configuredEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(configuredEmail && email?.toLowerCase() === configuredEmail);
}
