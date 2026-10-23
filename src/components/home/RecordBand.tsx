// 홈 S5 «실린더가 들어간 곳» — 연혁 중 제작·개발·등록 기록을 납품처 중심으로 조판한 잉크 밴드.
//
// 왜 이 형태인가: 바로 앞 S2 «실린더 10계열» 이 가는 선 원장인데 예전 S4도 똑같이 가는 선 원장이었다.
// 같은 사실을 괘선 목록 대신 ③ 배경 전환(페이지에서 유일한 잉크 면) + ② 대형 활자(고객사 이름이 곧
// 그래픽) + ④ 액자형 등록 각인으로 다시 조판한다.
//
// 원문 충실: 연혁 원문(DB History.text / textEn)은 한 글자도 바꾸지 않는다.
// 화면에서 하는 일은 (a) 앞머리 납품처 토큰을 떼어 표제로 올리고 (b) 나머지 원문을 그대로 붙이는 것뿐.
// 토큰이 안 맞으면 원문 전체를 그대로 표제에 올린다(폴백) — 문장을 지어내지 않는다.
//
// 문구 소유권: 이 섹션의 UI 문구는 전부 아래 T 하나가 소유한다(리포 관례 — src/lib/i18n.ts 주석 참조).
// 연혁 문장 자체는 DB(History)가 소유한다 — 여기서 복제하지 않는다.
//
// 2026-10-22 오너 '나머지 다 진행':
//  · SMK-07 — 위 «제작 범위» 흰 시트와 이 잉크 밴드 사이 96px 빈 띠(mt-16/md:mt-24)를 없앴다(시트 아래 굵은 괘선에 바로 붙음).
//  · SMK-24 — 폰에서 '연혁 전체' 링크가 기록 목록 앞(각인 바로 아래)에 끼어 있던 것을 폰에서만 목록 끝으로. 폰 목록 간격도 조금 좁힘.
//  · 1-3-3 — 한글 라벨(머리말·각인·기점)의 모노·넓은 자간을 본문 글꼴로, 제작 메모('문장은 회사 원문 그대로입니다')와 반복 화살표를 뺌.
import Link from "next/link";
import type { Lang } from "@/lib/lang";

export type RecordRow = { id: number; year: number; text: string; textEn: string | null };

/** 연혁 원문 앞머리에 실제로 적혀 있는 납품처 토큰 → 표제 표기.
 *
 *  ⚠ 이 표는 DB 원문과 결합돼 있다. match 는 History.text 앞머리와 글자 그대로 일치해야 한다(조사 포함).
 *  관리자가 관리자화면에서 연혁 문장을 고치면 토큰이 어긋나고, 그 행은 자동으로 폴백으로 내려가
 *  원문 전체가 표제로 나온다(깨지지 않는다 — 다만 대형 활자 연출은 그 행에서만 사라진다).
 *  즉 이 상수는 "연출을 켜는 화이트리스트"이지 데이터가 아니다. 문장이 바뀌면 여기 match 도 같이 고친다.
 *  ko/en 표기는 연혁 원문·주요거래업체(Client) 대장에서 그대로 가져온 것 — 새로 지어내지 않는다. */
const PARTY: { match: string; ko: string; en: string }[] = [
  { match: "ARABIAN PIPE", ko: "ARABIAN PIPE", en: "ARABIAN PIPE" },
  { match: "현대중공업 POSCO", ko: "현대중공업 · POSCO", en: "Hyundai Heavy Industries · POSCO" },
  { match: "세원셀론텍 POSCO", ko: "세원셀론텍 · POSCO", en: "Sewon Cellontech · POSCO" },
  { match: "라인호㈜", ko: "라인호㈜", en: "Rhine-Ho" },
  { match: "한국타이어", ko: "한국타이어", en: "Hankook Tire" },
  { match: "두산인프라코어", ko: "두산인프라코어", en: "Doosan Infracore" },
  { match: "금호타이어", ko: "금호타이어", en: "Kumho Tire" },
  { match: "대우중공업과", ko: "대우중공업", en: "Daewoo Heavy Industries" },
];

const T = {
  ko: {
    kicker: (a: number, b: number, n: number) => `${a} – ${b} · 제작·개발·등록 ${n}건`,
    head: "실린더가 들어간 곳",
    lead: "연혁에 남은 제작·개발·등록 기록입니다.",
    stampParty: "포항종합제철㈜",
    stampLead: "공급업체 등록",
    stampGrade: "A 등급",
    origin: "제작 개시",
    link: "연혁 전체",
  },
  en: {
    kicker: (a: number, b: number, n: number) => `${a} – ${b} · ${n} records of production, development, registration`,
    head: "Where the Cylinders Went",
    lead: "Production, development and registration records from the company history.",
    stampParty: "POSCO (Pohang Iron & Steel)",
    stampLead: "Registered supplier",
    stampGrade: "Grade A",
    origin: "Production began",
    link: "Full history",
  },
};

function split(text: string) {
  for (const p of PARTY) {
    if (text.startsWith(p.match)) return { party: p, rest: text.slice(p.match.length).trim() };
  }
  return null;
}

export default function RecordBand({ rows, lang }: { rows: RecordRow[]; lang: Lang }) {
  const t = T[lang];
  const en = lang === "en";

  // 1987 포항종합제철 공급업체 등록(A등급) — 각인 액자로 분리
  const stamp = rows.find((r) => r.text.includes("공급업체 등록")) ?? null;
  // 1987 삼익 THK 에서 제작·판매 개시 — 밴드의 기점 문장
  const origin = rows.find((r) => r.text.startsWith("삼익 THK")) ?? null;

  const entries = rows
    .filter((r) => r.id !== stamp?.id && r.id !== origin?.id)
    .map((r) => ({ row: r, s: split(r.text) }));

  const years = rows.map((r) => r.year);
  const minY = Math.min(...years);
  const maxY = Math.max(...years);

  return (
    // 배경 전환 — 페이지에서 유일한 잉크 면. 도면지가 뒤집힌 자리 = 기록.
    // 풀블리드라 홈의 max-w 컨테이너 바깥(최상위)에 놓는다.
    <section className="bg-ink">
      <div className="mx-auto max-w-[1280px] px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-16">
          {/* ── 좌: 표제 + 등록 각인(액자) ── */}
          <div>
            <div className={en ? "tnum font-mono text-[11.5px] tracking-[0.14em] text-chrome" : "tnum text-[13px] text-chrome"}>
              {t.kicker(minY, maxY, rows.length)}
            </div>
            <h2 className="mt-4 text-[clamp(1.6rem,3.2vw,2.4rem)] font-semibold leading-[1.2] tracking-tight text-bg">
              {t.head}
            </h2>
            <p className="mt-4 max-w-[36ch] text-[14px] leading-relaxed text-[#b6bdc2]">{t.lead}</p>

            {stamp && (
              // ④ 액자형 — 1987년 등록 사실을 각인판으로. 모서리 지침만 레드(그래픽 전용).
              <div className="relative mt-10 border border-[#4a5157] px-6 py-7">
                <span aria-hidden className="absolute -left-px -top-px block h-4 w-4 border-l-2 border-t-2 border-red-live" />
                <span aria-hidden className="absolute -bottom-px -right-px block h-4 w-4 border-b-2 border-r-2 border-red-live" />
                <span className="tnum block font-mono text-[clamp(2rem,4vw,2.9rem)] font-bold leading-none text-bg">
                  {stamp.year}
                </span>
                <span className="mt-4 block text-[15.5px] font-semibold leading-snug text-bg">{t.stampParty}</span>
                <span className={en ? "mt-1 block font-mono text-[11.5px] tracking-[0.1em] text-chrome" : "mt-1 block text-[13px] text-chrome"}>{t.stampLead}</span>
                <span className="mt-4 block border-t border-[#4a5157] pt-3 text-[19px] font-bold tracking-tight text-bg">
                  {t.stampGrade}
                </span>
              </div>
            )}

            {/* 데스크톱: 왼쪽 칸 아래(예전 그대로). 폰: 목록 끝의 같은 링크가 대신한다(SMK-24) */}
            <Link
              href="/company/history"
              className="mt-8 hidden items-center gap-2 border-b border-[#565d64] pb-1 text-[13.5px] text-[#b6bdc2] transition-colors hover:border-bg hover:text-bg md:inline-flex"
            >
              {t.link}
            </Link>
          </div>

          {/* ── 우: 납품처 이름이 곧 그래픽 ── */}
          <div>
            {origin && (
              <div className="mb-10 border-b border-[#343a3f] pb-8">
                <div className={en ? "tnum font-mono text-[12.5px] tracking-[0.12em] text-chrome" : "tnum text-[13px] text-chrome"}>
                  {origin.year} · {t.origin}
                </div>
                <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-[#b6bdc2]">
                  {en && origin.textEn ? origin.textEn : origin.text}
                </p>
              </div>
            )}

            <ul className="grid gap-x-10 gap-y-7 sm:grid-cols-2 sm:gap-y-9">
              {entries.map(({ row, s }) => {
                // 토큰이 안 맞으면 원문 전체를 표제로 올린다(폴백) — 문장을 지어내지 않는다.
                const full = en ? (row.textEn ?? row.text) : row.text;
                const heading = s ? (en ? s.party.en : s.party.ko) : full;
                const detail = s ? (en ? full : s.rest) : "";
                return (
                  <li key={row.id}>
                    {/* 지침 눈금 — 괘선 대신 짧은 지시선(도면 문법) */}
                    <span aria-hidden className="mb-3 block h-px w-7 bg-red-live" />
                    <span className="tnum block font-mono text-[12.5px] tracking-[0.12em] text-chrome">{row.year}</span>
                    <span className="mt-1.5 block text-[clamp(1.15rem,2.1vw,1.6rem)] font-semibold leading-[1.25] tracking-tight text-bg">
                      {heading}
                    </span>
                    {detail && (
                      <span className="mt-2 block max-w-[34ch] text-[13px] leading-relaxed text-[#b6bdc2]">{detail}</span>
                    )}
                  </li>
                );
              })}
            </ul>
            <Link
              href="/company/history"
              className="mt-10 inline-flex items-center gap-2 border-b border-[#565d64] pb-1 text-[13.5px] text-[#b6bdc2] transition-colors hover:border-bg hover:text-bg md:hidden"
            >
              {t.link}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
