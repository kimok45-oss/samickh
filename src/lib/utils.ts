/**
 * className 병합 헬퍼. 프로젝트에 이미 cn(clsx+tailwind-merge)이 있으면
 * 이 파일은 빼고 기존 @/lib/utils 를 쓰면 된다.
 * (의존성을 추가하기 싫으면 아래의 가벼운 버전을 그대로 사용)
 */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
