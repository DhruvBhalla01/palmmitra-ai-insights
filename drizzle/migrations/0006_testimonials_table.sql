create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quote text not null,
  rating smallint not null default 5 check (rating between 1 and 5),
  source text not null default 'report' check (source in ('report','palmmatch')),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

grant select on public.testimonials to anon;
grant select, insert on public.testimonials to authenticated;
grant all on public.testimonials to service_role;

alter table public.testimonials enable row level security;

create policy "public reads approved testimonials"
  on public.testimonials for select to anon, authenticated
  using (approved = true);

create policy "anyone can submit a testimonial"
  on public.testimonials for insert to anon, authenticated
  with check (approved = false);

create policy "admins manage testimonials"
  on public.testimonials for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));