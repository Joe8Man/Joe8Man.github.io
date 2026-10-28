create table public.xianxia_cloud_saves (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 250000),
 revision bigint not null default 1 check (revision > 0),
 updated_at timestamptz not null default now()
);
alter table public.xianxia_cloud_saves enable row level security;
revoke all on public.xianxia_cloud_saves from anon, authenticated;
grant select, insert, update, delete on public.xianxia_cloud_saves to authenticated;
create policy own_save_read on public.xianxia_cloud_saves for select to authenticated using ((select auth.uid()) = user_id);
create policy own_save_create on public.xianxia_cloud_saves for insert to authenticated with check ((select auth.uid()) = user_id);
create policy own_save_update on public.xianxia_cloud_saves for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_save_delete on public.xianxia_cloud_saves for delete to authenticated using ((select auth.uid()) = user_id);
comment on table public.xianxia_cloud_saves is 'Private single-player backups; client saves are not authoritative multiplayer rankings or rewards.';
create table public.xianxia_profiles(
 user_id uuid primary key references auth.users(id) on delete cascade,
 name text not null check(char_length(name) between 1 and 12),
 realm_label text not null check(char_length(realm_label) between 1 and 50),
 stance text not null check(stance in ('steady','assault','focus')),
 updated_at timestamptz not null default now()
);
alter table public.xianxia_profiles enable row level security;
revoke all on public.xianxia_profiles from anon, authenticated;
grant select,insert,update,delete on public.xianxia_profiles to authenticated;
create policy profiles_read on public.xianxia_profiles for select to authenticated using (true);
create policy profiles_insert on public.xianxia_profiles for insert to authenticated with check((select auth.uid())=user_id);
create policy profiles_update on public.xianxia_profiles for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy profiles_delete on public.xianxia_profiles for delete to authenticated using((select auth.uid())=user_id);
create function public.xianxia_spar(opponent uuid) returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare a public.xianxia_profiles; b public.xianxia_profiles;
 ah int:=100; bh int:=100; ad int; bd int; r int; history jsonb:='[]'; advantage int:=0;
begin
 if auth.uid() is null or opponent=auth.uid() then raise exception '請選擇其他道友'; end if;
 select * into a from public.xianxia_profiles where user_id=auth.uid();
 if not found then raise exception '請先公開自己的道友名帖'; end if;
 select * into b from public.xianxia_profiles where user_id=opponent;
 if not found then raise exception '對方已收回名帖，請重新整理'; end if;
 if (a.stance,b.stance) in (('steady','assault'),('assault','focus'),('focus','steady')) then advantage:=2;
 elsif a.stance<>b.stance then advantage:=-2; end if;
 for r in 1..12 loop
  ad:=greatest(1,14+floor(random()*7)::int+advantage);
  bd:=greatest(1,14+floor(random()*7)::int-advantage);
  ah:=greatest(0,ah-bd); bh:=greatest(0,bh-ad);
  history:=history||jsonb_build_array(jsonb_build_object('round',r,'attack',ad,'received',bd,'selfHP',ah,'opponentHP',bh));
  exit when ah=0 or bh=0;
 end loop;
 return jsonb_build_object('selfName',a.name,'opponentName',b.name,'selfStance',a.stance,'opponentStance',b.stance,
  'result',case when ah=bh then 'draw' when ah>bh then 'win' else 'loss' end,'rounds',history);
end $$;
revoke all on function public.xianxia_spar(uuid) from public,anon;
grant execute on function public.xianxia_spar(uuid) to authenticated;
comment on function public.xianxia_spar(uuid) is 'Equal-stat unranked asynchronous practice. No cultivation resources or ranked rewards. Published realm is self-reported display only.';

