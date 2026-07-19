// /support/resources — 유공압자료(원문 board1, 7건) 목록.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { BoardListScreen } from "@/components/board/BoardScreens";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "유공압자료", titleEn: "Technical Data", descKo: "삼익유공압 유공압자료 — 표준형 유압/공압 실린더 카탈로그·도면기호 등 기술자료.", descEn: "Catalog PDFs - standard hydraulic, pneumatic, MILL TYPE and KS drawing symbols.", path: "/support/resources" });

export default function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <BoardListScreen board="tech" searchParams={searchParams} />;
}
