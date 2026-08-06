# 📤 파일 업로드 시스템 상세 가이드

평남 오리진의 파일 업로드 기능을 완벽하게 이해하기 위한 가이드입니다.

---

## 🎯 전체 흐름 (End-to-End)

```
사용자 (브라우저)
    ↓
📱 FileUploadSection (React 컴포넌트)
    ↓
📤 /api/upload (Next.js API 라우트)
    ↓
☁️ Supabase Storage (클라우드 저장)
    ↓
🔗 공개 URL 생성
    ↓
💾 submissions 테이블에 저장
```

---

## 1️⃣ 사용자가 하는 일 (UI/UX)

### 제출 페이지 접근
```
홈 → "뿌리 찾기 시작" → 미션 선택 → "제출하기" → /submit 페이지
```

### 파일 선택
1. **드래그 & 드롭** 또는 **클릭해서 선택**
2. 지원되는 형식:
   - 📸 사진: JPG, PNG, WebP
   - 🎬 영상: MP4, WebM, MOV
   - 📄 문서: PDF, TXT

### 업로드 진행률 표시
```
┌─────────────────────┐
│ 📁 파일 선택 중...  │
│ [████████████░░░░░░] 60%
│ 업로드 중... 60%     │
└─────────────────────┘
```

### 업로드 완료
```
✅ 업로드 완료!
📄 family_photo_1.jpg
파일 크기: 2.34MB

[변경] 버튼으로 다시 선택 가능
```

---

## 2️⃣ 프론트엔드 (FileUploadSection.tsx)

### 코드 구조

```typescript
// src/components/FileUploadSection.tsx

export default function FileUploadSection({
  onFileSelect,  // 업로드 완료 후 부모에 파일 정보 전달
}: {
  onFileSelect?: (file: UploadedFile) => void
})
```

### 상태 관리

| 상태 | 역할 |
|------|------|
| `uploading` | 업로드 진행 중? |
| `uploadProgress` | 진행률 (0~100%) |
| `uploadedFile` | 업로드된 파일 정보 |
| `error` | 오류 메시지 |

### 상세 동작

#### 1단계: 파일 선택
```typescript
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]  // ← 첫 번째 파일만 선택
  if (!file) return

  setUploading(true)
  setUploadProgress(0)
}
```

#### 2단계: FormData 생성
```typescript
const formData = new FormData()
formData.append('file', file)           // ← 실제 파일
formData.append('path', 'submissions')  // ← 저장 경로
```

#### 3단계: 진행률 시뮬레이션
```typescript
// 실제 업로드는 느릴 수 있으므로 UI 진행률 표시
const progressInterval = setInterval(() => {
  setUploadProgress((prev) => {
    if (prev >= 90) {
      clearInterval(progressInterval)
      return 90  // ← 최대 90%까지만 진행 (업로드 완료까지 기다림)
    }
    return prev + Math.random() * 20
  })
}, 200)
```

#### 4단계: API 호출
```typescript
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,  // ← 파일 데이터 전송
})

if (!response.ok) {
  const error = await response.json()
  setError(error.error)  // ← 오류 표시
  return
}
```

#### 5단계: 응답 처리
```typescript
const data = await response.json()
const uploadedFileData: UploadedFile = {
  url: data.url,          // ← Supabase 공개 URL
  filename: data.filename, // ← 원본 파일명
  size: data.size,        // ← 파일 크기 (바이트)
  type: data.type,        // ← MIME 타입
}
setUploadedFile(uploadedFileData)
onFileSelect?.(uploadedFileData)  // ← 부모 컴포넌트에 전달
```

---

## 3️⃣ 백엔드 API (route.ts)

### API 엔드포인트

```
POST /api/upload
Content-Type: multipart/form-data

요청:
  - file: File (필수)
  - path: string (선택, 기본값: "submissions")

응답 (성공):
  {
    "success": true,
    "url": "https://tewgp...co/storage/v1/object/public/submissions/...",
    "filename": "family_photo_1.jpg",
    "size": 2457600,
    "type": "image/jpeg"
  }

응답 (실패):
  {
    "error": "파일이 너무 큽니다. 2GB 이하여야 합니다."
  }
```

### 상세 검증 단계

#### 1단계: 파일 존재 확인
```typescript
const file = formData.get('file') as File

if (!file) {
  return NextResponse.json(
    { error: '파일을 선택해주세요.' },
    { status: 400 }
  )
}
```

#### 2단계: 파일 크기 검증
```typescript
const MAX_SIZE = 2 * 1024 * 1024 * 1024  // 2GB

if (file.size > MAX_SIZE) {
  return NextResponse.json(
    { error: '파일이 너무 큽니다. 2GB 이하여야 합니다.' },
    { status: 400 }
  )
}
```

#### 3단계: 파일 타입 검증
```typescript
const ALLOWED_TYPES = [
  'video/mp4',        // ← MP4 영상
  'video/webm',       // ← WebM 영상
  'video/quicktime',  // ← MOV 영상 (iPhone)
  'image/jpeg',       // ← JPG 사진
  'image/png',        // ← PNG 사진
  'image/webp',       // ← WebP 사진
  'text/plain',       // ← TXT 문서
  'application/pdf',  // ← PDF 문서
]

if (!ALLOWED_TYPES.includes(file.type)) {
  return NextResponse.json(
    { error: '지원하지 않는 파일 형식입니다.' },
    { status: 400 }
  )
}
```

#### 4단계: 사용자 인증 확인
```typescript
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
  return NextResponse.json(
    { error: '로그인이 필요합니다.' },
    { status: 401 }
  )
}
```

#### 5단계: 파일명 생성 (보안)
```typescript
const timestamp = Date.now()
const filename = `${user.id}_${timestamp}_${file.name}`
//             ↑              ↑            ↑
//          사용자ID    현재시간    원본파일명

// 예: user123_1691403600000_family_photo.jpg
```

#### 6단계: Supabase에 업로드
```typescript
const { data, error } = await supabase.storage
  .from('submissions')  // ← "submissions" bucket
  .upload(filepath, file, {
    cacheControl: '3600',  // ← 1시간 캐시
    upsert: false,         // ← 덮어쓰지 않음
  })

if (error) {
  return NextResponse.json(
    { error: '파일 업로드에 실패했습니다.' },
    { status: 500 }
  )
}
```

#### 7단계: 공개 URL 생성
```typescript
const { data: publicUrl } = supabase.storage
  .from('submissions')
  .getPublicUrl(filepath)

// 예: https://tewgp...co/storage/v1/object/public/submissions/user123_1691403600000_family_photo.jpg
```

#### 8단계: 응답 반환
```typescript
return NextResponse.json({
  success: true,
  url: publicUrl.publicUrl,  // ← URL (핵심!)
  filename: file.name,        // ← 원본 파일명
  size: file.size,            // ← 파일 크기
  type: file.type,            // ← MIME 타입
})
```

---

## 4️⃣ 클라우드 저장소 (Supabase Storage)

### Bucket 구조

```
submissions (공개 버킷)
├── submissions/
│   ├── user123_1691403600000_photo1.jpg
│   ├── user123_1691403600001_photo2.jpg
│   ├── user456_1691403602000_video.mp4
│   └── ...
```

### 저장소 크기 모니터링

**Free 플랜:**
- 저장소: 1GB
- 다운로드: 1GB/월

**예상 사용량:**
```
사진: 3MB/개 × 100명 = 300MB
영상: 300MB/개 × 10명 = 3GB (⚠️ 주의!)
```

### 비용 절감 전략

**현재 (Free):**
- $0 (무료 1GB)

**전환 필요 시 (Phase 2):**
- Vercel Blob: $5/월 (Recommended)
- AWS S3: $0.40/월 (복잡함)
- Supabase Pro: $25/월 (비쌈)

→ 자세한 전략: `docs/storage-migration.md` 참조

---

## 5️⃣ 제출 페이지에서의 통합 (submit/page.tsx)

### 업로드 결과 처리

```typescript
const [uploadedFile, setUploadedFile] = useState<{
  url: string
  filename: string
} | null>(null)

// FileUploadSection에서 콜백
<FileUploadSection
  onFileSelect={(file) => setUploadedFile(file)}
/>
```

### 제출할 때 파일 URL 사용

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  // 파일 URL 결정
  let fileUrls: string[] = []
  
  if (form.content_type === 'video' && form.videoUrl) {
    // YouTube 링크인 경우
    fileUrls = [form.videoUrl]
  } else if (uploadedFile) {
    // 업로드한 파일의 Supabase URL
    fileUrls = [uploadedFile.url]
  }

  // 제출
  await supabase.from('submissions').insert({
    user_id: user.id,
    mission_id: mission?.id ?? null,
    title: form.title,
    content: form.content,
    file_urls: fileUrls,  // ← URL 배열
    content_type: form.content_type,
    status: 'submitted',
  })
}
```

---

## 🔍 오류 처리

### 사용자 입장에서 발생 가능한 오류

| 오류 | 원인 | 해결법 |
|------|------|--------|
| **파일을 선택해주세요** | 파일 미선택 | 파일 선택 후 다시 시도 |
| **파일이 너무 큽니다** | 2GB 초과 | 파일을 분할하거나 압축 |
| **지원하지 않는 형식** | 잘못된 파일 타입 | JPG, MP4, PDF 등 지원 형식만 사용 |
| **로그인이 필요합니다** | 비인증 사용자 | 로그인 후 다시 시도 |
| **업로드 실패** | Supabase 오류 | 나중에 다시 시도 |

### 개발자 입장에서 디버깅

```typescript
// 브라우저 콘솔에서 확인
console.error('Upload error:', err)

// Network 탭에서 API 응답 확인
// POST /api/upload
// Response: { "error": "..." }

// Supabase 대시보드에서 확인
// https://app.supabase.com/
// → Storage → submissions → 업로드된 파일 확인
```

---

## 📊 성능 최적화

### 현재 구현

| 항목 | 현재 값 | 설명 |
|------|--------|------|
| **최대 파일 크기** | 2GB | Supabase 제한 |
| **캐시 시간** | 1시간 | `cacheControl: 3600` |
| **진행률 업데이트** | 200ms | 부드러운 UI |
| **지원 형식** | 8가지 | 대부분의 콘텐츠 지원 |

### 추후 개선 사항

```typescript
// TODO: 1. 이미지 최적화
// - 업로드 전 이미지 압축 (libvips)
// - 썸네일 자동 생성

// TODO: 2. 비디오 최적화
// - 업로드 전 비디오 트랜스코딩 (ffmpeg)
// - 적응형 스트리밍 (HLS)

// TODO: 3. 청크 업로드
// - 대용량 파일을 나누어 업로드
// - 재시작 가능한 업로드

// TODO: 4. 바이러스 스캔
// - ClamAV 같은 백신 통합
// - 악성 파일 차단
```

---

## 🧪 테스트 방법

### 로컬 테스트

```bash
# 1. 개발 서버 시작
npm run dev

# 2. 브라우저에서 접근
http://localhost:3000/submit?mission=1

# 3. 테스트 파일 선택
- 작은 사진 (< 10MB)
- 작은 영상 (< 100MB)

# 4. 브라우저 콘솔에서 확인
console.log('Upload progress:', uploadProgress)
console.log('Uploaded file:', uploadedFile)
```

### Supabase에서 확인

```
https://app.supabase.com/
→ 프로젝트 선택
→ Storage → submissions
→ 업로드된 파일 확인
→ 파일 명 클릭 → "Download" 또는 "Copy URL"
```

---

## 🚀 배포 체크리스트

- [ ] Supabase Storage bucket 설정 확인
- [ ] 환경 변수 설정 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] 파일 형식 검증 테스트
- [ ] 파일 크기 검증 테스트
- [ ] 오류 메시지 확인
- [ ] 프로덕션 환경에서 업로드 테스트
- [ ] 저장소 용량 모니터 활성화 (`/admin`)

---

## 📞 자주 묻는 질문

### Q1: 업로드한 파일을 삭제할 수 있나요?

**A:** 현재는 불가능합니다. 추후 구현 예정:

```typescript
// TODO: 파일 삭제 API
DELETE /api/upload/:fileId
```

### Q2: 여러 파일을 한 번에 업로드할 수 있나요?

**A:** 현재는 1개만 가능합니다. 추후 개선 예정:

```typescript
// TODO: 다중 파일 업로드
<input type="file" multiple accept="image/*" />
```

### Q3: 업로드 중 취소할 수 있나요?

**A:** 현재는 불가능합니다. AbortController로 구현 예정:

```typescript
// TODO: 업로드 취소
const controller = new AbortController()
fetch('/api/upload', {
  signal: controller.signal,
})
```

### Q4: 파일의 다운로드 수를 제한할 수 있나요?

**A:** 네, Supabase RLS 규칙으로 제한 가능합니다:

```sql
-- 예: 심사 승인된 파일만 다운로드 가능
CREATE POLICY "Approved submissions only"
ON storage.objects
AS SELECT
USING (
  EXISTS (
    SELECT 1 FROM submissions
    WHERE file_urls @> ARRAY[storage.foldername() || '/' || name]
    AND status = 'approved'
  )
);
```

### Q5: 파일 업로드 속도를 높일 수 있나요?

**A:** 몇 가지 방법이 있습니다:

1. **이미지 압축**: 업로드 전 압축
2. **CDN 활용**: Vercel Edge CDN 이용
3. **지역별 엣지 서버**: Supabase의 지역 선택
4. **동시 업로드**: 여러 파일을 동시에 업로드

---

## 📚 관련 파일

| 파일 | 역할 |
|------|------|
| `src/components/FileUploadSection.tsx` | UI 컴포넌트 |
| `src/app/api/upload/route.ts` | 백엔드 API |
| `src/app/submit/page.tsx` | 제출 페이지 |
| `docs/storage-migration.md` | 저장소 마이그레이션 가이드 |
| `docs/storage-monitor.md` | 저장소 모니터링 가이드 |

---

**작성일**: 2026-08-06  
**버전**: 1.0  
**다음 업데이트**: 다중 파일 업로드 구현 시
