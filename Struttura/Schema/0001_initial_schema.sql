-- =====================================================================
-- SHAER.IT — SCHEMA DATABASE MVP
-- Migration: 0001_initial_schema.sql
-- Target: PostgreSQL 15+ via Supabase
-- Riferimento: Master Reference v1.1 (architettura) + Backlog v1.1
-- Regola non negoziabile: TUTTA la nomenclatura DB è in INGLESE.
-- I commenti sono in italiano solo per leggibilità interna.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid(), gen_random_bytes()

-- ---------------------------------------------------------------------
-- 1. ENUM TYPES (valori canonici — fonte di verità per il codice)
-- ---------------------------------------------------------------------

-- I 4 attori del sistema (Master Reference §2)
create type user_role as enum ('BUYER', 'SELLER', 'PRODUCER', 'ADMIN');

-- Stato approvazione documentale (Seller / Producer / Product)
create type approval_status as enum ('PENDING', 'APPROVED', 'REJECTED');

-- Stati del Transaction ID (Master Reference §16 / Backlog Mod 14)
create type txn_status as enum (
  'OPEN',         -- richiesta pubblicata, suggerimenti in raccolta
  'SUGGESTED',    -- almeno 1 suggerimento ricevuto
  'IN_PROGRESS',  -- buyer si è mosso verso il seller
  'COMPLETED',    -- acquisto confermato (qualsiasi metodo)
  'EXPIRED',      -- scadenza raggiunta senza acquisto
  'ABANDONED'     -- buyer ha chiuso senza acquistare
);

-- Metodi di pagamento (registrati, non processati — tranne credits)
create type payment_method as enum ('cash', 'card', 'credits', 'mixed');

-- Scope crediti: separati per profilo ma trasferibili (Master Reference §2)
create type credit_scope as enum ('buyer', 'seller');

-- Direzione movimento ledger
create type ledger_direction as enum ('CREDIT', 'DEBIT');

-- Livelli di rank (soglie numeriche -> platform_config, C-pending dove serve)
create type rank_level as enum ('new', 'trusted', 'verified', 'top', 'elite');

-- ---------------------------------------------------------------------
-- 2. FUNZIONI HELPER
-- ---------------------------------------------------------------------

-- Genera un codice alfanumerico maiuscolo senza caratteri ambigui (0/O/1/I).
create or replace function gen_short_code(len int default 6)
returns text
language plpgsql
as $$
declare
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result text := '';
  i int;
begin
  for i in 1..len loop
    result := result || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
  end loop;
  return result;
end;
$$;

-- Trigger generico per mantenere updated_at.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. PROFILI E IDENTITÀ
--    auth.users (gestito da Supabase Auth) è il layer di autenticazione.
--    profiles estende ogni utente con ruolo/i e ID pubblico.
-- ---------------------------------------------------------------------

create table profiles (
  user_id        uuid primary key references auth.users(id) on delete cascade,
  display_name   text,
  email          text,
  phone          text,                          -- verifica telefono = Fase 2
  -- Ruoli attivi dell'utente. Un utente può essere BUYER+SELLER (dual-mode).
  roles          user_role[] not null default array['BUYER']::user_role[],
  -- ID pubblico universale (Master Reference §4). Formato SHR-<R>-XXXXXX.
  public_id      text unique not null default ('SHR-U-' || gen_short_code(6)),
  -- Referral: chi ha invitato questo utente (un solo livello — no MLM).
  referred_by    uuid references profiles(user_id),
  referral_code  text unique not null default gen_short_code(8),
  -- Consensi GDPR raccolti al signup (struttura completa -> C6).
  consents       jsonb not null default '{}'::jsonb,
  locale         text not null default 'it',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index idx_profiles_referred_by on profiles(referred_by);
create index idx_profiles_referral_code on profiles(referral_code);

create trigger trg_profiles_updated
  before update on profiles
  for each row execute function set_updated_at();

-- Profilo esteso BUYER (Backlog 1.10)
create table buyer_profiles (
  user_id        uuid primary key references profiles(user_id) on delete cascade,
  public_id      text unique not null default ('SHR-B-' || gen_short_code(6)),
  bio            text,
  interests      text[] not null default '{}',   -- categorie preferite
  is_anonymous_default boolean not null default false, -- anonimato nel payload QR
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_buyer_profiles_updated
  before update on buyer_profiles
  for each row execute function set_updated_at();

-- Profilo SELLER (Master Reference §4.2) — onboarding verificato
create table seller_profiles (
  user_id          uuid primary key references profiles(user_id) on delete cascade,
  public_id        text unique not null default ('SHR-S-' || gen_short_code(6)),
  business_name    text not null,
  vat_number       text not null,                -- P.IVA obbligatoria
  legal_rep_name   text not null,                -- legale rappresentante
  category         text,
  address          text,
  zone             text,
  city             text,
  region           text,
  -- Documenti onboarding (path su Supabase Storage)
  documents        jsonb not null default '{}'::jsonb,
  approval_status  approval_status not null default 'PENDING',
  approved_by      uuid references profiles(user_id),
  approved_at      timestamptz,
  rejection_note   text,
  -- Silent launch: iscritto ora, pagamento differito al lancio (C4)
  is_silent_signup boolean not null default true,
  subscription_active boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index idx_seller_approval on seller_profiles(approval_status);
create trigger trg_seller_profiles_updated
  before update on seller_profiles
  for each row execute function set_updated_at();

-- Profilo PRODUCER (Master Reference §4.3) — include liberi professionisti
create table producer_profiles (
  user_id          uuid primary key references profiles(user_id) on delete cascade,
  public_id        text unique not null default ('SHR-P-' || gen_short_code(6)),
  business_name    text not null,
  vat_number       text not null,
  legal_rep_name   text not null,
  -- 'goods' = prodotto fisico, 'service' = libero professionista (C2)
  producer_type    text not null default 'goods',
  documents        jsonb not null default '{}'::jsonb,
  approval_status  approval_status not null default 'PENDING',
  approved_by      uuid references profiles(user_id),
  approved_at      timestamptz,
  rejection_note   text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index idx_producer_approval on producer_profiles(approval_status);
create trigger trg_producer_profiles_updated
  before update on producer_profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 4. REFERRAL (Master Reference §5 / Backlog Mod 7) — un solo livello
-- ---------------------------------------------------------------------

create table referrals (
  id              bigserial primary key,
  referrer_id     uuid not null references profiles(user_id),
  referred_id     uuid not null references profiles(user_id),
  referral_code   text not null,
  -- soglia €150 di acquisti verificati per sbloccare reward buyer->buyer
  qualified       boolean not null default false,  -- raggiunta soglia?
  qualified_at    timestamptz,
  reward_granted  boolean not null default false,
  created_at      timestamptz not null default now(),
  unique (referred_id)   -- un utente è "referred" da un solo referrer (no MLM)
);
create index idx_referrals_referrer on referrals(referrer_id);

-- ---------------------------------------------------------------------
-- 5. PRODOTTI E PRODUCT ID (Master Reference §9 / Backlog Mod 5)
-- ---------------------------------------------------------------------

create table products (
  id               bigserial primary key,
  product_id       text unique not null default ('PRD-' || gen_short_code(6)),
  producer_id      uuid not null references producer_profiles(user_id),
  name             text not null,
  description      text,
  category         text,
  -- 'goods' o 'service' (scheda servizio differente -> C2)
  product_type     text not null default 'goods',
  attributes       jsonb not null default '{}'::jsonb, -- colore, materiale, ecc.
  base_price       numeric(10,2),
  -- fee per vendita impostata dal Producer (distribuita automaticamente)
  producer_fee_pct numeric(5,2) not null default 0,
  -- controllo geografico: global / national / regional / local
  geo_scope        text not null default 'national',
  approval_status  approval_status not null default 'PENDING',
  is_archived      boolean not null default false,   -- dati storici mantenuti
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index idx_products_producer on products(producer_id);
create index idx_products_status on products(approval_status);
create index idx_products_category on products(category);
create trigger trg_products_updated
  before update on products
  for each row execute function set_updated_at();

-- Log approvazioni prodotto (Backlog 5.2)
create table product_approvals (
  id              bigserial primary key,
  product_ref     bigint not null references products(id),
  admin_id        uuid not null references profiles(user_id),
  decision        approval_status not null,        -- APPROVED / REJECTED
  note            text,
  created_at      timestamptz not null default now()
);

-- Catalogo Seller: quali prodotti approvati un Seller vende (Backlog 5.3)
create table seller_products (
  id              bigserial primary key,
  seller_id       uuid not null references seller_profiles(user_id),
  product_ref     bigint not null references products(id),
  custom_price    numeric(10,2),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (seller_id, product_ref)
);

-- ---------------------------------------------------------------------
-- 6. QR CODE (Backlog Mod 9) — QR univoco per Seller
-- ---------------------------------------------------------------------

create table qr_codes (
  id              bigserial primary key,
  seller_id       uuid not null references seller_profiles(user_id),
  -- token segreto codificato nel QR fisico (sticker vetrina)
  token           text unique not null default encode(gen_random_bytes(16), 'hex'),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (seller_id)
);

-- ---------------------------------------------------------------------
-- 7. ASK HELP (Master Reference §8 / Backlog Mod 4)
--    Una richiesta genera SEMPRE un TXN (vedi §8 transactions).
-- ---------------------------------------------------------------------

create table help_requests (
  id              bigserial primary key,
  buyer_id        uuid not null references profiles(user_id),
  channel         text not null default 'offline',  -- 'online' / 'offline'
  category        text,
  details         jsonb not null default '{}'::jsonb, -- colore, materiale, tipo servizio
  budget          numeric(10,2),
  -- luogo desiderato (se offline)
  place_name      text,
  address         text,
  zone            text,
  city            text,
  region          text,
  deadline        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index idx_help_requests_buyer on help_requests(buyer_id);
create index idx_help_requests_category on help_requests(category);
create trigger trg_help_requests_updated
  before update on help_requests
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 8. TRANSACTION ID SYSTEM (Master Reference §16 / Backlog Mod 14)
--    Cuore della piattaforma. Ogni TXN accompagna l'intera interazione.
-- ---------------------------------------------------------------------

create table transactions (
  id               bigserial primary key,
  txn_id           text unique not null default ('TXN-' || gen_short_code(6)),
  help_request_id  bigint references help_requests(id),
  buyer_id         uuid not null references profiles(user_id),
  seller_id        uuid references seller_profiles(user_id),  -- popolato alla scelta
  product_id       text,                                      -- PRD-XXXXXX se applicabile
  status           txn_status not null default 'OPEN',
  budget_buyer     numeric(10,2),
  value_suggested  numeric(10,2),
  value_final      numeric(10,2),
  payment_method   payment_method,
  credits_used     int not null default 0,
  zone             text,
  city             text,
  region           text,
  expires_at       timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index idx_txn_buyer on transactions(buyer_id);
create index idx_txn_seller on transactions(seller_id);
create index idx_txn_status on transactions(status);
create trigger trg_transactions_updated
  before update on transactions
  for each row execute function set_updated_at();

-- Suggerimenti legati a un TXN (Master Reference §16)
create table txn_suggestions (
  id                bigserial primary key,
  txn_id            text not null references transactions(txn_id),
  shaerer_id        uuid not null references profiles(user_id),
  seller_suggested  uuid references seller_profiles(user_id),
  product_suggested text,
  value_proposed    numeric(10,2),
  chosen            boolean not null default false,  -- scelto dal buyer?
  credits_earned    int not null default 0,
  created_at        timestamptz not null default now()
);
create index idx_txn_suggestions_txn on txn_suggestions(txn_id);
create index idx_txn_suggestions_shaerer on txn_suggestions(shaerer_id);

-- Push Journey Log (Master Reference §17 / Backlog Mod 16)
create table push_journey_log (
  id              bigserial primary key,
  txn_id          text not null references transactions(txn_id),
  actor_id        uuid not null references profiles(user_id),
  actor_role      text not null,            -- 'buyer' / 'seller' / 'shaerer'
  step            text not null,            -- B1, B2, S1, SH1, ...
  pushed_at       timestamptz not null default now(),
  answered_at     timestamptz,
  answer          jsonb,
  credits_awarded int not null default 0
);
create index idx_push_journey_txn on push_journey_log(txn_id);
create index idx_push_journey_actor on push_journey_log(actor_id);

-- Rank tripartito (Master Reference §16 / Backlog Mod 15)
create table user_ranks (
  user_id        uuid primary key references profiles(user_id) on delete cascade,
  buyer_score    numeric(5,2) not null default 0,
  shaerer_score  numeric(5,2) not null default 0,
  seller_score   numeric(5,2) not null default 0,
  buyer_level    rank_level not null default 'new',
  shaerer_level  rank_level not null default 'new',
  seller_level   rank_level not null default 'new',
  txn_completed  int not null default 0,
  txn_total      int not null default 0,
  txn_open       int not null default 0,    -- TXN correntemente OPEN/SUGGESTED
  is_unreliable  boolean not null default false,  -- soglia in platform_config (C9)
  updated_at     timestamptz not null default now()
);
create trigger trg_user_ranks_updated
  before update on user_ranks
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 9. CREDIT LEDGER (Master Reference §6 / Backlog 6.1)
--    Log IMMUTABILE append-only. Mai UPDATE, mai DELETE. (vedi §15 guard)
-- ---------------------------------------------------------------------

create table credits_ledger (
  id              bigserial primary key,
  user_id         uuid not null references profiles(user_id),
  scope           credit_scope not null default 'buyer', -- crediti separati per profilo
  direction       ledger_direction not null,
  amount          int not null check (amount > 0),       -- sempre positivo; direzione separata
  reason          text not null,   -- 'signup', 'question', 'suggestion', 'sale', 'review', 'referral', 'monthly', 'transfer', ...
  txn_id          text references transactions(txn_id),  -- se collegato a una transazione
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now()
);
create index idx_ledger_user on credits_ledger(user_id);
create index idx_ledger_scope on credits_ledger(user_id, scope);
create index idx_ledger_txn on credits_ledger(txn_id);

-- Saldo crediti corrente per utente e scope (vista derivata dal ledger)
create or replace view credit_balances as
select
  user_id,
  scope,
  coalesce(sum(case when direction = 'CREDIT' then amount else -amount end), 0) as balance
from credits_ledger
group by user_id, scope;

-- ---------------------------------------------------------------------
-- 10. WISHLIST E CROWDFUNDING (Master Reference §7 / Backlog Mod 3)
-- ---------------------------------------------------------------------

create table wishlists (
  id              bigserial primary key,
  buyer_id        uuid not null references profiles(user_id),
  title           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger trg_wishlists_updated
  before update on wishlists
  for each row execute function set_updated_at();

create table wishlist_items (
  id                 bigserial primary key,
  wishlist_id        bigint not null references wishlists(id) on delete cascade,
  product_id         text,                          -- PRD-XXXXXX
  preferred_seller_id uuid references seller_profiles(user_id), -- seller prescelto
  target_amount      numeric(10,2),
  collected_amount   numeric(10,2) not null default 0,
  -- copiato da una wishlist altrui? (genera punti pubblicità all'originale, C7)
  copied_from_item   bigint references wishlist_items(id),
  view_count         int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index idx_wishlist_items_wishlist on wishlist_items(wishlist_id);
create trigger trg_wishlist_items_updated
  before update on wishlist_items
  for each row execute function set_updated_at();

create table wishlist_contributions (
  id              bigserial primary key,
  wishlist_item_id bigint not null references wishlist_items(id),
  contributor_id  uuid not null references profiles(user_id),
  amount          numeric(10,2) not null check (amount >= 0.01 and amount <= 10000),
  stripe_payment_id text,
  -- revoca possibile solo entro N ore (platform_config: contribution_revoke_hours)
  revoked         boolean not null default false,
  revoked_at      timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_contributions_item on wishlist_contributions(wishlist_item_id);

-- ---------------------------------------------------------------------
-- 11. EVENTI (Master Reference §7 / Backlog 3.2, 3.7)
-- ---------------------------------------------------------------------

create table events (
  id              bigserial primary key,
  buyer_id        uuid not null references profiles(user_id),
  wishlist_item_id bigint references wishlist_items(id),
  event_type      text not null,   -- birthday, wedding, newborn, party, gift, charity
  deadline        date,            -- appare nel feed amici 7 giorni prima
  created_at      timestamptz not null default now()
);
create index idx_events_buyer on events(buyer_id);

create table event_visibility (
  id              bigserial primary key,
  event_id        bigint not null references events(id) on delete cascade,
  viewer_id       uuid references profiles(user_id),  -- amico specifico
  visibility      text not null default 'friends',    -- 'friends' / 'public'
  is_hidden       boolean not null default false,      -- amico ha nascosto l'evento
  is_favorited    boolean not null default false,
  hidden_at       timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_event_visibility_event on event_visibility(event_id);

-- ---------------------------------------------------------------------
-- 12. RECENSIONI (Master Reference §12 / Backlog Mod 10, 17)
--     Solo da TXN COMPLETED. Gate applicato lato backend + check FK.
-- ---------------------------------------------------------------------

create table reviews (
  id              bigserial primary key,
  txn_id          text not null references transactions(txn_id),
  reviewer_id     uuid not null references profiles(user_id),
  reviewee_id     uuid not null references profiles(user_id),
  -- direzione: 'buyer_to_seller', 'seller_to_buyer', 'buyer_to_shaerer'
  direction       text not null,
  -- punteggi 1-10 sulle 5 dimensioni (chiavi diverse per direzione)
  scores          jsonb not null default '{}'::jsonb,
  comment         text,
  -- finestra modifica (C8) e finestra invio (C12) gestite lato applicativo
  edited_at       timestamptz,
  created_at      timestamptz not null default now(),
  -- una recensione per direzione per ogni TXN
  unique (txn_id, reviewer_id, direction)
);
create index idx_reviews_reviewee on reviews(reviewee_id);
create index idx_reviews_txn on reviews(txn_id);

-- ---------------------------------------------------------------------
-- 13. MISSIONI E GAMIFICATION (Project v1.3 §7 / Backlog Mod 6)
-- ---------------------------------------------------------------------

create table missions (
  id              bigserial primary key,
  code            text unique not null,        -- es. 'B1.1', 'S2.3'
  role            user_role not null,           -- BUYER / SELLER
  title           text not null,
  description     text,
  reward_credits  int not null default 0,
  reward_badge    text,
  sort_order      int not null default 0,
  is_active       boolean not null default true
);

create table mission_progress (
  id              bigserial primary key,
  user_id         uuid not null references profiles(user_id),
  mission_id      bigint not null references missions(id),
  completed       boolean not null default false,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique (user_id, mission_id)
);
create index idx_mission_progress_user on mission_progress(user_id);

-- ---------------------------------------------------------------------
-- 14. NOTIFICHE + ANALYTICS (Master Reference §5 / Backlog Mod 8)
-- ---------------------------------------------------------------------

create table notifications (
  id              bigserial primary key,
  user_id         uuid not null references profiles(user_id),
  type            text not null,   -- friend_birthday, contribution_received, suggestion_received, purchase_verified, ...
  payload         jsonb not null default '{}'::jsonb,
  fcm_message_id  text,
  read_at         timestamptz,
  created_at      timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id);

-- analytics_events: cuore del data layer (schema esatto da Master Reference §5)
create table analytics_events (
  id              bigserial primary key,
  event_type      text not null,
  -- valori: product_view, product_click, product_hide, product_favorite,
  -- product_copy_to_wishlist, wishlist_view, wishlist_contribute, wishlist_revoke,
  -- help_request_view, help_response_click, transaction_qr_scan, referral_click,
  -- referral_convert, review_left, mission_completed, profile_view, push_answer
  actor_user_id   uuid references profiles(user_id),
  target_user_id  uuid,
  product_id      text,
  seller_id       text,
  producer_id     text,
  txn_id          text,
  metadata        jsonb,
  location_region text,
  location_city   text,
  location_zone   text,
  session_id      text,
  platform        text,           -- 'web' / 'pwa'
  created_at      timestamptz not null default now()
);
create index idx_analytics_type on analytics_events(event_type);
create index idx_analytics_actor on analytics_events(actor_user_id);
create index idx_analytics_created on analytics_events(created_at);

-- ---------------------------------------------------------------------
-- 15. PLATFORM CONFIG (Backlog 11.6) — parametri di sistema
--     I conflitti aperti C8–C12 vivono qui come default configurabili.
-- ---------------------------------------------------------------------

create table platform_config (
  key              text primary key,
  value            jsonb not null,
  description      text,
  is_locked        boolean not null default false,  -- decisione bloccata da Nick
  pending_conflict text,                            -- es. 'C9' se ancora aperto
  updated_at       timestamptz not null default now()
);
create trigger trg_platform_config_updated
  before update on platform_config
  for each row execute function set_updated_at();

-- Seed parametri. is_locked=true => valore confermato. pending_conflict => in attesa.
insert into platform_config (key, value, description, is_locked, pending_conflict) values
  -- Crediti (Master Reference §6) — valori confermati
  ('credit_to_eur_rate',          '100',   '100 crediti = 1,00 EUR',                         true,  null),
  ('signup_credits',              '10',    'Crediti alla registrazione (Buyer/Shaerer)',     true,  null),
  ('question_credits',            '1',     'Crediti per domanda pubblicata',                 true,  null),
  ('suggestion_credits',          '5',     'Crediti per consiglio pubblicato',               true,  null),
  ('sale_credit_pct',             '10',    '% importo allo Shaerer su vendita verificata',   true,  null),
  ('review_credits',              '2',     'Crediti per recensione lasciata',                true,  null),
  ('referral_credits',            '20',    'Crediti per referral nuovo utente',              true,  null),
  ('seller_monthly_credits',      '100',   'Crediti mensili inclusi nel piano Seller',       true,  null),
  ('referral_purchase_threshold_eur', '150', 'Soglia acquisti per reward referral buyer',    true,  null),
  ('referral_purchase_reward_eur',    '25',  'Reward in EUR-crediti al raggiungimento soglia', true, null),
  -- Crowdfunding (Master Reference §7) — confermati
  ('crowdfund_min_eur',           '0.01',  'Contributo minimo',                              true,  null),
  ('crowdfund_max_eur',           '10000', 'Contributo massimo per transazione',             true,  null),
  ('contribution_revoke_hours',   '2',     'Finestra revoca contributo (ore)',               true,  null),
  -- Commissioni pubblicitarie (Master Reference §10) — confermati
  ('ad_budget_view_pct',          '25',    '% budget per view/click',                        true,  null),
  ('ad_budget_sale_pct',          '75',    '% budget pagato solo su vendita verificata',     true,  null),
  ('campaign_prepay_eur',         '10',    'Anticipo campagna pre-autorizzato',              true,  null),
  -- ⏳ CONFLITTI APERTI — default provvisori in attesa di approvazione Nick
  ('review_editable_hours',       '24',    'Recensione modificabile entro X ore (DEFAULT PROVVISORIO)', false, 'C8'),
  ('unreliable_open_txn_threshold','3',    'N TXN aperte oltre cui buyer = inaffidabile (DEFAULT PROVVISORIO)', false, 'C9'),
  ('max_daily_push',              '5',     'Max push giornalieri per utente (DEFAULT PROVVISORIO)', false, 'C10'),
  ('purchase_bonus_window_hours', '48',    'Bonus se acquisto entro N ore dalla richiesta (DEFAULT PROVVISORIO)', false, 'C11'),
  ('review_window_days',          '30',    'Giorni dopo TXN COMPLETED per lasciare recensione (DEFAULT PROVVISORIO)', false, 'C12');

-- ---------------------------------------------------------------------
-- 16. GUARD IMMUTABILITÀ — credits_ledger append-only
--     Blocca UPDATE e DELETE: il ledger è la verità finanziaria.
-- ---------------------------------------------------------------------

create or replace function prevent_ledger_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'credits_ledger is append-only: UPDATE/DELETE non consentiti';
end;
$$;

create trigger trg_ledger_no_update
  before update on credits_ledger
  for each row execute function prevent_ledger_mutation();

create trigger trg_ledger_no_delete
  before delete on credits_ledger
  for each row execute function prevent_ledger_mutation();

-- ---------------------------------------------------------------------
-- 17. ROW LEVEL SECURITY (baseline)
--     RLS abilitato sulle tabelle sensibili. Le policy complete (per ruolo)
--     sono un passo dedicato successivo: qui solo la base "owner can read".
-- ---------------------------------------------------------------------

alter table profiles            enable row level security;
alter table buyer_profiles      enable row level security;
alter table seller_profiles     enable row level security;
alter table producer_profiles   enable row level security;
alter table credits_ledger      enable row level security;
alter table transactions        enable row level security;
alter table wishlists           enable row level security;
alter table notifications       enable row level security;

-- Policy base: ognuno legge il proprio profilo.
create policy "own profile readable"
  on profiles for select
  using (auth.uid() = user_id);

create policy "own profile updatable"
  on profiles for update
  using (auth.uid() = user_id);

create policy "own ledger readable"
  on credits_ledger for select
  using (auth.uid() = user_id);

create policy "own notifications readable"
  on notifications for select
  using (auth.uid() = user_id);

-- NOTA: il backend Express usa la service_role key (bypassa RLS) per le
-- operazioni server-to-server (distribuzione crediti, cambio stato TXN, ecc.).
-- Le policy granulari per Seller/Producer/Admin si aggiungono in 0002_rls_policies.sql.

-- =====================================================================
-- FINE SCHEMA 0001
-- =====================================================================
