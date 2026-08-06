# 평남 오리진

평안남도 3·4세대가 가족의 기록을 미션 형태로 수집하고, 심사된 콘텐츠를 디지털 아카이브로 공개하는 Next.js 16 + Supabase 플랫폼입니다.

## 로컬 실행

Node.js 20 이상을 사용하세요.

```bash
cp .env.example .env.local
npm install
npm run dev
```

`.env.local`에 아래 값을 설정합니다.

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## Supabase 설정

새 프로젝트라면 Supabase SQL Editor에서 다음 파일을 순서대로 실행합니다.

1. `supabase/schema.sql`
2. `supabase/functions.sql`

이미 운영 중인 DB라면 데이터를 삭제하는 `schema.sql`을 다시 실행하지 말고, 아래 두 마이그레이션을 순서대로 실행합니다.

1. `supabase/migrations/000_bootstrap_existing_project.sql`
2. `supabase/migrations/001_runtime_fixes.sql`

관리자 계정은 가입 후 SQL Editor에서 다음처럼 지정합니다.

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'admin@example.com');
```

Supabase Authentication의 Site URL과 Redirect URLs에는 로컬 주소와 실제 배포 주소를 등록해야 합니다.

## 배포

Vercel 프로젝트 환경변수에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 등록한 뒤 배포합니다. 배포 전 확인 명령은 다음과 같습니다.

```bash
npm run lint
npm run build
```

## 주요 흐름

- 회원가입 → 이메일 인증(프로젝트 설정에 따라 생략 가능) → 온보딩
- 미션 선택 → 콘텐츠/파일 제출 → 관리자 심사
- 승인 시 DB 함수가 제출 상태 변경, 포인트 지급, 첫 미션 배지 및 아카이브 공개를 한 트랜잭션으로 처리
- 반려·중복 승인·클라이언트 포인트 조작은 DB 함수에서 차단

## 저장소 전략 (Free → Paid)

**현재 상태**: 무료 운영 (Supabase Storage 1GB 무료)

- ✅ 관리자 콘솔에서 **실시간 저장 용량 모니터**
- ✅ **매주 점검 리스트** 제공 (docs/weekly-checklist.md)
- ✅ 용량 부족 시 **Vercel Blob 전환 가이드** 준비됨 (docs/storage-migration.md)

**전체 전략**: [STORAGE-STRATEGY.md](./STORAGE-STRATEGY.md) 참조

예상 비용:
- Phase 1 (3월~10월): **$0** (무료)
- Phase 2 (11월~12월): **$5~50** (필요시 유료 전환)
