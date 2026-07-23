// /news/notice/[slug] — 공지사항 상세.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getLang } from "@/lib/lang";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

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

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = await getLang();
  const post = await getPostBySlug("notice", slug);
  const title = post ? (lang === "en" && post.titleEn ? post.titleEn : post.title) : null;
  const published = post?.origDate ?? post?.createdAt;
  return (
    <>
      {post && title && published && (
        <>
          <JsonLd
            data={articleJsonLd({
              title,
              path: `/news/notice/${post.slug}`,
              datePublished: published.toISOString(),
              dateModified: post.updatedAt?.toISOString(),
            })}
          />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: lang === "en" ? "Home" : "홈", path: "/" },
              { name: lang === "en" ? "Notice" : "공지사항", path: "/news/notice" },
              { name: title, path: `/news/notice/${post.slug}` },
            ])}
          />
        </>
      )}
      <BoardDetailScreen board="notice" params={params} />
    </>
  );
}
