// /support/resources/[slug] — 유공압자료 상세.
import { pageMetadata } from "@/lib/seo/metadata";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("tech", slug);
  if (!post) return pageMetadata({ title: "유공압자료", path: "/support/resources" });
  return pageMetadata({
    title: post.title,
    path: `/support/resources/${post.slug}`,
    type: "article",
    publishedTime: post.origDate?.toISOString(),
  });
}

export default function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <BoardDetailScreen board="tech" params={params} />;
}
