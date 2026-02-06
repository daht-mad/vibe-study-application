---
name: vibe-study-application
description: |
  바이브코딩 스터디 지원서 작성 및 상세페이지 자동 생성. 스터디장의 기존 주제를 바이브코딩 방향으로 인터뷰하고, Airtable에 저장.

  Triggers:
  - `/vibe-study-application`
  - "스터디 지원서", "스터디장 지원", "스터디 상세페이지"
  - "바이브코딩 스터디", "지원서 작성"

  Use when: 스터디장이 AI 활용사례 공유 스터디를 기획하고 상세페이지를 작성할 때.
---

# Vibe Study Application

바이브코딩 스터디 지원서 작성 도우미

## 바이브코딩이란?

> "코드를 한 줄도 직접 쓰지 않고 자연어로 결과물을 만드는 것"

- **CLI**: Cursor, Claude Code, OpenCode
- **에이전트**: OpenClaw, Lindy, Manus
- **노코드 AI**: Antigravity, Google Build

## 카테고리 (3개 중 필수 선택)

| 카테고리 | 설명 |
|----------|------|
| 개발&자동화 | 앱/서비스, 워크플로우 자동화 |
| 콘텐츠&지식 | 글쓰기, 영상, 지식관리 |
| 업무&비즈니스 | 마케팅, 영업, 고객관리 |

---

## Workflow

### Phase 1: 기존 주제 확인

기획하신 스터디 주제가 어떤 건지 질문. 자유롭게 말하게 유도.

### Phase 2: 카테고리 확인

```
[주제]를 기획하고 계시는군요! 어떤 카테고리에 가까울까요?

1. 개발&자동화
2. 콘텐츠&지식
3. 업무&비즈니스
```

### Phase 3: 바이브코딩 방향 탐색

1. **도구 확인**: 생각하고 계신 바이브코딩 도구가 있는지
2. **도구 제안**: 카테고리에 맞는 도구 추천 → [references/examples.md](references/examples.md) 참조
3. **난이도 확인**: 입문 vs 중급

**중급 선택 시**: 사전학습 필수 → AI가 도구별 추천 제공

**입문도 사전지식 추가 가능**: 
```
입문이시더라도, 미리 알고 오면 좋은 내용이 있으시면 추가하셔도 좋아요!
예: 참고 영상, 기본 개념, 설치 가이드 등
```

도구별 사전학습 추천 기준 → [references/examples.md](references/examples.md) 참조

### Phase 4: 스터디 내용 인터뷰

자유로운 대화로 수집 (꼬리질문):

- **기획 의도**: 왜 이 스터디를 기획했는지
- **해결할 문제**: 참여자들이 겪는 구체적 문제
- **대상**: 어떤 분들이 참여하면 좋을지 (상황 + 니즈)
- **산출물**: 4주 후 가져갈 결과물
- **커리큘럼**: 4주 학습 흐름

**금지 표현 감지**: "모든 사람", "관심 있는 누구나" → 구체화 유도

### Phase 5: 지원자 정보

- 성함, 연락처, 이메일
- 이력 소개 (3-4개 불릿)
- 공동스터디장 여부 (있으면: 성함, 연락처, 이메일, 이력)

### Phase 5-1: AI토크 가능여부 (선택)

선택한 카테고리에 맞는 AI토크 일정 참여 가능 여부를 확인 (AI토크 일정은 필수는 아니며 선택 일정):

```
아래 카테고리에 맞는 AI토크 일정에 참여 가능하신가요? (복수 선택 가능)
시간: 21:00~23:00

1. 3/3(화) 개발&자동화
2. 3/4(수) 콘텐츠&지식
3. 3/5(목) 업무&비즈니스
4. 참여 안 함
```

선택 결과를 Airtable의 `AI토크 가능여부` 필드에 저장.

### Phase 5-2: 스터디 요일

가능한 스터디 요일을 복수 선택으로 확인:

```
가능한 스터디 요일을 모두 선택해주세요. (복수 선택 가능)

1. 화요일
2. 수요일
3. 목요일
```

선택 결과를 Airtable의 `스터디 요일` 필드에 저장. (예: "화요일, 수요일")

### Phase 5-3: 오프모임 참석여부 (필수)

오프모임 참석 가능 여부를 확인 (오프모임 일정은 필수 일정):

```
3/21(토) 오프모임에 참석 가능하신가요?

1. 예
2. 아니오
```

선택 결과를 Airtable의 `오프모임 참석여부` 필드에 저장.

### Phase 6: 확인 + 저장

#### 6-1. 기존 지원서 확인

전화번호 입력 시 **즉시** 기존 지원서 조회:

```typescript
const existing = await getApplicationByPhone(phone);
```

기존 지원서 발견 시:
```
이미 작성하신 지원서가 있어요!
📌 제목: [기존 제목] | 상태: [작성중/제출완료]

1. 이어서 수정하기
2. 처음부터 새로 작성하기
```

#### 6-2. 상세페이지 생성

상세페이지 템플릿 → [references/template.md](references/template.md) 참조

#### 6-3. 저장 (명시적 승인 필수)

**절대 자동 저장 금지.** 사용자가 명시적으로 말해야만 저장:
- "임시저장" / "저장" → 상태: `작성중`
- "최종 제출" / "제출" → 상태: `제출완료`

#### 6-4. 저장 완료 후 안내

```
✅ 지원서가 [임시저장/제출완료] 되었습니다!

📋 일정 안내
━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 스터디장 지원마감: 2026.2.12 (수) 오후 3:00
📅 선발결과 회신: 2026.2.20 (목) 오후 6:00
━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 마감일까지 수정 가능 (전화번호로 조회)
💡 선발 후 "작성중" 상태로 게시판 업로드 → 한 번 더 수정 기회
```

---

## Conversation Style

- 한 번에 한 질문만
- 답변에 공감 ("아 그거 진짜 좋은 주제네요!")
- **모든 질문에 예시 4개 제공** (맥락 + 바이브코딩 최적화)

### 예시 제공 규칙

```
[질문 내용]

예시:
A. [맥락에 맞는 구체적 예시 1]
B. [맥락에 맞는 구체적 예시 2]
C. [맥락에 맞는 구체적 예시 3]
D. [맥락에 맞는 구체적 예시 4]

원하시는 거 골라주시거나, 직접 작성해주셔도 돼요!
```

**예시 작성 기준:**
- 선택한 카테고리 + 도구에 맞게 최적화
- 바이브코딩 맥락 반영 (자연어로 만드는 결과물)
- 구체적이고 실제로 선택 가능한 수준
- A/B/C/D 또는 1/2/3/4로 선택 가능

## Error Handling

| 상황 | 처리 |
|------|------|
| 금지 표현 (모든 사람, 누구나) | 구체적 대상 요청 |
| 중급인데 사전학습 미입력 | AI가 추천 제공 |
| 중단 요청 (취소, 그만) | 저장 여부 확인 |

---

## Q&A 원본 저장 규칙

**선택지 치환 필수**: 사용자가 A/B/C/D 또는 1/2/3/4로 선택하면, 해당 선택지의 **실제 텍스트**로 치환하여 저장

```
# 대화 중
Q: 어떤 분들이 참여하면 좋을까요?
예시:
A. 코딩 경험 없이 업무 자동화하고 싶은 마케터
B. 노코드로 사이드프로젝트 만들고 싶은 직장인
C. AI로 반복 작업 줄이고 싶은 스타트업 대표
D. 개발자 없이 MVP 만들고 싶은 기획자

사용자: B

# Q&A 원본 저장 시
Q: 어떤 분들이 참여하면 좋을까요?
A: 노코드로 사이드프로젝트 만들고 싶은 직장인
```

**절대 금지**: "B" 또는 "2"만 저장 ❌

---

## Airtable 저장

`scripts/airtable.ts` 사용. 상세 사용법 → [references/airtable-usage.md](references/airtable-usage.md)

### ⚠️ 실행 방법 (중요!)

**절대 금지**: `bun -e "..."` 인라인 실행 ❌
- `generatedContent`에 백틱(`)이 포함되어 쉘 파싱 에러 발생

**필수**: 별도 스크립트 파일 생성 후 실행

```bash
# 1. 스크립트 파일 생성 (스킬 폴더 내 또는 tmp)
# 2. bun run 으로 실행
bun run /path/to/submit-application.ts
```

### 스크립트 예시

```typescript
// submit-application.ts
import { createApplication } from "/path/to/scripts/airtable.ts";

const app = {
  name: "홍길동",
  phone: "01012345678",
  email: "hong@example.com",
  bio: "• 지피터스 20기\n• Claude Code 경험",
  category: "개발&자동화",
  tool: "Claude Code",
  difficulty: "입문",
  generatedTitle: "제목",
  generatedContent: `# 마크다운 내용
백틱이 포함되어도 OK
`,
  qaRaw: "Q&A 원본 텍스트",
  aiTalkAvailability: "3/3(화) 개발&자동화, 3/4(수) 콘텐츠&지식",
  studyDays: "화요일, 수요일",
  offlineMeeting: "예",
};

const result = await createApplication(app, "작성중");
console.log("저장 완료:", result.url);
```

### API 함수

```typescript
import { createApplication, getApplicationByPhone, updateApplication } from "./scripts/airtable.ts";

// 조회
const existing = await getApplicationByPhone("01012345678");

// 생성 (임시저장)
await createApplication(app, "작성중");

// 생성 (최종 제출)
await createApplication(app, "제출완료");

// 업데이트
await updateApplication(existingId, { status: "제출완료" });
```

### CLI 테스트

```bash
bun run scripts/airtable.ts --test         # 연결 테스트
bun run scripts/airtable.ts --create-test  # 생성 테스트
```
