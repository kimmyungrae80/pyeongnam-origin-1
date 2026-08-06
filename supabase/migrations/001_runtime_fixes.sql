-- 기존 평남 오리진 DB에 적용할 무중단 보정 마이그레이션

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default false;

drop policy if exists "본인 프로필 생성 가능" on public.profiles;
create policy "본인 프로필 생성 가능" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "로그인 유저 제출 가능" on public.submissions;
create policy "로그인 유저 제출 가능" on public.submissions
  for insert with check (auth.uid() = user_id);

drop policy if exists "본인 아카이브 생성" on public.archive_items;

create or replace function public.approve_submission(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  award_points int;
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception '관리자 권한이 필요합니다';
  end if;

  select s.user_id, coalesce(m.points, 100)
    into target_user_id, award_points
  from submissions s
  left join missions m on m.id = s.mission_id
  where s.id = p_submission_id and s.status <> 'approved'
  for update of s;

  if target_user_id is null then
    raise exception '승인 가능한 제출물을 찾을 수 없습니다';
  end if;

  update submissions
  set status = 'approved', points_earned = award_points, updated_at = now()
  where id = p_submission_id;

  update profiles
  set points = coalesce(points, 0) + award_points, updated_at = now()
  where id = target_user_id;

  insert into archive_items (
    user_id, family_id, title, description, content_type, file_urls,
    region_tag, is_public, submission_id
  )
  select
    s.user_id, p.family_id, coalesce(s.title, '제목 없음'), s.content,
    s.content_type, s.file_urls, p.origin_region, s.is_public, s.id
  from submissions s
  join profiles p on p.id = s.user_id
  where s.id = p_submission_id
    and (s.content is not null or cardinality(s.file_urls) > 0)
    and not exists (
      select 1 from archive_items a where a.submission_id = s.id
    );

  insert into user_badges (user_id, badge_id)
  select target_user_id, b.id
  from badges b
  where b.condition_type = 'mission_count'
    and b.condition_value = 1
    and (select count(*) from submissions where user_id = target_user_id and status = 'approved') = 1
  on conflict (user_id, badge_id) do nothing;
end;
$$;

create or replace function public.reject_submission(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and is_admin = true) then
    raise exception '관리자 권한이 필요합니다';
  end if;

  update submissions
  set status = 'rejected', updated_at = now()
  where id = p_submission_id and status <> 'approved';

  if not found then
    raise exception '반려 가능한 제출물을 찾을 수 없습니다';
  end if;
end;
$$;

revoke all on function public.increment_points(uuid, int) from public, anon, authenticated;
revoke all on function public.approve_submission(uuid) from public, anon;
revoke all on function public.reject_submission(uuid) from public, anon;
grant execute on function public.approve_submission(uuid) to authenticated;
grant execute on function public.reject_submission(uuid) to authenticated;

insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "로그인 유저 업로드 가능" on storage.objects;
create policy "로그인 유저 업로드 가능" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "공개 파일 조회 가능" on storage.objects;
create policy "공개 파일 조회 가능" on storage.objects
  for select to public using (bucket_id = 'submissions');

drop policy if exists "본인 파일 삭제 가능" on storage.objects;
create policy "본인 파일 삭제 가능" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'submissions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
