// /news/notice/[slug] — 공지사항 상세.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("notice", slug);
  if (!post) return pageMetadataI18n({ titleKo: "공지사항", titleEn: "Notice", path: "/news/notice" });
  return pageMetadataI18n({
    titleKo: post.title,
    titleEn: post.titleEn ?? post.title,
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
