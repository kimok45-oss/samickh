// /support/cad/[slug] — DWG/DWF DATA 상세.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("cad", slug);
  if (!post) return pageMetadataI18n({ titleKo: "DWG/DWF DATA", titleEn: "DWG/DWF Data", path: "/support/cad" });
  return pageMetadataI18n({
    titleKo: post.title,
    titleEn: post.titleEn ?? post.title,
    path: `/support/cad/${post.slug}`,
    type: "article",
    publishedTime: post.origDate?.toISOString(),
  });
}

export default function CadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <BoardDetailScreen board="cad" params={params} />;
}
