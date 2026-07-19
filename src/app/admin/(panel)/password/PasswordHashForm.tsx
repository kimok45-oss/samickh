"use client";

// 비밀번호 해시 생성 폼 — 현 세션(requireAdmin)에서 새 scrypt 해시를 생성해 출력만 한다.
// env 교체는 수동(.env의 ADMIN_PASSWORD_HASH 교체 + 서버 재시작).
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { generatePasswordHash, type HashGenState } from "@/lib/admin-actions";
import { ui } from "../../ui";

const initial: HashGenState = { hash: "", error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={ui.btn}>
      {pending ? "생성 중…" : "해시 생성"}
    </button>
  );
}

export default function PasswordHashForm() {
  const [state, action] = useActionState(generatePasswordHash, initial);

  return (
    <div>
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="min-w-64">
          <label className={ui.label} htmlFor="password">
            새 비밀번호(8자 이상 · $ 금지)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
            className={ui.input}
          />
        </div>
        <SubmitButton />
      </form>

      {state.error && (
        <p role="alert" className={`mt-3 ${ui.err}`}>
          {state.error}
        </p>
      )}

      {state.hash && (
        <div className="mt-4 rounded border border-line bg-bg-panel p-4">
          <p className="text-[12px] font-bold text-ink-faint">
            생성된 해시 — 아래 한 줄을 .env 의 ADMIN_PASSWORD_HASH 값으로 교체한 뒤 서버를
            재시작하세요(자동 적용되지 않습니다).
          </p>
          <code className="mt-2 block select-all break-all rounded bg-bg px-3 py-2 font-mono text-[12px] leading-relaxed text-ink">
            ADMIN_PASSWORD_HASH={state.hash}
          </code>
        </div>
      )}
    </div>
  );
}
