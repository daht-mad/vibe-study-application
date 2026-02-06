#!/usr/bin/env bun

const AIRTABLE_API_KEY = "patVBnYfJ6iOrQN08.e851189b98ca38b4ce1eb7c764ca08f04c830d97103cba88018c9e4944a3717b";
const AIRTABLE_BASE_ID = "app8McJxchG5oZ9d8";
const AIRTABLE_TABLE_ID = "tbl5tMLZDfzHbcmrO";

export interface StudyApplication {
  name: string;
  phone: string;
  email: string;
  bio: string;
  category: string;
  tool: string;
  difficulty: "입문" | "중급";
  prereqVideo?: string;
  prereqKnowledge?: string;
  generatedTitle: string;
  generatedContent: string;
  qaRaw: string;
  coLeaderName?: string;
  coLeaderPhone?: string;
  coLeaderEmail?: string;
  coLeaderBio?: string;
  aiTalkAvailability?: string;
  studyDays?: string;
  offlineMeeting?: string;
}

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

interface AirtableResponse {
  records: AirtableRecord[];
  error?: { type: string; message: string };
}

async function airtableRequest(
  method: string,
  path: string = "",
  body?: Record<string, any>
): Promise<any> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}${path}`;

  const options: RequestInit = {
    method,
    headers: {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Airtable error: ${data.error.message}`);
  }

  return data;
}

function validateApplication(app: StudyApplication): void {
  if (app.difficulty === "중급") {
    if (!app.prereqVideo || app.prereqVideo.trim() === "") {
      throw new Error("중급 난이도는 사전학습 영상 URL이 필수입니다.");
    }
    if (!app.prereqKnowledge || app.prereqKnowledge.trim() === "") {
      throw new Error("중급 난이도는 선수지식이 필수입니다.");
    }
  }
}

export type ApplicationStatus = "작성중" | "제출완료";

export async function createApplication(
  app: StudyApplication,
  status: ApplicationStatus = "제출완료"
): Promise<{ id: string; url: string }> {
  validateApplication(app);

  const fields: Record<string, any> = {
    "이름": app.name,
    "전화번호": app.phone,
    "이메일": app.email,
    "이력": app.bio,
    "카테고리": app.category,
    "바이브코딩 도구": app.tool,
    "난이도": app.difficulty === "입문" ? "입문 🐥" : "중급",
    "생성된 제목": app.generatedTitle,
    "상세페이지": app.generatedContent,
    "Q&A 원본": app.qaRaw,
    "상태": status,
    "제출일시": new Date().toISOString(),
  };

  if (app.difficulty === "중급") {
    fields["사전학습 영상"] = app.prereqVideo;
    fields["선수지식"] = app.prereqKnowledge;
  }

  if (app.coLeaderName) {
    fields["공동스터디장 이름"] = app.coLeaderName;
  }
  if (app.coLeaderPhone) {
    fields["공동스터디장 연락처"] = app.coLeaderPhone;
  }
  if (app.coLeaderEmail) {
    fields["공동스터디장 이메일"] = app.coLeaderEmail;
  }
  if (app.coLeaderBio) {
    fields["공동스터디장 이력"] = app.coLeaderBio;
  }

  if (app.aiTalkAvailability) {
    fields["AI토크 가능여부"] = app.aiTalkAvailability;
  }

  if (app.studyDays) {
    fields["스터디 요일"] = app.studyDays;
  }

  if (app.offlineMeeting) {
    fields["오프모임 참석여부"] = app.offlineMeeting;
  }

  const result: AirtableResponse = await airtableRequest("POST", "", {
    records: [{ fields }],
  });

  const record = result.records[0];
  return {
    id: record.id,
    url: `https://airtable.com/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}/${record.id}`,
  };
}

export async function updateApplication(
  recordId: string,
  updates: Partial<StudyApplication> & { bettermodeUrl?: string; status?: string }
): Promise<void> {
  const fieldMap: Record<string, string> = {
    name: "이름",
    phone: "전화번호",
    email: "이메일",
    bio: "이력",
    category: "카테고리",
    tool: "바이브코딩 도구",
    difficulty: "난이도",
    prereqVideo: "사전학습 영상",
    prereqKnowledge: "선수지식",
    generatedTitle: "생성된 제목",
    generatedContent: "상세페이지",
    qaRaw: "Q&A 원본",
    coLeaderName: "공동스터디장 이름",
    coLeaderPhone: "공동스터디장 연락처",
    coLeaderEmail: "공동스터디장 이메일",
    coLeaderBio: "공동스터디장 이력",
    aiTalkAvailability: "AI토크 가능여부",
    studyDays: "스터디 요일",
    offlineMeeting: "오프모임 참석여부",
    bettermodeUrl: "Bettermode URL",
    status: "상태",
  };

  const fields: Record<string, any> = {};
  for (const [key, value] of Object.entries(updates)) {
    const fieldName = fieldMap[key];
    if (fieldName && value !== undefined) {
      fields[fieldName] = value;
    }
  }

  await airtableRequest("PATCH", "", {
    records: [{ id: recordId, fields }],
  });
}

export async function getApplicationByPhone(phone: string): Promise<AirtableRecord | null> {
  const formula = encodeURIComponent(`{전화번호} = "${phone}"`);
  const result: AirtableResponse = await airtableRequest(
    "GET",
    `?filterByFormula=${formula}`
  );

  return result.records.length > 0 ? result.records[0] : null;
}

export async function testConnection(): Promise<void> {
  console.log("🔍 Airtable 연결 테스트 시작...\n");

  console.log("설정 확인:");
  console.log(`  BASE_ID: ${AIRTABLE_BASE_ID}`);
  console.log(`  TABLE_ID: ${AIRTABLE_TABLE_ID}`);
  console.log(`  API_KEY: ${AIRTABLE_API_KEY.substring(0, 10)}...\n`);

  try {
    const result: AirtableResponse = await airtableRequest(
      "GET",
      "?maxRecords=1"
    );

    console.log("✅ 연결 성공!");
    console.log(`  레코드 수: ${result.records.length}개 조회됨`);

    if (result.records.length > 0) {
      console.log(`  최근 레코드: ${result.records[0].fields["이름"] || "(이름 없음)"}`);
    }
  } catch (error) {
    console.error("\n❌ 연결 실패:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

export async function testCreateApplication(): Promise<void> {
  console.log("📝 지원서 생성 테스트 (입문)...\n");

  const testApp: StudyApplication = {
    name: "테스트 스터디장",
    phone: "010-1234-5678",
    email: "test@example.com",
    bio: "• 지피터스 19기 스터디장\n• Claude Code 1년 경험",
    category: "개발&자동화",
    tool: "Claude Code",
    difficulty: "입문",
    generatedTitle: "비개발자를 위한 Claude Code로 자동화 스킬 만들기",
    generatedContent: "# 테스트 스터디 상세페이지\n\n테스트용입니다.",
    qaRaw: "Q: 왜 이 스터디를 기획했나요?\nA: AI로 누구나 앱을 만들 수 있다는 걸 알리고 싶어서요.",
  };

  try {
    const result = await createApplication(testApp);
    console.log("✅ 생성 성공!");
    console.log(`  Record ID: ${result.id}`);
    console.log(`  URL: ${result.url}`);
  } catch (error) {
    console.error("\n❌ 생성 실패:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.includes("--test")) {
    testConnection();
  } else if (args.includes("--create-test")) {
    testCreateApplication();
  } else {
    console.log("사용법:");
    console.log("  bun run airtable.ts --test         # 연결 테스트");
    console.log("  bun run airtable.ts --create-test  # 지원서 생성 테스트");
    console.log("\n또는 스크립트에서 import하여 사용:");
    console.log('  import { createApplication } from "./airtable.ts";');
  }
}
