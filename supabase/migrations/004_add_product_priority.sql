alter table public.products
add column if not exists priority integer;

comment on column public.products.priority is
  'Lower numbers are shown first in the public product listing.';
