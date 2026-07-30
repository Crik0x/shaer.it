"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { serverSupabase } from "@/lib/supabase-server";
import { generateShortCode } from "@/lib/short-code";

export type CreateQrState = { error?: string };

// Server Action: raggiungibile via POST diretto, quindi l'auth si verifica QUI
// dentro (doc Next 16 mutating-data). owner_id è preso dalla sessione, mai dal
// client. short_code generato lato app con retry sul vincolo unique (23505).
export async function createQr(
  _prev: CreateQrState,
  formData: FormData,
): Promise<CreateQrState> {
  const supabase = await serverSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non autenticato." };

  const targetUrl = String(formData.get("target_url") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!/^https?:\/\/.+/i.test(targetUrl)) {
    return { error: "Inserisci un URL valido (http:// o https://)." };
  }

  let shortCode = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    shortCode = generateShortCode();
    const { error } = await supabase.from("qr_codes").insert({
      owner_id: user.id,
      target_url: targetUrl,
      name,
      short_code: shortCode,
    });
    if (!error) break;
    // 23505 = unique_violation: collisione di short_code, si riprova.
    if (error.code !== "23505") return { error: error.message };
    if (attempt === 4) {
      return { error: "Generazione dello short_code fallita, riprova." };
    }
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/qr/${shortCode}`);
}
