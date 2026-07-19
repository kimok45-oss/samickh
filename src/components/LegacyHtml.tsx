// 구식(2008 iBuilder/EUC-KR 게시판) HTML 본문 렌더러 — 서버 컴포넌트.
// ① 원본 호스트의 에디터 이미지 경로를 로컬 회수본으로 재작성(DB 원문은 불변)
// ② 편집기 잔재(이스케이프된 head/body 골격)를 제거
// ③ DOMPurify 정화(구식 표 속성 bgcolor/align/class 는 보존 — globals 하단 .legacy-plate CSS가 정리)
import DOMPurify from "isomorphic-dompurify";

function clean(html: string): string {
  let out = html
    // 원본 사이트 절대경로 에디터 이미지 → 로컬 회수본(public/uploads/orig/...)
    .replace(
      /https?:\/\/(?:www\.)?samickh\.co\.kr\/board\/editor\/uploaded\/img\//gi,
      "/uploads/orig/board/editor/uploaded/img/",
    )
    .replace(/(?:src=["']?)\/board\/editor\/uploaded\/img\//gi, 'src="/uploads/orig/board/editor/uploaded/img/')
    // 편집기 잔재: 이스케이프된 <head>…</head>·<body>·</body> 골격(제철용 1건 등)
    .replace(/&lt;head&gt;[\s\S]*?&lt;\/head&gt;/gi, "")
    // 속성값 안의 &quot; 등 엔티티를 지나 첫 &gt; 까지(비탐욕) — [^&]* 로는 못 잡는다
    .replace(/&lt;\/?body[\s\S]*?&gt;/gi, "");

  return DOMPurify.sanitize(out, {
    ALLOWED_TAGS: [
      "table", "tbody", "thead", "tfoot", "tr", "td", "th", "colgroup", "col", "caption",
      "p", "br", "span", "div", "strong", "b", "em", "i", "u", "s", "font", "center",
      "img", "a", "ul", "ol", "li", "h1", "h2", "h3", "h4", "blockquote", "hr", "sub", "sup",
    ],
    ALLOWED_ATTR: [
      "src", "href", "alt", "title", "width", "height", "colspan", "rowspan",
      "align", "valign", "bgcolor", "class", "style", "border", "cellpadding", "cellspacing",
      "target", "rel", "color", "size",
    ],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "base", "link", "meta", "style"],
  });
}

/** 라이트 플레이트(도면지) 프레임 + 가로 스크롤 래퍼까지 포함한 표준 사용형. */
export function LegacyPlate({ html, className = "" }: { html: string; className?: string }) {
  const cleaned = clean(html);
  // 정화 후 실 내용(텍스트/이미지)이 없으면 플레이트 자체를 그리지 않는다(제철용 빈 본문 등)
  const hasContent = /<img|<table|[^\s<>]/.test(cleaned.replace(/<[^>]+>/g, "").trim()) || /<img|<table/i.test(cleaned);
  if (!hasContent) return null;
  return (
    <div className={`overflow-x-auto border border-line bg-paper p-4 sm:p-6 ${className}`}>
      <div className="legacy-plate min-w-fit" dangerouslySetInnerHTML={{ __html: cleaned }} />
    </div>
  );
}

/** 플레이트 프레임 없이 정화·재작성만 필요한 경우. */
export function LegacyHtml({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`legacy-plate ${className}`} dangerouslySetInnerHTML={{ __html: clean(html) }} />;
}

/** 계열 specHtml에서 "기본사양" 표(TABLE class=conA)만 추출 — 앞부분(배너·소개·특징)은
 *  구조화 필드(intro/features)로 이미 렌더하므로 중복을 막는다. 마커가 없으면 null. */
export function extractSpecTable(specHtml: string): string | null {
  const i = specHtml.indexOf("<TABLE class=conA");
  const j = i >= 0 ? i : specHtml.indexOf('<TABLE class="conA"');
  if (j < 0) return null;
  return specHtml.slice(j);
}
