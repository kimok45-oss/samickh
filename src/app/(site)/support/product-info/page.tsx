// /support/product-info — PRODUCT INFORMATION(원문 board3, 2건) 목록.
// 인증서 모델은 별도로 없다 — 원문에서 제품 사진·공급사양 카탈로그가 이 게시판의 역할(계약 ④).
import { pageMetadata } from "@/lib/seo/metadata";
import { BoardListScreen } from "@/components/board/BoardScreens";

export const metadata = pageMetadata({
  title: "PRODUCT INFORMATION",
  description: "삼익유공압 제품 정보 — 제품 사진·공급사양 카탈로그.",
  path: "/support/product-info",
});

export default function ProductInfoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <BoardListScreen board="pinfo" searchParams={searchParams} />;
}
