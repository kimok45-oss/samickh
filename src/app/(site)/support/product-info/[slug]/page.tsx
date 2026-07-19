// /support/product-info/[slug] — PRODUCT INFORMATION 상세.
import { pageMetadata } from "@/lib/seo/metadata";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("pinfo", slug);
  if (!post) return pageMetadata({ title: "PRODUCT INFORMATION", path: "/support/product-info" });
  return pageMetadata({
    title: post.title,
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
