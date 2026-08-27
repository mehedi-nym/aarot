create table if not exists public.delivery_areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_bn text not null,
  distance_km numeric(10,2) not null default 0,
  delivery_fee_override numeric(10,2),
  sort_order integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.delivery_areas is
  'Checkout delivery area list managed by admin.';

comment on column public.delivery_areas.distance_km is
  'Distance from the base delivery zone. Used with site_settings.base_delivery_charge and per_km_delivery_charge.';

comment on column public.delivery_areas.delivery_fee_override is
  'Optional fixed delivery fee for this area. Leave null to calculate by distance.';

comment on column public.site_settings.per_km_delivery_charge is
  'Admin-managed delivery charge added for each kilometer beyond the base delivery distance.';

drop trigger if exists set_delivery_areas_updated_at on public.delivery_areas;
create trigger set_delivery_areas_updated_at
before update on public.delivery_areas
for each row
execute function public.set_updated_at();

alter table public.delivery_areas enable row level security;

drop policy if exists "public read active delivery areas" on public.delivery_areas;
create policy "public read active delivery areas"
on public.delivery_areas for select
using (is_active = true);

drop policy if exists "admin manage delivery areas" on public.delivery_areas;
create policy "admin manage delivery areas"
on public.delivery_areas for all
using (public.is_admin())
with check (public.is_admin());

insert into public.delivery_areas (slug, name_bn, distance_km, sort_order, is_active)
values
  ('dhanmondi', 'ধানমন্ডি', 3, 1, true),
  ('mohammadpur', 'মোহাম্মদপুর', 5, 2, true),
  ('lalmatia', 'লালমাটিয়া', 4, 3, true),
  ('adabor', 'আদাবর', 6, 4, true),
  ('shyamoli', 'শ্যামলী', 6, 5, true)
on conflict (slug) do update
set
  name_bn = excluded.name_bn,
  distance_km = excluded.distance_km,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
