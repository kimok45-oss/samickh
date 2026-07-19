"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, type LoginState } from "./actions";
import { ui } from "../ui";

const initial: LoginState = { error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${ui.btn} w-full`}>
      {pending ? "확인 중…" : "로그인"}
    </button>
  );
}

export default function LoginForm() {
  const [state, action] = useActionState(login, initial);
  return (
    <form action={action} className="mt-6 space-y-4">
      <div>
        <label className={ui.label} htmlFor="password">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className={ui.input}
        />
      </div>
      {state.error && (
        <p role="alert" className={ui.err}>
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
