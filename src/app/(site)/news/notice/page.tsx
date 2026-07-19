// /news/notice — 공지사항(원문 notice, 3건) 목록.
import { pageMetadata } from "@/lib/seo/metadata";
import { BoardListScreen } from "@/components/board/BoardScreens";

export const metadata = pageMetadata({
  title: "공지사항",
  description: "삼익유공압주식회사 공지사항.",
  path: "/news/notice",
});

export default function NoticePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <BoardListScreen board="notice" searchParams={searchParams} />;
}
