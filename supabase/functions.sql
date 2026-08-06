-- =============================================
-- supabase/functions.sql
-- Supabase SQL Editor에서 실행하세요
-- =============================================

-- 포인트 증가 함수 (atomic 업데이트)
create or replace function increment_points(user_id uuid, amount int)
returns void as $$
begin
  update profiles
  set points = points + amount,
      updated_at = now()
  where id = user_id;
end;
$$ language plpgsql security definer;

revoke all on function increment_points(uuid, int) from public, anon, authenticated;

-- 관리자만 호출 가능한 원자적 승인 처리입니다. 클라이언트가 보낸 포인트나 사용자 ID를 신뢰하지 않습니다.
create or replace function approve_submission(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  award_points int;
begin
  if not exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ) then
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

create or replace function reject_submission(p_submission_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ) then
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

revoke all on function approve_submission(uuid) from public, anon;
revoke all on function reject_submission(uuid) from public, anon;
grant execute on function approve_submission(uuid) to authenticated;
grant execute on function reject_submission(uuid) to authenticated;

-- =============================================
-- 관리자 계정 설정 (가입 후 실행)
-- 아래 이메일을 실제 관리자 이메일로 바꾸세요
-- =============================================

-- update profiles
-- set is_admin = true
-- where id = (
--   select id from auth.users where email = '여기에_관리자_이메일'
-- );

-- =============================================
-- Storage 버킷 생성 (파일 업로드용)
-- Supabase 대시보드 → Storage → New bucket
-- 이름: submissions
-- Public: true
-- =============================================

-- Storage 정책 추가
insert into storage.buckets (id, name, public)
values ('submissions', 'submissions', true)
on conflict (id) do nothing;

create policy "로그인 유저 업로드 가능"
on storage.objects for insert
to authenticated
with check (bucket_id = 'submissions');

create policy "공개 파일 조회 가능"
on storage.objects for select
to public
using (bucket_id = 'submissions');

create policy "본인 파일 삭제 가능"
on storage.objects for delete
to authenticated
using (bucket_id = 'submissions' and auth.uid()::text = (storage.foldername(name))[1]);

select '함수 및 Storage 설정 완료!' as message;
