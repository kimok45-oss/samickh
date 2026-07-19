// 인사말 — SiteContent greeting_body 전문 + philosophy(경영이념) 인용 플레이트.
// 원문 본문은 로고 이미지 뒤에 "는 …"으로 이어지던 문장 — 렌더 시 회사명을 앞에 복원한다(원문 불변).
import { getLang } from "@/lib/lang";
import { getContents } from "@/lib/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { Reveal } from "@/components/motion/motion-primitives";

export const metadata = pageMetadata({
  title: "인사말",
  description: "삼익유공압주식회사 인사말 — 1998년 설립 이후 유공압 실린더 분야의 연구개발.",
  path: "/company/greeting",
});

export default async function GreetingPage() {
  const lang = await getLang();
  const c = await getContents(["greeting_body", "philosophy", "company_name"], lang);
  const companyName = c.company_name || "삼익유공압주식회사";
  const paragraphs = (c.greeting_body ?? "").split(/\n{2,}/).filter((p) => p.trim());
  // 경영이념 "품질은 제일, 경영은 내실, 거래는 신용, 조직은 인화" → 4구 플레이트
  const tenets = (c.philosophy ?? "").split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div>
      <h1 className="font-mono text-[clamp(1.7rem,3.4vw,2.4rem)] font-semibold tracking-tight text-ink">
        {lang === "ko" ? "인사말" : "Greeting"}
      </h1>

      {/* 경영이념 인용 플레이트 */}
      {tenets.length > 0 && (
        <Reveal className="mt-10">
          <figure className="border border-line">
            <div className="grid grid-cols-2 gap-px bg-line sm:grid-cols-4">
              {tenets.map((tn) => (
                <div key={tn} className="bg-bg-raised px-4 py-6 sm:px-5 sm:py-8">
                  <span className="block text-[15px] font-semibold leading-snug text-ink sm:text-[16.5px]">{tn}</span>
                </div>
              ))}
            </div>
            <figcaption className="border-t border-line px-4 py-2.5 font-mono text-[10.5px] tracking-[0.12em] text-ink-faint">
              {lang === "ko" ? "경영이념 — 인사말 원문" : "MANAGEMENT PHILOSOPHY — FROM THE ORIGINAL GREETING"}
            </figcaption>
          </figure>
        </Reveal>
      )}

      <Reveal className="mt-12 max-w-[72ch]">
        <div className="space-y-6 text-[15px] leading-[1.85] text-ink-dim">
          {paragraphs.map((p, i) => (
            <p key={i}>
              {p.startsWith("는") ? (
                <>
                  <strong className="font-semibold text-ink">{companyName}</strong>
                  {p}
                </>
              ) : (
                p
              )}
            </p>
          ))}
        </div>
        <p className="mt-10 text-[14px] text-ink-faint">
          {companyName} {lang === "ko" ? "임직원 일동" : "— All executives and staff"}
        </p>
      </Reveal>

      {/* 공장 실사 — 원문 인사말 페이지 소속 자산(company_img6·7: 가공동·조립동) */}
      <Reveal className="mt-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { src: "/uploads/orig/brand/factory-machining.jpg", ko: "가공동", en: "Machining shop" },
            { src: "/uploads/orig/brand/factory-assembly.jpg", ko: "조립동", en: "Assembly shop" },
          ].map((f) => (
            <figure key={f.src}>
              <div className="overflow-hidden border border-line bg-bg-panel">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.src} alt={lang === "ko" ? f.ko : f.en} className="w-full object-cover" loading="lazy" />
              </div>
              <figcaption className="mt-2 font-mono text-[10.5px] tracking-[0.12em] text-ink-faint">
                {(lang === "ko" ? f.ko : f.en).toUpperCase()} — {lang === "ko" ? "원본 자산" : "ORIGINAL ASSET"}
              </figcaption>
            </figure>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
