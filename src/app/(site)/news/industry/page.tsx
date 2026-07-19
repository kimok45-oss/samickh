// /news/industry — 업계관련뉴스(원문 news, 6건 — 2008 포스코 관련 기사 스크랩) 목록.
import { pageMetadata } from "@/lib/seo/metadata";
import { BoardListScreen } from "@/components/board/BoardScreens";

export const metadata = pageMetadata({
  title: "업계관련뉴스",
  description: "삼익유공압 업계관련뉴스.",
  path: "/news/industry",
});

export default function IndustryNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <BoardListScreen board="news" searchParams={searchParams} />;
}
