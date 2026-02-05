# Vibe Study Application

> 바이브코딩 스터디 지원서 작성 도우미

스터디장이 AI와 대화하며 스터디 상세페이지를 자동으로 생성하는 Claude Code / OpenCode 스킬입니다.

---

## 왜 바이브코딩인가?

### 배경

지피터스 커뮤니티에서 20기 스터디를 준비하면서 고민이 있었습니다.

기존 스터디들은 "ChatGPT 활용법", "Notion AI 써보기", "Make로 자동화하기" 같은 주제가 많았어요. 물론 좋은 주제들이지만, **진짜 AI 시대의 생산성**은 다른 곳에 있다고 생각했습니다.

### 바이브코딩이란?

> "코드를 한 줄도 직접 쓰지 않고, 자연어로 결과물을 만드는 것"

2025년, AI는 단순히 "도와주는 도구"를 넘어서 **직접 만들어주는 파트너**가 되었습니다.

- **CLI 바이브코딩**: Cursor, Claude Code, OpenCode
- **에이전트 기반**: OpenClaw, Lindy, Manus  
- **노코드 AI**: Antigravity, Google Build

ChatGPT에게 "이거 어떻게 해?"라고 묻는 것과, Claude Code에게 "이거 만들어줘"라고 말하는 것은 완전히 다른 경험입니다.

### 주제 전환의 맥락

- "GPT로 글쓰기" → "Antigravity에서 md 노트 모아 전자책 출판"
- "Make로 자동화" → "Claude Code 스킬로 워크플로우 자동화"
- "노코드로 MVP" → "Cursor로 실제 작동하는 앱 만들기"

스터디장들이 기존에 기획한 주제를 **바이브코딩 관점으로 재해석**할 수 있도록, 이 스킬이 도와줍니다.

---

## 스터디장 지원 시작하기

### 1. 준비물

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) 또는 [OpenCode](https://github.com/opencode-ai/opencode) 설치
- 스터디 주제 아이디어 (완벽하지 않아도 됩니다!)

### 2. 스킬 설치

전역 스킬 폴더에 클론하세요:

```bash
# Claude Code
git clone https://github.com/daht-mad/vibe-study-application.git ~/.claude/skills/vibe-study-application

# OpenCode
git clone https://github.com/daht-mad/vibe-study-application.git ~/.opencode/skills/vibe-study-application
```

### 3. 지원서 작성 시작

아무 폴더에서나 Claude Code 또는 OpenCode를 실행하세요:

```bash
# Claude Code
claude

# OpenCode  
opencode
```

그리고 이렇게 말하세요:

```
스터디 지원서 작성하고 싶어요
```

또는 슬래시 명령어 사용:

```
/vibe-study-application
```

### 4. 인터뷰 진행

AI가 자연스럽게 질문합니다:

1. **주제 확인**: "어떤 스터디를 기획하고 계세요?"
2. **카테고리 선택**: 개발&자동화 / 콘텐츠&지식 / 업무&비즈니스
3. **바이브코딩 도구 선택**: 주제에 맞는 도구 추천
4. **난이도 선택**: 입문 vs 중급
5. **상세 인터뷰**: 대상, 문제, 결과물, 커리큘럼
6. **지원자 정보**: 성함, 연락처, 이력

### 5. 상세페이지 자동 생성

인터뷰가 끝나면 AI가 상세페이지를 자동으로 생성합니다.
확인 후 "제출"이라고 말하면 Airtable에 저장됩니다.

---

## 스킬 구조

```
vibe-study-application/
├── SKILL.md              # 메인 스킬 파일
├── scripts/
│   └── airtable.ts       # Airtable API 스크립트
└── references/
    ├── examples.md       # 바이브코딩 전환 예시
    ├── template.md       # 상세페이지 템플릿
    └── airtable-usage.md # API 사용법
```

---

## 일정 안내

- **스터디장 지원 마감**: 2026.2.12 (수) 오후 3:00
- **선발 결과 회신**: 2026.2.20 (목) 오후 6:00

마감일까지 언제든 수정 가능 (전화번호로 조회)
선발 후 "작성중" 상태로 게시판 업로드 → 한 번 더 수정 기회

---

## 스터디장님께

20기 바이브코딩 스터디에 관심 가져주셔서 감사합니다.

좋은 스터디 기획해주시면, 저희가 최대한 도와드리겠습니다. 잘 부탁드립니다!

---

**[GPTers](https://gpters.org) Community**
