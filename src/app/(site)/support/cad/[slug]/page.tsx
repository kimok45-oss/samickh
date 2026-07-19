// /support/cad/[slug] — DWG/DWF DATA 상세.
import { pageMetadata } from "@/lib/seo/metadata";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("cad", slug);
  if (!post) return pageMetadata({ title: "DWG/DWF DATA", path: "/support/cad" });
  return pageMetadata({
    title: post.title,
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
