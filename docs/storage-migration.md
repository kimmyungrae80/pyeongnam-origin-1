# 저장소 마이그레이션 가이드

**Supabase Storage → Vercel Blob 전환 매뉴얼**

---

## 📌 언제 전환할까?

관리자 콘솔의 **저장 용량 모니터**가 다음 중 하나를 표시할 때:

- ⚠️ **경고 상태**: 사용률 70% 이상
- ⛔ **위험 상태**: 사용률 90% 이상
- 📅 **10월 17일**: 공모 마감 2주 전 (무조건 점검)

---

## 🔄 전환 절차

### Phase 1: 사전 준비 (1~2시간)

#### 1.1 Vercel 프로젝트 링크 확인
```bash
cd /Users/mr.kim/Documents/평남오리진\(뿌리찾기프로젝트\)
vercel link
```

**출력 예시:**
```
✅ Linked to kimmyungrae/pyeongnam-origin-v2 (production)
```

#### 1.2 Vercel Blob 설치
```bash
vercel integration add vercel-blob --yes
```

**출력:**
```
✅ Added vercel-blob integration
✅ Env vars added to .env.local
```

#### 1.3 로컬 환경 변수 확인
```bash
vercel env pull --yes
```

`.env.local` 파일에 다음이 추가됨:
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxx
```

### Phase 2: 코드 준비 (30분)

#### 2.1 Blob Storage 클래스 생성

```typescript
// src/lib/storage/blob-storage.ts
import { put } from '@vercel/blob';

export class BlobStorage {
  async upload(file: File, path?: string) {
    const filename = `${Date.now()}-${file.name}`;
    const filepath = path ? `${path}/${filename}` : filename;

    const blob = await put(filepath, file, {
      access: 'public', // 공개 파일
    });

    return blob.url;
  }

  async delete(url: string) {
    // Vercel Blob에서는 delete API가 제한적이므로 주의
    // 나중에 수동으로 관리
    console.log('To delete:', url);
  }
}
```

#### 2.2 Storage 추상화 레이어

```typescript
// src/lib/storage/index.ts
import { BlobStorage } from './blob-storage';
import { SupabaseStorage } from './supabase-storage';

type StorageProvider = 'supabase' | 'blob';

const provider = (process.env.STORAGE_PROVIDER || 'supabase') as StorageProvider;

class StorageAdapter {
  private supabase = new SupabaseStorage();
  private blob = new BlobStorage();

  async upload(file: File, path?: string) {
    if (provider === 'blob') {
      return this.blob.upload(file, path);
    }
    return this.supabase.upload(file, path);
  }

  async delete(url: string) {
    if (provider === 'blob') {
      return this.blob.delete(url);
    }
    return this.supabase.delete(url);
  }
}

export const storage = new StorageAdapter();
```

#### 2.3 업로드 API 수정

현재 업로드 API를 수정:
```typescript
// src/app/api/upload/route.ts
import { storage } from '@/lib/storage';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // storage 객체가 자동으로 provider 선택
  const url = await storage.upload(file, 'submissions');

  return Response.json({ url });
}
```

### Phase 3: 환경 변수 전환 (5분)

#### 3.1 로컬 테스트
```bash
# .env.local에 STORAGE_PROVIDER=blob 추가
echo "STORAGE_PROVIDER=blob" >> .env.local

# 개발 서버 재시작
npm run dev

# 파일 업로드 테스트
# → 성공하면 url이 vercel.blob.com이어야 함
```

#### 3.2 Vercel 프로덕션 환경 변수 설정
```bash
# Vercel 대시보드에서 수동으로 추가 또는 CLI로:
vercel env add STORAGE_PROVIDER blob
```

**Vercel 대시보드에서 확인:**
- Settings → Environment Variables
- BLOB_READ_WRITE_TOKEN 확인 (자동 추가됨)
- STORAGE_PROVIDER=blob 추가

#### 3.3 배포
```bash
# 프로덕션 배포
vercel deploy --prod
```

### Phase 4: 기존 데이터 마이그레이션 (선택사항)

**필요한 경우만 실행** (대규모 데이터의 경우 시간 소요)

```typescript
// scripts/migrate-to-blob.ts
// 기존 Supabase Storage 파일을 Blob으로 마이그레이션
// (지금은 불필요 - 새 파일부터 Blob 사용)
```

**현재 전략:**
- ✅ 새 제출물: Blob 저장
- ℹ️ 기존 파일: Supabase Storage 유지 (비용 추가 안 함)
- 📌 필요시 나중에 대량 마이그레이션

---

## ✅ 체크리스트

```
[ ] 1. Vercel 프로젝트 링크 확인
[ ] 2. vercel integration add vercel-blob
[ ] 3. vercel env pull 실행
[ ] 4. BlobStorage 클래스 작성
[ ] 5. StorageAdapter 통합
[ ] 6. API 라우트 수정
[ ] 7. 로컬 테스트 (npm run dev)
[ ] 8. Vercel env add STORAGE_PROVIDER blob
[ ] 9. vercel deploy --prod
[ ] 10. 프로덕션에서 파일 업로드 테스트
```

---

## 🔍 검증 방법

### 로컬 검증
```bash
# 1. 개발 서버 시작
npm run dev

# 2. admin 페이지 확인
# → 저장 용량 모니터가 표시되어야 함

# 3. 파일 업로드 테스트
# → URL이 vercel.blob.com이어야 함
```

### 프로덕션 검증
```bash
# 1. 배포 확인
vercel list deployments

# 2. 프로덕션 URL에서 로그인
# https://your-domain.com

# 3. 파일 업로드 테스트
# 심사 결과 URL이 vercel.blob.com 도메인이어야 함

# 4. 이전 파일 접근 확인
# Supabase Storage 파일도 여전히 접근 가능해야 함
```

---

## 💰 비용 확인

### Vercel Blob 비용
```
첫 100GB: 무료
이후: $0.05/GB per month

예시:
- 17GB 저장: 월 $5
- 50GB 저장: 월 $5
- 200GB 저장: 월 $5 + (100GB × $0.05) = $10
```

---

## 🆘 문제 해결

### 문제: "BLOB_READ_WRITE_TOKEN이 없습니다"
```
원인: Vercel Blob 설치 안 됨
해결: vercel integration add vercel-blob --yes 재실행
```

### 문제: "업로드 후 URL이 supabasecdn 도메인입니다"
```
원인: STORAGE_PROVIDER=supabase로 설정됨
해결: .env.local에 STORAGE_PROVIDER=blob 추가 후 재시작
```

### 문제: "기존 파일이 안 보입니다"
```
원인: 아키텍처 변경으로 인한 URL 변경
해결: 
1. 기존 supabasecdn.com 파일은 계속 접근 가능
2. 아카이브에서 file_urls 배열이 혼합됨 (Supabase + Blob)
3. 웹에서는 둘 다 정상 표시됨
```

---

## 📞 지원

- **Vercel Blob 문서**: https://vercel.com/docs/storage/vercel-blob
- **마이그레이션 문제**: 관리자(김명래)에게 알림
- **비용 승인**: 프로젝트 담당자에게 사전 협의

---

**작성**: Claude Code  
**최종 수정**: 2026-08-06  
**버전**: 1.0
