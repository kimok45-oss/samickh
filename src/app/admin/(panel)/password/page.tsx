// /admin/password ⑫ — 관리자 비밀번호 해시 생성기(출력만 — env 교체는 수동 안내).
import { guardAdminPage } from "@/lib/auth-server";
import PasswordHashForm from "./PasswordHashForm";
import { ui } from "../../ui";

export default async function AdminPasswordPage() {
  await guardAdminPage();

  return (
    <main className={ui.page}>
      <h1 className={ui.h1}>관리자 비밀번호 변경</h1>

      <div className={`mt-5 ${ui.panel}`}>
        <ol className="list-decimal space-y-1.5 pl-5 text-[13.5px] leading-relaxed text-ink-dim">
          <li>아래에 새 비밀번호를 입력해 scrypt 해시를 생성합니다(비밀번호는 저장되지 않습니다).</li>
          <li>
            출력된 <code className="font-mono">ADMIN_PASSWORD_HASH=…</code> 한 줄을 서버의{" "}
            <code className="font-mono">.env</code>에서 교체합니다. 포맷은{" "}
            <code className="font-mono">saltHex.hashHex</code>(점 구분, <b>$ 문자 없음</b>)입니다.
          </li>
          <li>서버를 재시작하면 새 비밀번호가 적용됩니다. 기존 세션은 만료(12h) 시 자동 종료됩니다.</li>
        </ol>
        <p className="mt-3 text-[12px] text-ink-faint">
          터미널에서도 생성할 수 있습니다: <code className="font-mono">node scripts/admin-hash.mjs &lt;비밀번호&gt;</code>
        </p>
        <div className="mt-5 border-t border-line pt-5">
          <PasswordHashForm />
        </div>
      </div>
    </main>
  );
}
