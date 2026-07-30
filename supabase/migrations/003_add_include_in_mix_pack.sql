alter table public.products
add column if not exists include_in_mix_pack boolean not null default false;

comment on column public.products.include_in_mix_pack is
  'When true, this product is shown in the ready-to-cook vegetable mix pack builder.';
