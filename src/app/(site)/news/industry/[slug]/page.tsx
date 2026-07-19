// /news/industry/[slug] — 업계관련뉴스 상세.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug("news", slug);
  if (!post) return pageMetadataI18n({ titleKo: "업계관련뉴스", titleEn: "Industry News", path: "/news/industry" });
  return pageMetadataI18n({
    titleKo: post.title,
    titleEn: post.titleEn ?? post.title,
    path: `/news/industry/${post.slug}`,
    type: "article",
    publishedTime: post.origDate?.toISOString(),
  });
}

export default function IndustryNewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <BoardDetailScreen board="news" params={params} />;
}
