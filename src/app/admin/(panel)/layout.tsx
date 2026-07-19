// 관리자 패널 공통 셸 — 내비만 담당. **데이터 가드는 각 페이지 첫 줄 guardAdminPage()가 정본**
// (레이아웃 가드는 RSC 직렬화 유출을 못 막는다 — admin-read-page-rsc-leak).
import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "../login/actions";

export const metadata: Metadata = {
  title: { default: "관리자", template: "%s | 삼익유공압 관리자" },
  robots: { index: false, follow: false },
};

const MENU: { href: string; label: string }[] = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/posts", label: "게시판" },
  { href: "/admin/inquiries", label: "문의/견적" },
  { href: "/admin/products", label: "제품" },
  { href: "/admin/series", label: "사업분야" },
  { href: "/admin/order-specs", label: "주문사양" },
  { href: "/admin/history", label: "연혁" },
  { href: "/admin/clients", label: "거래처" },
  { href: "/admin/site-content", label: "사이트 문구" },
  { href: "/admin/faqs", label: "FAQ" },
  { href: "/admin/audit-log", label: "감사로그" },
  { href: "/admin/password", label: "비밀번호" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg text-ink">
      <header className="border-b border-line bg-bg-raised">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
          <Link href="/admin" className="font-mono text-sm font-bold tracking-wide">
            SAMICK H&P <span className="text-ink-faint">/ ADMIN</span>
          </Link>
          <nav aria-label="관리자 메뉴" className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-semibold text-ink-dim">
            {MENU.map((m) => (
              <Link key={m.href} href={m.href} className="hover:text-ink">
                {m.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="rounded border border-line px-3 py-1.5 text-xs font-bold text-ink-dim hover:text-ink"
            >
              사이트 보기
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="rounded border border-line px-3 py-1.5 text-xs font-bold text-ink-dim hover:text-ink"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
