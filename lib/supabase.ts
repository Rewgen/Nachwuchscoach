import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Zentraler Supabase-Client. Bewusst tolerant gegenüber fehlender
// Konfiguration (z. B. beim Build oder ohne .env.local): dann ist der Client
// null und die App zeigt einen Einrichtungs-Hinweis statt abzustürzen.

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseKonfiguriert = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = supabaseKonfiguriert
  ? createClient(url!, anonKey!)
  : null;

/** Öffentliche URL einer Datei im Medien-Bucket. */
export function storageUrl(pfad: string): string {
  if (!supabase) return "";
  return supabase.storage.from("medien").getPublicUrl(pfad).data.publicUrl;
}
