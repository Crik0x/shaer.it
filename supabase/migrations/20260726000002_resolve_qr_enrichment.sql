-- Migrazione M1 §3 (Roadmap) — arricchimento del logging di scansione.
-- Estende resolve_qr per popolare os/lang/referer/visitor_hash (colonne aggiunte
-- da 20260726000001) oltre a geo (country/city, dagli header Vercel nella route).
-- ADDITIVA sul comportamento: i vecchi campi restano, i nuovi sono opzionali.
--
-- Principi: regola 7 (il redirect non si rompe: log best-effort), L-001 (la
-- whitelist anon resta {resolve_qr, anonymize_ip} — match per NOME in grants.test).

-- Il vecchio overload a 6 argomenti va rimosso: altrimenti convive col nuovo e
-- una chiamata a 6 arg diventa ambigua ("function is not unique").
drop function if exists public.resolve_qr(text, text, text, text, text, text);

create or replace function public.resolve_qr(
  p_short_code   text,
  p_device       text default null,
  p_browser      text default null,
  p_country      text default null,
  p_city         text default null,
  p_ip           text default null,
  p_os           text default null,
  p_lang         text default null,
  p_referer      text default null,
  p_visitor_hash text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_qr public.qr_codes%rowtype;
begin
  select * into v_qr
  from public.qr_codes
  where short_code = p_short_code;

  if not found then
    return null;                 -- short_code inesistente: il chiamante fa 404
  end if;

  begin
    insert into public.qr_scans (
      qr_id, owner_id, device, browser, country, city, ip, os, lang, referer, visitor_hash
    )
    values (
      v_qr.id, v_qr.owner_id, p_device, p_browser, p_country, p_city,
      public.anonymize_ip(p_ip),   -- garanzia lato DB, non lato chiamante
      p_os, p_lang, p_referer, p_visitor_hash
    );
  exception when others then
    null;                        -- loggare non deve mai battere il risolvere
  end;

  return v_qr.target_url;
end;
$$;

-- Il redirect è anonimo: solo EXECUTE, nessun accesso diretto alle tabelle.
-- Whitelist anon INVARIATA (per nome): resolve_qr resta pubblico, il resto no.
revoke all     on function public.resolve_qr(text, text, text, text, text, text, text, text, text, text) from public;
grant  execute on function public.resolve_qr(text, text, text, text, text, text, text, text, text, text) to anon, authenticated;
