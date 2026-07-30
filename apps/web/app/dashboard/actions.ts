"use server";

import { revalidatePath } from "next/cache";

import { serverSupabase } from "@/lib/supabase-server";
import { isValidTimeZone } from "@/lib/timezone";

// Salva il fuso del browser sul profilo, ma SOLO se è ancora il default 'UTC':
// non si sovrascrive una scelta già fatta dall'utente. Raggiungibile via POST →
// l'auth si verifica QUI dentro, owner_id dalla sessione (mai dal client). Il
// fuso arriva dal browser (Intl): input non fidato, si valida contro Intl prima
// di scriverlo. Setta anche updated_at (chiude il debito del blocco A).
export async function saveTimezone(timeZone: string): Promise<void> {
  if (timeZone === "UTC" || !isValidTimeZone(timeZone)) return;

  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ timezone: timeZone, updated_at: new Date().toISOString() })
    .eq("owner_id", user.id)
    .eq("timezone", "UTC"); // solo se ancora il default: rispetta una scelta esplicita

  revalidatePath("/dashboard");
}
