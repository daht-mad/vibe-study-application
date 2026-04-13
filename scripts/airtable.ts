#!/usr/bin/env bun

const AIRTABLE_API_KEY = "patVBnYfJ6iOrQN08.e851189b98ca38b4ce1eb7c764ca08f04c830d97103cba88018c9e4944a3717b";
const AIRTABLE_BASE_ID = "app8McJxchG5oZ9d8";
const AIRTABLE_TABLE_ID = "tbl5tMLZDfzHbcmrO";
const COHORT_TABLE_ID = "tblLs3KrhQHm1sxjQ";

export interface StudyApplication {
  name: string;
  phone: string;
  email: string;
  bio: string;
  category: string;
  tool: string;
  difficulty: "입문" | "중급" | "고급";
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
  studyDays?: string | string[];
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
  body?: Record<string, any>,
  tableId: string = AIRTABLE_TABLE_ID
): Promise<any> {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}${path}`;

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
  if (app.difficulty === "중급" || app.difficulty === "고급") {
    if (!app.prereqVideo || app.prereqVideo.trim() === "") {
      throw new Error(`${app.difficulty} 난이도는 사전학습 영상 URL이 필수입니다.`);
    }
    if (!app.prereqKnowledge || app.prereqKnowledge.trim() === "") {
      throw new Error(`${app.difficulty} 난이도는 선수지식이 필수입니다.`);
    }
  }
}

export type ApplicationStatus = "작성중" | "제출완료";

export async function createApplication(
  app: StudyApplication,
  status: ApplicationStatus = "제출완료"
): Promise<{ id: string; url: string }> {
  const { allowed, cohort, message } = await checkApplicationDeadline();
  if (!allowed) {
    throw new Error(message);
  }

  validateApplication(app);

  const fields: Record<string, any> = {
    "이름": app.name,
    "전화번호": app.phone,
    "이메일": app.email,
    "이력": app.bio,
    "카테고리": app.category,
    "바이브코딩 도구": app.tool,
    "난이도": app.difficulty === "입문" ? "입문 🐥" : app.difficulty,
    "생성된 제목": app.generatedTitle,
    "상세페이지": app.generatedContent,
    "Q&A 원본": app.qaRaw,
    "상태": status,
    "제출일시": new Date().toISOString(),
  };

  // 현재 접수 중인 기수를 링크 필드로 연결
  if (cohort) {
    fields["기수"] = [cohort.recordId];
  }

  if (app.difficulty === "중급" || app.difficulty === "고급") {
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
    fields["스터디 요일"] = Array.isArray(app.studyDays)
      ? app.studyDays
      : app.studyDays.split(",").map((s: string) => s.trim());
  }

  if (app.offlineMeeting) {
    fields["오프모임 참석여부"] = app.offlineMeeting;
  }

  const result: AirtableResponse = await airtableRequest("POST", "", {
    records: [{ fields }],
    typecast: true,
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
      if (key === "studyDays") {
        fields[fieldName] = Array.isArray(value)
          ? value
          : (value as string).split(",").map((s: string) => s.trim());
      } else {
        fields[fieldName] = value;
      }
    }
  }

  await airtableRequest("PATCH", "", {
    records: [{ id: recordId, fields }],
    typecast: true,
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

/** 현재 기수의 제출완료 지원서 목록을 가져온다 */
export async function getSubmittedApplications(): Promise<{ title: string; category: string; difficulty: string; tool: string }[]> {
  const cohort = await getActiveCohort();
  if (!cohort) return [];

  const formula = encodeURIComponent(`{상태} = "제출완료"`);
  const result: AirtableResponse = await airtableRequest(
    "GET",
    `?filterByFormula=${formula}`
  );

  return result.records
    .filter((r) => {
      const gisu = r.fields["기수"];
      if (!gisu) return false;
      // 링크 필드는 레코드 ID 배열로 올 수 있음
      const gisuIds = Array.isArray(gisu) ? gisu : [gisu];
      return gisuIds.includes(cohort.recordId);
    })
    .map((r) => ({
      title: r.fields["생성된 제목"] || "(제목 없음)",
      category: r.fields["카테고리"] || "",
      difficulty: r.fields["난이도"] || "",
      tool: r.fields["바이브코딩 도구"] || "",
    }));
}

// --- 기수관리 테이블 동적 조회 ---

export interface CohortInfo {
  recordId: string;
  name: string;
  number: number;
  deadline: Date;
  selectionDate: Date | null;
  startDate: Date | null;
}

export interface GisuSchedule {
  기수명: string;
  기수: number;
  스터디장지원시작일?: string;
  스터디장지원마감일?: string;
  스터디장선발회신일?: string;
  모집시작일?: string;
  모집마감일?: string;
  스터디시작일?: string;
  스터디종료일?: string;
  스터디시간?: string;
  "1주차오프모임"?: string;
  AI토크_Day1?: string;
  AI토크_Day1_주제?: string;
  AI토크_Day2?: string;
  AI토크_Day2_주제?: string;
  AI토크_Day3?: string;
  AI토크_Day3_주제?: string;
  recordId?: string;
}

async function fetchCohortRecords(): Promise<AirtableRecord[]> {
  const result: AirtableResponse = await airtableRequest(
    "GET",
    "",
    undefined,
    COHORT_TABLE_ID
  );
  return result.records;
}

/** 현재 접수 가능한 기수를 찾는다 (지원시작일 <= now <= 지원마감일) */
export async function getCurrentGisu(): Promise<GisuSchedule | null> {
  const records = await fetchCohortRecords();
  const now = new Date();

  for (const record of records) {
    const f = record.fields;
    if (!f["스터디장지원마감일"]) continue;
    const deadline = new Date(f["스터디장지원마감일"]);
    const start = f["스터디장지원시작일"] ? new Date(f["스터디장지원시작일"]) : new Date(0);
    if (start <= now && now <= deadline) {
      return { ...f, recordId: record.id } as GisuSchedule;
    }
  }

  return null;
}

/** 다음 예정된 기수를 찾는다 (지원시작일이 미래인 것 중 가장 빠른 것) */
export async function getNextGisu(): Promise<GisuSchedule | null> {
  const records = await fetchCohortRecords();
  const now = new Date();

  const future = records
    .filter((r) => {
      const start = r.fields["스터디장지원시작일"] ? new Date(r.fields["스터디장지원시작일"]) : null;
      return start && start > now;
    })
    .sort((a, b) =>
      new Date(a.fields["스터디장지원시작일"]).getTime() - new Date(b.fields["스터디장지원시작일"]).getTime()
    );

  return future.length > 0 ? { ...future[0].fields, recordId: future[0].id } as GisuSchedule : null;
}

export async function getActiveCohort(): Promise<CohortInfo | null> {
  // 먼저 접수 중인 기수를 찾는다
  const current = await getCurrentGisu();
  if (current && current.스터디장지원마감일) {
    return {
      recordId: current.recordId || "",
      name: current.기수명 || `${current.기수}기`,
      number: current.기수,
      deadline: new Date(current.스터디장지원마감일),
      selectionDate: current.스터디장선발회신일 ? new Date(current.스터디장선발회신일) : null,
      startDate: current.스터디시작일 ? new Date(current.스터디시작일) : null,
    };
  }

  // 접수 중인 기수가 없으면 가장 가까운 마감일 기수를 반환
  const records = await fetchCohortRecords();
  const now = new Date();
  let closest: { record: AirtableRecord; deadline: Date; diff: number } | null = null;

  for (const record of records) {
    const deadlineStr = record.fields["스터디장지원마감일"];
    if (!deadlineStr) continue;
    const deadline = new Date(deadlineStr);
    const diff = Math.abs(deadline.getTime() - now.getTime());
    if (!closest || diff < closest.diff) {
      closest = { record, deadline, diff };
    }
  }

  if (!closest) return null;

  const selectionStr = closest.record.fields["스터디장선발회신일"];
  const startStr = closest.record.fields["스터디시작일"];
  return {
    recordId: closest.record.id,
    name: closest.record.fields["기수명"] || `${closest.record.fields["기수"]}기`,
    number: closest.record.fields["기수"],
    deadline: closest.deadline,
    selectionDate: selectionStr ? new Date(selectionStr) : null,
    startDate: startStr ? new Date(startStr) : null,
  };
}

export async function checkApplicationDeadline(): Promise<{
  allowed: boolean;
  cohort: CohortInfo | null;
  message: string;
}> {
  const cohort = await getActiveCohort();

  if (!cohort) {
    return {
      allowed: false,
      cohort: null,
      message: "현재 스터디장 지원 접수 기간이 아닙니다. 모든 기수의 지원 마감일이 지났습니다.",
    };
  }

  const now = new Date();
  if (now > cohort.deadline) {
    return {
      allowed: false,
      cohort,
      message: `${cohort.name} 스터디장 지원이 마감되었습니다. (마감: ${formatKST(cohort.deadline)})`,
    };
  }

  return {
    allowed: true,
    cohort,
    message: `${cohort.name} 스터디장 지원 접수 중입니다. (마감: ${formatKST(cohort.deadline)})`,
  };
}

function formatKST(date: Date): string {
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const m = d.getMonth() + 1;
  const dd = d.getDate();
  const day = days[d.getDay()];
  const h = d.getHours();
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${d.getFullYear()}.${m}.${dd} (${day}) ${ampm} ${h12}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export async function checkDeadline(): Promise<void> {
  const current = await getCurrentGisu();

  if (current) {
    console.log(`✅ 접수 가능 — ${current.기수명}`);
    console.log(`  📅 지원마감: ${formatDate(current.스터디장지원마감일!)}`);
    if (current.스터디장선발회신일) {
      console.log(`  📅 선발회신: ${formatDate(current.스터디장선발회신일)}`);
    }
    if (current.스터디시작일) {
      console.log(`  📅 스터디시작: ${current.스터디시작일}`);
    }
    if (current["1주차오프모임"]) {
      console.log(`  📅 오프모임: ${current["1주차오프모임"]}`);
    }
    return;
  }

  const next = await getNextGisu();
  if (next) {
    console.log(`❌ 접수 마감 — 현재 접수 중인 기수가 없습니다.`);
    console.log(`  📅 다음 기수: ${next.기수명}`);
    if (next.스터디장지원시작일) {
      console.log(`  📅 지원 시작 예정: ${next.스터디장지원시작일}`);
    }
  } else {
    console.log(`❌ 접수 마감 — 현재 접수 중인 기수가 없고, 예정된 기수도 없습니다.`);
  }
}

export async function getScheduleMessage(gisu: GisuSchedule): Promise<string> {
  const lines = [
    `📋 일정 안내 — ${gisu.기수명}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
  ];
  if (gisu.스터디장지원마감일) lines.push(`📅 스터디장 지원마감: ${formatDate(gisu.스터디장지원마감일)}`);
  if (gisu.스터디장선발회신일) lines.push(`📅 선발결과 회신: ${formatDate(gisu.스터디장선발회신일)}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💡 마감일까지 수정 가능 (전화번호로 조회)`);
  lines.push(`💡 선발 후 "작성중" 상태로 게시판 업로드 → 한 번 더 수정 기회`);
  return lines.join("\n");
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

  if (args.includes("--check-deadline")) {
    checkDeadline();
  } else if (args.includes("--list")) {
    const apps = await getSubmittedApplications();
    if (apps.length === 0) {
      console.log("📋 현재 기수에 제출된 지원서가 없습니다.");
    } else {
      console.log(`📋 현재 기수 제출완료 지원서 (${apps.length}건):\n`);
      for (const app of apps) {
        console.log(`  • ${app.category} / ${app.difficulty} / ${app.tool} — "${app.title}"`);
      }
    }
  } else if (args.includes("--test")) {
    testConnection();
  } else if (args.includes("--create-test")) {
    testCreateApplication();
  } else {
    console.log("사용법:");
    console.log("  bun run airtable.ts --check-deadline  # 접수 가능 여부 확인");
    console.log("  bun run airtable.ts --list            # 현재 기수 제출 지원서 목록");
    console.log("  bun run airtable.ts --test            # 연결 테스트");
    console.log("  bun run airtable.ts --create-test     # 지원서 생성 테스트");
    console.log("\n또는 스크립트에서 import하여 사용:");
    console.log('  import { createApplication, getCurrentGisu, checkApplicationDeadline, getSubmittedApplications } from "./airtable.ts";');
  }
}
