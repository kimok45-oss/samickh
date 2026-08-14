"use client";

// 되돌릴 수 없는 작업용 2단 확인 제출 버튼(UI 전용 — 서버 액션은 그대로 둔다).
// 1단: 평소 버튼. 누르면 "정말 삭제" + "취소"로 바뀐다.
// 2단: "정말 삭제"를 눌러야 form 이 실제로 제출된다(오조작 방지).
import { useState } from "react";

export default function ConfirmSubmit({
  children,
  confirmLabel = "정말 삭제",
  cancelLabel = "취소",
  className,
  confirmClassName,
  cancelClassName,
}: {
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
  confirmClassName?: string;
  cancelClassName?: string;
}) {
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <button type="button" className={className} onClick={() => setArmed(true)}>
        {children}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button type="submit" className={confirmClassName ?? className}>
        {confirmLabel}
      </button>
      <button
        type="button"
        className={cancelClassName ?? className}
        onClick={() => setArmed(false)}
      >
        {cancelLabel}
      </button>
    </span>
  );
}
