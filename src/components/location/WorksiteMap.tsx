import { buildDirectionsUrl, providersForLocale, PROVIDER_LABEL, type Worksite, type Provider } from "@/lib/directions";
import { CopyButton } from "./CopyButton";

// 약도(이미지 또는 SVG 라인아트) + 클릭 시 길찾기 + 주소 카드.
// 서버 컴포넌트(복사 버튼만 클라). 약도 전체가 <a>라 클릭하면 기본 제공자 길찾기가 새 탭으로 열린다.
export function WorksiteMap({
  site,
  locale = "ko",
  mode = "image",
  providers,
}: {
  site: Worksite;
  locale?: string;
  mode?: "image" | "svg";
  providers?: Provider[];
}) {
  const lang = locale.startsWith("ko") ? "ko" : "en";
  const provs = providers ?? providersForLocale(locale);
  const primary = provs[0] ?? "naver";
  const primaryUrl = buildDirectionsUrl(primary, site);
  const cue = lang === "ko" ? "길찾기" : "Directions";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
      {/* 약도 — 클릭하면 기본 길찾기 새 탭 (이 스킬의 핵심 동작) */}
      <a
        href={primaryUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${site.name} ${PROVIDER_LABEL[primary][lang]} ${lang === "ko" ? "새 창에서 열기" : "(opens in new tab)"}`}
        className="group relative block overflow-hidden rounded-[8px] border focus-visible:outline focus-visible:outline-2"
        style={{ borderColor: "var(--color-line,#e3e7ec)" }}
      >
        {mode === "image" && site.mapImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={site.mapImage} alt={`${site.name} ${lang === "ko" ? "약도" : "map"}`} loading="lazy" className="aspect-[16/10] w-full object-cover" />
        ) : (
          <SchematicMap site={site} lang={lang} />
        )}
        <span
          className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-medium text-white opacity-95 shadow-sm"
          style={{ background: "var(--color-accent,#2358a8)" }}
        >
          {cue} →
        </span>
      </a>

      {/* 주소 카드 + 길찾기 버튼들 */}
      <div className="rounded-[8px] border p-5 sm:p-6" style={{ borderColor: "var(--color-line,#e3e7ec)" }}>
        <div className="text-[16px] font-semibold" style={{ color: "var(--color-ink,#14171a)" }}>
          {site.name}
        </div>
        <dl className="mt-4 space-y-3 text-[13.5px]">
          <Row label={lang === "ko" ? "주소" : "Address"} value={site.address} copy copyLabel={lang === "ko" ? "복사" : "Copy"} />
          {/* "053-591-9931~2" 같은 대표번호 범위 표기는 첫 번호로만 발신(~ 뒤 숫자가 붙으면 잘못된 번호가 된다) */}
          {site.tel && <Row label={lang === "ko" ? "전화" : "Tel"} value={site.tel} href={`tel:${site.tel.split("~")[0].replace(/[^0-9+]/g, "")}`} />}
          {site.fax && <Row label={lang === "ko" ? "팩스" : "Fax"} value={site.fax} />}
          {site.transit && <Row label={lang === "ko" ? "교통" : "Transit"} value={site.transit} />}
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          {provs.map((p) => (
            <a
              key={p}
              href={buildDirectionsUrl(p, site)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-[5px] px-3.5 py-2 text-[13px] font-medium text-white transition-transform hover:scale-[1.02]"
              style={{ background: "var(--color-accent,#2358a8)" }}
            >
              {PROVIDER_LABEL[p][lang]} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, href, copy, copyLabel }: { label: string; value: string; href?: string; copy?: boolean; copyLabel?: string }) {
  return (
    <div className="grid grid-cols-[52px_1fr] gap-3">
      <dt className="shrink-0 pt-0.5 text-[12px]" style={{ color: "var(--color-muted,#67727c)" }}>
        {label}
      </dt>
      <dd className="flex flex-wrap items-center gap-2" style={{ color: "var(--color-ink-2,#3f4d5a)" }}>
        {href ? (
          <a href={href} className="hover:underline">
            {value}
          </a>
        ) : (
          <span>{value}</span>
        )}
        {copy && <CopyButton text={value} label={copyLabel} />}
      </dd>
    </div>
  );
}

// 외부 의존 0 라인아트 약도. landmarks의 x/y(%)로 주변 표시를 배치한다(스샷의 영등포 약도처럼).
// 진짜 약도 이미지가 있으면 mode="image"가 더 좋다 — 이건 이미지 없을 때의 깔끔한 대체.
function SchematicMap({ site, lang }: { site: Worksite; lang: "ko" | "en" }) {
  const lm = site.landmarks ?? [];
  return (
    <svg viewBox="0 0 400 250" className="aspect-[16/10] w-full" role="img" aria-label={`${site.name} ${lang === "ko" ? "약도" : "map"}`} style={{ background: "var(--color-paper-2,#eef1f4)" }}>
      <g stroke="var(--color-line,#d8dde3)" strokeWidth="13" fill="none" strokeLinecap="round">
        <line x1="-10" y1="150" x2="410" y2="150" />
        <line x1="150" y1="-10" x2="150" y2="260" />
        <line x1="285" y1="-10" x2="285" y2="260" />
      </g>
      {lm.map((m) => (
        <g key={m.name}>
          <circle cx={(m.x / 100) * 400} cy={(m.y / 100) * 250} r="3" fill="var(--color-muted,#9aa6b2)" />
          <text x={(m.x / 100) * 400 + 6} y={(m.y / 100) * 250 + 4} fontSize="9" fill="var(--color-muted,#67727c)">
            {m.name}
          </text>
        </g>
      ))}
      <g>
        <circle cx="200" cy="120" r="6" fill="var(--color-accent,#2358a8)" />
        <circle cx="200" cy="120" r="11" fill="none" stroke="var(--color-accent,#2358a8)" strokeWidth="1.5" opacity="0.4" />
        <text x="212" y="124" fontSize="11" fontWeight="600" fill="var(--color-ink,#14171a)">
          {site.name}
        </text>
      </g>
    </svg>
  );
}
