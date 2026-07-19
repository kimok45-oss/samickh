// /news/industry — 업계관련뉴스(원문 news, 6건 — 2008 포스코 관련 기사 스크랩) 목록.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { BoardListScreen } from "@/components/board/BoardScreens";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "업계관련뉴스", titleEn: "Industry News", descKo: "삼익유공압 업계관련뉴스.", descEn: "Industry news archive.", path: "/news/industry" });

export default function IndustryNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <BoardListScreen board="news" searchParams={searchParams} />;
}
