import DOMPurify from "isomorphic-dompurify";

// 게시물 본문(HTML) 새니타이저 — 태그/속성 allowlist 적용으로 저장형 XSS 차단.
// 검증 출처: moonbaesteel PostBody.tsx 내부 sanitize() 를 lib로 분리(서버/클라 공용).
// 의존성: pnpm add isomorphic-dompurify
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "span", "div", "strong", "b", "em", "i", "u", "s", "del", "mark", "sub", "sup",
      "h1", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "hr", "a", "img", "code", "pre",
      "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "col", "colgroup",
      // 원본(2008 빌더) 스펙표 잔재 — 구조만 보존, 스타일 속성(bgcolor 등)은 제거되어 무력화됨
      "center", "small",
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "colspan", "rowspan", "target", "rel",
      "width", "height", "loading", "decoding",
    ],
    // URI 정책은 DOMPurify 기본값 사용 — javascript: 등 위험 프로토콜은 기본으로 차단된다.
    // 주의: ALLOWED_URI_REGEXP는 href/src만이 아니라 "모든" 허용 속성값에 적용되므로,
    // 커스텀 정규식(예: /^(?:https?:|...)/)을 넣으면 target="_blank"·rel="noopener"·
    // colspan="2" 같은 비-URI 속성값까지 통째로 제거된다. 절대 다시 넣지 말 것.
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "base", "link", "meta"],
  });
}
