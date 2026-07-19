// /support/product-info/[slug] — PRODUCT INFORMATION 상세.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("pinfo", slug);
  if (!post) return pageMetadataI18n({ titleKo: "PRODUCT INFORMATION", titleEn: "Product Information", path: "/support/product-info" });
  return pageMetadataI18n({
    titleKo: post.title,
    titleEn: post.titleEn ?? post.title,
    path: `/support/product-info/${post.slug}`,
    type: "article",
    publishedTime: post.origDate?.toISOString(),
  });
}

export default function ProductInfoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <BoardDetailScreen board="pinfo" params={params} />;
}
