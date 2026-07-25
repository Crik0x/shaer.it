-- T-007 · Fixture di sviluppo — versionata, così i QR/scansioni di prova non si
-- ri-derivano a ogni sessione. (PATTERN riga 14: la FK su auth.users blocca
-- l'insert dei QR in un ambiente vergine.)
--
-- PREREQUISITO — l'utente-dev NON si crea qui.
--   Una password reale in un file versionato è un segreto in git (regola 6): il
--   seed si applica al progetto Supabase CONDIVISO, non a un'istanza effimera.
--   Quindi l'utente-dev `dev@shaer.it` si crea UNA VOLTA fuori da git — signup
--   dall'app oppure Supabase → Auth → Users → Add user — con la password scelta
--   lì, mai scritta nel repo. Questo seed lo CERCA per email e vi aggancia i dati.
--   Se l'utente non esiste, gli insert sotto selezionano zero righe: no-op sicuro.
--
-- COME si applica: dal SQL editor di Supabase (contesto privilegiato) o via
--   `supabase db reset`. NON gira con la anon key.
-- È IDEMPOTENTE: ON CONFLICT sui QR; scansioni inserite solo se il QR non ne ha
--   ancora (append-only, regola d'oro 9: mai un delete).

-- ============================================================================
-- 1 · QR di prova dell'utente-dev (owner risolto per email → robusto)
-- ============================================================================
with dev as (
  select id from auth.users where email = 'dev@shaer.it' limit 1
)
insert into public.qr_codes (owner_id, name, target_url, short_code)
select d.id, v.name, v.target_url, v.short_code
from dev d
cross join (values
  ('Dev — sito',   'https://shaer.it',              'devsite1'),
  ('Dev — docs',   'https://shaer.it/docs',         'devdocs1'),
  ('Dev — vuoto',  'https://esempio.com/nessuna',   'devnone1')
) as v(name, target_url, short_code)
on conflict (short_code) do nothing;

-- ============================================================================
-- 2 · Scansioni di prova su 'devsite1' — timeline non vuota su più giorni/ore
-- ============================================================================
-- Append-only (regola d'oro 9): si inseriscono SOLO se il QR non ha già
-- scansioni. Nessun delete: ri-eseguire il seed non duplica e non cancella.
with qr as (
  select id, owner_id from public.qr_codes where short_code = 'devsite1'
)
insert into public.qr_scans (qr_id, owner_id, created_at, device, browser, country, city, ip)
select qr.id, qr.owner_id, now() - (v.ago)::interval, v.device, v.browser, 'IT', v.city,
       public.anonymize_ip(v.ip)
from qr
cross join (values
  ('2 days 3 hours', 'mobile',  'Chrome',  'Milano',  '203.0.113.42'),
  ('2 days 1 hour',  'desktop', 'Firefox', 'Roma',    '198.51.100.7'),
  ('1 day 5 hours',  'mobile',  'Safari',  'Torino',  '203.0.113.99'),
  ('1 day 2 hours',  'desktop', 'Chrome',  'Napoli',  '198.51.100.23'),
  ('3 hours',        'mobile',  'Chrome',  'Bologna', '203.0.113.5'),
  ('1 hour',         'desktop', 'Edge',    'Firenze', '198.51.100.88')
) as v(ago, device, browser, city, ip)
where not exists (select 1 from public.qr_scans s where s.qr_id = qr.id);
