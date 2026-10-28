begin;
insert into auth.users(id) values ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
insert into public.xianxia_profiles(user_id,name,realm_label,stance) values ('00000000-0000-4000-8000-000000000001','甲','測試','steady');
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
insert into public.xianxia_profiles(user_id,name,realm_label,stance) values ('00000000-0000-4000-8000-000000000002','乙','測試','assault');
do $$ declare v jsonb; n int; begin
 v:=public.xianxia_spar('00000000-0000-4000-8000-000000000001');
 if v->>'selfName'<>'乙' or v->>'opponentName'<>'甲' or jsonb_array_length(v->'rounds')<1 or v->>'result' not in ('win','loss','draw') then raise exception 'invalid duel'; end if;
 update public.xianxia_profiles set stance='focus' where user_id='00000000-0000-4000-8000-000000000001';
 get diagnostics n=row_count;if n<>0 then raise exception 'cross owner profile update'; end if;
 begin perform public.xianxia_spar(auth.uid());raise exception 'self duel allowed';exception when raise_exception then if sqlerrm='self duel allowed' then raise;end if;end;
end $$;
delete from public.xianxia_profiles where user_id=auth.uid();
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
 begin perform public.xianxia_spar('00000000-0000-4000-8000-000000000002');raise exception 'withdrawn opponent allowed';
 exception when raise_exception then if sqlerrm='withdrawn opponent allowed' then raise;end if;end;
end $$;
reset role;set local role anon;
do $$ begin
 begin perform public.xianxia_spar('00000000-0000-4000-8000-000000000001');raise exception 'anonymous allowed';
 exception when insufficient_privilege then null;end;
end $$;
reset role;select 'PASS: asynchronous duel, owner protection, withdrawn opponent, self and anonymous rejection' as result;
rollback;
