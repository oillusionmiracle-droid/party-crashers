-- Push credentials and subscriptions are server-only. Private VAPID key lives in Vault.
create table public.pc_push_config(id text primary key check(id='main'),public_key text not null,vault_secret_id uuid not null);
create table public.pc_push_subscriptions(endpoint_hash text primary key,clerk_user_id text not null,subscription jsonb not null,preferences jsonb not null,enabled boolean not null default true,consented_at timestamptz not null default now(),updated_at timestamptz not null default now());
create index pc_push_subscriptions_user on public.pc_push_subscriptions(clerk_user_id);
create table public.pc_push_jobs(id uuid primary key default gen_random_uuid(),endpoint_hash text not null references public.pc_push_subscriptions(endpoint_hash) on delete cascade,event_id text references public.pc_events(id) on delete cascade,kind text not null check(kind in ('new-event','test')),status text not null default 'pending' check(status in ('pending','sent','skipped','failed')),attempts int not null default 0,available_at timestamptz not null default now(),created_at timestamptz not null default now(),finished_at timestamptz,error_code text,unique(endpoint_hash,event_id));
create index pc_push_jobs_work on public.pc_push_jobs(available_at) where status='pending';
alter table public.pc_push_config enable row level security;
alter table public.pc_push_subscriptions enable row level security;
alter table public.pc_push_jobs enable row level security;
revoke all on public.pc_push_config,public.pc_push_subscriptions,public.pc_push_jobs from public,anon,authenticated;
grant all on public.pc_push_config,public.pc_push_subscriptions,public.pc_push_jobs to service_role;
-- SECURITY DEFINER is restricted to service_role solely to access the Vault-owned schema.
create function public.pc_initialize_push_keys(pub text,priv text) returns boolean language plpgsql security definer set search_path='' as $$
declare secret_id uuid;
begin
 perform pg_advisory_xact_lock(70102026);
 if exists(select 1 from public.pc_push_config where id='main') then return true;end if;
 if length(pub)<>87 or length(priv)<>43 then raise exception 'Invalid key material';end if;
 select vault.create_secret(priv,'pc_web_push_vapid_private') into secret_id;
 insert into public.pc_push_config values('main',pub,secret_id);return true;
end $$;
create function public.pc_read_push_keys() returns jsonb language sql security definer set search_path='' as $$
 select jsonb_build_object('publicKey',c.public_key,'privateKey',v.decrypted_secret) from public.pc_push_config c join vault.decrypted_secrets v on v.id=c.vault_secret_id where c.id='main'
$$;
revoke all on function public.pc_initialize_push_keys(text,text),public.pc_read_push_keys() from public,anon,authenticated;
grant execute on function public.pc_initialize_push_keys(text,text),public.pc_read_push_keys() to service_role;
-- Queue only newly published events; edits and enabling alerts do not send the existing catalogue.
create function public.pc_queue_event_push() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.status='published' and (tg_op='INSERT' or old.status is distinct from 'published') and (new.record->>'endDate')::timestamptz>now() then
  insert into public.pc_push_jobs(endpoint_hash,event_id,kind)
  select endpoint_hash,new.id,'new-event' from public.pc_push_subscriptions where enabled and consented_at<=now()
  on conflict(endpoint_hash,event_id) do nothing;
 end if;return new;
end $$;
revoke all on function public.pc_queue_event_push() from public,anon,authenticated;
create trigger pc_new_event_push after insert or update of status on public.pc_events for each row execute function public.pc_queue_event_push();
insert into public.pc_collector_config(id,token_hash) select 'push-delivery',token_hash from public.pc_collector_config where id='techfeast' on conflict(id) do nothing;
select cron.schedule('pc-push-delivery','* * * * *',$job$
select net.http_post(url:='https://aqwnluhpnqsrofmvtngp.supabase.co/functions/v1/pc-push',headers:=jsonb_build_object('Content-Type','application/json','x-pc-collector-token',(select decrypted_secret from vault.decrypted_secrets where name='pc_collector_token')),body:='{}'::jsonb,timeout_milliseconds:=55000);
$job$);
