// /admin/login — 관리자 로그인(가드 예외 페이지).
import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "관리자 로그인",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  // env 미설정 안내(fail-closed) — 값은 노출하지 않고 존재 여부만 서버에서 판단
  const envReady =
    Boolean(process.env.ADMIN_PASSWORD_HASH) && Boolean(process.env.ADMIN_SESSION_SECRET);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-5 text-ink">
      <div className="w-full max-w-sm rounded-lg border border-line bg-bg-raised p-8">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ink-faint">
          SAMICK H&P — ADMIN
        </p>
        <h1 className="mt-2 font-mono text-lg font-bold">관리자 로그인</h1>
        {!envReady && (
          <p className="mt-4 rounded border border-line bg-bg-panel px-4 py-3 text-[13px] leading-relaxed text-ink-dim">
            ADMIN_PASSWORD_HASH·ADMIN_SESSION_SECRET 환경변수가 설정되지 않아 로그인할 수
            없습니다. <code className="font-mono">node scripts/admin-hash.mjs &lt;비밀번호&gt;</code>로
            해시를 생성해 .env에 채운 뒤 서버를 재시작하세요.
          </p>
        )}
        <LoginForm />
      </div>
    </main>
  );
}
