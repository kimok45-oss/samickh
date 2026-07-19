"use client";

// 섹션 서브내비(회사소개·제품소개 등) — 괘선 탭. 활성 판정 때문에 클라이언트.
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SectionNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <nav className="overflow-x-auto border-b border-line" aria-label="Section">
      <ul className="flex min-w-max gap-1">
        {items.map((it) => {
          const active = pathname === it.href;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`relative block whitespace-nowrap px-4 py-3 text-[13.5px] transition-colors ${
                  active ? "text-ink" : "text-ink-faint hover:text-ink-dim"
                }`}
              >
                {it.label}
                {active && <span aria-hidden className="absolute inset-x-4 bottom-0 h-px bg-red-live" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
