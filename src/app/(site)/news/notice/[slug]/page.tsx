// /news/notice/[slug] — 공지사항 상세.
import { pageMetadata } from "@/lib/seo/metadata";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("notice", slug);
  if (!post) return pageMetadata({ title: "공지사항", path: "/news/notice" });
  return pageMetadata({
    title: post.title,
    path: `/news/notice/${post.slug}`,
    type: "article",
    publishedTime: post.origDate?.toISOString(),
  });
}

export default function NoticeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <BoardDetailScreen board="notice" params={params} />;
}
