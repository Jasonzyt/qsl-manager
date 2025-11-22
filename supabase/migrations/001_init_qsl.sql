-- QSL card styles (style id + style name)
create table if not exists public.qsl_card_styles (
  id bigint generated always as identity primary key,
  style_name text not null,
  created_at timestamptz not null default now()
);

-- QSL cards with card number, style id, recipient, timestamps
create table if not exists public.qsl_cards (
  id bigint generated always as identity primary key,
  card_number integer not null unique,
  style_id bigint not null references public.qsl_card_styles(id) on delete restrict,
  to_radio text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Keep updated_at in sync on updates
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_qsl_cards_updated_at on public.qsl_cards;
create trigger set_qsl_cards_updated_at
before update on public.qsl_cards
for each row
execute procedure public.set_updated_at();

comment on table public.qsl_card_styles is 'Lookup table for QSL card styles';
comment on table public.qsl_cards is 'QSL cards issued to recipients with style mapping';
