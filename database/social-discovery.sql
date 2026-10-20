-- Social posts are discovery evidence, not automatically verified event records.
create table if not exists public.pc_social_posts (
 platform text not null check(platform='x'),post_id text not null,permalink text not null,
 caption text not null,posted_at timestamptz,media_urls jsonb not null default '[]',
 outgoing_urls jsonb not null default '[]',discovered_at timestamptz not null default now(),
 primary key(platform,post_id)
);
alter table public.pc_social_posts enable row level security;
revoke all on public.pc_social_posts from public,anon,authenticated;
grant all on public.pc_social_posts to service_role;
create index if not exists pc_social_posts_recent on public.pc_social_posts(discovered_at desc);
