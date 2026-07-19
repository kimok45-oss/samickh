// /support/cad — DWG/DWF DATA(원문 board2, 3건) 목록.
// ⚠ CAD zip 5건은 원본 서버 소실 — 상세에서 missing 뱃지, 관리자 업로드로 복원(계약 §라우트).
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { BoardListScreen } from "@/components/board/BoardScreens";

export const generateMetadata = () =>
  pageMetadataI18n({ titleKo: "DWG/DWF DATA", titleEn: "DWG/DWF Data", descKo: "삼익유공압 CAD 데이터(DWG/DWF) 자료실.", descEn: "Cylinder drawing data library (DWG/DWF).", path: "/support/cad" });

export default function CadPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <BoardListScreen board="cad" searchParams={searchParams} />;
}
