// /support/resources — 유공압자료(원문 board1, 7건) 목록.
import { pageMetadata } from "@/lib/seo/metadata";
import { BoardListScreen } from "@/components/board/BoardScreens";

export const metadata = pageMetadata({
  title: "유공압자료",
  description: "삼익유공압 유공압자료 — 표준형 유압/공압 실린더 카탈로그·도면기호 등 기술자료.",
  path: "/support/resources",
});

export default function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <BoardListScreen board="tech" searchParams={searchParams} />;
}
