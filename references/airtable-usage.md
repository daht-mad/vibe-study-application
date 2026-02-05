# Airtable API 사용법

`scripts/airtable.ts` 스크립트 사용 가이드.

## 목차

1. [기본 사용법](#기본-사용법)
2. [함수 레퍼런스](#함수-레퍼런스)
3. [StudyApplication 인터페이스](#studyapplication-인터페이스)
4. [CLI 테스트](#cli-테스트)

---

## 기본 사용법

### ⚠️ 실행 방법 (중요!)

**절대 금지**: `bun -e "..."` 인라인 실행 ❌
- `generatedContent`에 백틱(`)이 포함되어 쉘 파싱 에러 발생

**필수**: 별도 스크립트 파일 생성 후 실행

```bash
# 스크립트 파일 생성 후 bun run으로 실행
bun run /path/to/submit-application.ts
```

### Import

```typescript
import { 
  createApplication, 
  getApplicationByPhone,
  updateApplication,
  type StudyApplication, 
  type ApplicationStatus 
} from "./scripts/airtable.ts";
```

### 기존 지원서 조회

```typescript
const existing = await getApplicationByPhone("01012345678");
if (existing) {
  console.log("기존 지원서 발견:", existing.fields["생성된 제목"]);
  console.log("상태:", existing.fields["상태"]);
}
```

### 새 지원서 생성

```typescript
const app: StudyApplication = {
  name: "홍길동",
  phone: "01012345678",
  email: "hong@example.com",
  bio: "• 지피터스 19기 스터디장\n• Claude Code 1년 경험",
  category: "개발&자동화",
  tool: "Claude Code",
  difficulty: "입문",
  prereqVideo: "",
  prereqKnowledge: "",
  generatedTitle: "1인 사업자를 위한 Claude Code로 업무 자동화하기",
  generatedContent: "생성된 상세페이지 마크다운",
  qaRaw: "인터뷰 전체 Q&A 내용",
  coLeaderName: "",
  coLeaderPhone: "",
  coLeaderEmail: "",
  coLeaderBio: "",
};

// 임시저장
const result = await createApplication(app, "작성중");

// 최종 제출
const result = await createApplication(app, "제출완료");
```

### 기존 지원서 업데이트

```typescript
await updateApplication(existingId, { 
  status: "제출완료",
  generatedContent: "수정된 상세페이지"
});
```

---

## 함수 레퍼런스

| 함수 | 설명 | 반환값 |
|------|------|--------|
| `createApplication(app, status)` | 새 지원서 생성 | `{ id, url }` |
| `getApplicationByPhone(phone)` | 전화번호로 조회 | `AirtableRecord \| null` |
| `updateApplication(id, updates)` | 레코드 업데이트 | `void` |

### ApplicationStatus 타입

```typescript
type ApplicationStatus = "작성중" | "제출완료";
```

---

## StudyApplication 인터페이스

```typescript
interface StudyApplication {
  // 필수
  name: string;           // 이름
  phone: string;          // 전화번호
  email: string;          // 이메일
  bio: string;            // 이력 (불릿 포인트)
  category: string;       // 카테고리
  tool: string;           // 바이브코딩 도구
  difficulty: "입문" | "중급";
  generatedTitle: string; // 생성된 제목
  generatedContent: string; // 상세페이지 마크다운
  qaRaw: string;          // Q&A 원본

  // 중급 필수 (입문은 빈 문자열)
  prereqVideo?: string;      // 사전학습 영상 URL
  prereqKnowledge?: string;  // 선수지식

  // 공동스터디장 (선택)
  coLeaderName?: string;
  coLeaderPhone?: string;
  coLeaderEmail?: string;
  coLeaderBio?: string;
}
```

### 중급 필수 검증

스크립트에서 자동 검증:
- `difficulty === "중급"`인 경우 `prereqVideo`, `prereqKnowledge` 필수
- 미입력 시 에러: "중급 난이도는 사전학습 영상 URL이 필수입니다."

---

## CLI 테스트

```bash
cd /path/to/vibe-study-application/scripts

# 연결 테스트
bun run airtable.ts --test

# 지원서 생성 테스트
bun run airtable.ts --create-test
```
