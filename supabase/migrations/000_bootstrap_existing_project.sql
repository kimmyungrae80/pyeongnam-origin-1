-- 기존 프로젝트를 삭제하지 않고 평남 오리진에 필요한 객체를 생성합니다.
-- 현재 운영 DB처럼 profiles만 일부 생성된 경우에도 사용할 수 있습니다.

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key
);

alter table public.profiles add column if not exists name text;
alter table public.profiles add column if not exists generation int;
alter table public.profiles add column if not exists origin_region text;
alter table public.profiles add column if not exists track text;
alter table public.profiles add column if not exists family_id uuid;
alter table public.profiles add column if not exists points int default 0;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists is_admin boolean default false;
alter table public.profiles add column if not exists onboarding_completed boolean default false;
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();
update public.profiles set name = '이름없음' where name is null;
alter table public.profiles alter column name set not null;
alter table public.profiles alter column onboarding_completed set not null;

create table if not exists public.families (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  origin_region text,
  invite_code text unique default substr(md5(random()::text), 1, 8),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

do $$ begin
  alter table public.profiles add constraint fk_family
    foreign key (family_id) references public.families(id);
exception when duplicate_object then null;
end $$;

create table if not exists public.missions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  track text check (track in ('storytelling', 'lifestyle', 'digital', 'free')),
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) default 'easy',
  points int default 100,
  is_family_mission boolean default false,
  family_bonus_multiplier float default 1.0,
  is_active boolean default true,
  order_num int default 0,
  created_at timestamptz default now()
);

create table if not exists public.submissions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  mission_id uuid references public.missions(id),
  title text,
  content text,
  file_urls text[],
  content_type text check (content_type in ('photo', 'video', 'essay', 'design', 'map', 'other')),
  status text check (status in ('draft', 'submitted', 'approved', 'rejected')) default 'submitted',
  points_earned int default 0,
  admin_comment text,
  is_public boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.badges (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text,
  condition_type text,
  condition_value int,
  created_at timestamptz default now()
);

create table if not exists public.user_badges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  badge_id uuid references public.badges(id),
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

create table if not exists public.archive_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  family_id uuid references public.families(id),
  title text not null,
  description text,
  content_type text check (content_type in ('photo', 'video', 'essay', 'design', 'map', 'other')),
  file_urls text[],
  region_tag text,
  tags text[],
  is_public boolean default true,
  is_featured boolean default false,
  view_count int default 0,
  submission_id uuid references public.submissions(id),
  created_at timestamptz default now()
);

insert into public.missions (title, description, track, difficulty, points, is_family_mission, family_bonus_multiplier, order_num)
select * from (values
  ('가족사진 5장 업로드', '우리 가문의 옛날 사진을 5장 이상 찾아 업로드하고 설명을 달아보세요.', 'storytelling', 'easy', 200, false, 1.0, 1),
  ('할아버지/할머니 인터뷰 1분 영상', '1세대 가족에게 평안남도에 대해 인터뷰해보세요.', 'storytelling', 'medium', 500, true, 1.5, 2),
  ('가문의 고향 이야기 에세이', '우리 가문이 살았던 평남 지역 이야기를 에세이로 써보세요.', 'storytelling', 'medium', 400, false, 1.0, 3),
  ('우리 집 평남 음식 레시피 영상', '집에서 전해지는 평남 음식 레시피를 영상으로 남겨보세요.', 'lifestyle', 'medium', 500, false, 1.0, 4),
  ('평남 전통 문양으로 굿즈 디자인', '평안남도 전통 문양이나 색을 활용해 굿즈를 디자인해보세요.', 'lifestyle', 'hard', 700, false, 1.0, 5),
  ('디지털 평남 지도 핀 등록', '가족의 추억이 담긴 평남 장소를 지도에 표시해보세요.', 'digital', 'easy', 300, true, 1.3, 6),
  ('가상 고향 브이로그 제작', '평안남도에서의 하루를 상상해 브이로그로 만들어보세요.', 'digital', 'hard', 800, false, 1.0, 7),
  ('3세대 + 1세대 공동 인터뷰', '조부모님과 평남에서의 삶을 주제로 대화해보세요.', 'storytelling', 'hard', 1000, true, 1.5, 8),
  ('평남 관련 숏폼 영상 제작', '평안남도를 주제로 60초 이하 숏폼을 만들어보세요.', 'free', 'easy', 300, false, 1.0, 9),
  ('우리 가문 족보 탐색기', '족보 속 평남 이야기를 웹툰이나 인포그래픽으로 표현해보세요.', 'free', 'hard', 900, false, 1.0, 10)
) as seed(title, description, track, difficulty, points, is_family_mission, family_bonus_multiplier, order_num)
where not exists (select 1 from public.missions);

insert into public.badges (name, description, icon, condition_type, condition_value)
select * from (values
  ('첫 탐사', '첫 번째 미션을 완료했습니다.', '🌱', 'mission_count', 1),
  ('뿌리 대사', '포인트 1000점을 달성했습니다.', '⭐', 'points', 1000),
  ('평남의 자랑', '포인트 5000점을 달성했습니다.', '🏆', 'points', 5000)
) as seed(name, description, icon, condition_type, condition_value)
where not exists (select 1 from public.badges);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', '이름없음'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.missions enable row level security;
alter table public.submissions enable row level security;
alter table public.archive_items enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

drop policy if exists "누구나 프로필 조회 가능" on public.profiles;
create policy "누구나 프로필 조회 가능" on public.profiles for select using (true);
drop policy if exists "본인 프로필만 수정 가능" on public.profiles;
create policy "본인 프로필만 수정 가능" on public.profiles for update using (auth.uid() = id);
drop policy if exists "본인 프로필 생성 가능" on public.profiles;
create policy "본인 프로필 생성 가능" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "누구나 가문 조회 가능" on public.families;
create policy "누구나 가문 조회 가능" on public.families for select using (true);
drop policy if exists "로그인 유저는 가문 생성 가능" on public.families;
create policy "로그인 유저는 가문 생성 가능" on public.families for insert with check (auth.uid() = created_by);
drop policy if exists "누구나 미션 조회 가능" on public.missions;
create policy "누구나 미션 조회 가능" on public.missions for select using (true);
drop policy if exists "본인 제출물 조회" on public.submissions;
create policy "본인 제출물 조회" on public.submissions for select using (auth.uid() = user_id);
drop policy if exists "공개 제출물 조회" on public.submissions;
create policy "공개 제출물 조회" on public.submissions for select using (is_public = true);
drop policy if exists "로그인 유저 제출 가능" on public.submissions;
create policy "로그인 유저 제출 가능" on public.submissions for insert with check (auth.uid() = user_id);
drop policy if exists "본인 제출물 수정 가능" on public.submissions;
create policy "본인 제출물 수정 가능" on public.submissions for update using (auth.uid() = user_id);
drop policy if exists "공개 아카이브 조회" on public.archive_items;
create policy "공개 아카이브 조회" on public.archive_items for select using (is_public = true);
drop policy if exists "본인 아카이브 전체 조회" on public.archive_items;
create policy "본인 아카이브 전체 조회" on public.archive_items for select using (auth.uid() = user_id);
drop policy if exists "누구나 배지 조회" on public.badges;
create policy "누구나 배지 조회" on public.badges for select using (true);
drop policy if exists "본인 배지 조회" on public.user_badges;
create policy "본인 배지 조회" on public.user_badges for select using (auth.uid() = user_id);

create or replace view public.rankings as
select p.id, p.name, p.generation, p.origin_region, p.track, p.points, p.avatar_url,
  rank() over (order by p.points desc) as rank,
  count(s.id) as submission_count
from public.profiles p
left join public.submissions s on s.user_id = p.id and s.status = 'approved'
group by p.id
order by p.points desc;
