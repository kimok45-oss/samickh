// /news/notice — 공지사항(원문 notice, 3건) 목록.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { BoardListScreen } from "@/components/board/BoardScreens";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "공지사항", titleEn: "Notice", descKo: "삼익유공압주식회사 공지사항.", descEn: "Company notices from SAMICK H&P.", path: "/news/notice" });

export default function NoticePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <BoardListScreen board="notice" searchParams={searchParams} />;
}
