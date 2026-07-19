/**
 * 라우트 전환 모션. app/template.tsx 로 두면 라우트가 바뀔 때마다 리마운트되어
 * 매번 재생된다(layout.tsx는 리마운트되지 않으므로 안 됨).
 *  - .mk-page-veil  : 배경톤 커튼이 걷히는 오버레이.
 *  - .mk-page-enter : 콘텐츠 페이드+라이즈.
 * 스타일/타이밍과 reduced-motion 폴백은 globals.append.css.
 * 출처: 문배철강 app/template.tsx.
 *
 * 이 파일은 반드시 app/template.tsx 경로로 둔다(서버 컴포넌트라 "use client" 불필요).
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="mk-page-veil" aria-hidden />
      <div className="mk-page-enter">{children}</div>
    </>
  );
}
