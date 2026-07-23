// /news/industry/[slug] — 업계관련뉴스 상세.
import { pageMetadataI18n } from "@/lib/seo/metadata";
import { getLang } from "@/lib/lang";
import { getPostBySlug } from "@/lib/board";
import { BoardDetailScreen } from "@/components/board/BoardScreens";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";

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

export default async function IndustryNewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lang = await getLang();
  const post = await getPostBySlug("news", slug);
  const title = post ? (lang === "en" && post.titleEn ? post.titleEn : post.title) : null;
  const published = post?.origDate ?? post?.createdAt;
  return (
    <>
      {post && title && published && (
        <>
          <JsonLd
            data={articleJsonLd({
              title,
              path: `/news/industry/${post.slug}`,
              datePublished: published.toISOString(),
              dateModified: post.updatedAt?.toISOString(),
              isNews: true,
            })}
          />
          <JsonLd
            data={breadcrumbJsonLd([
              { name: lang === "en" ? "Home" : "홈", path: "/" },
              { name: lang === "en" ? "Industry News" : "업계관련뉴스", path: "/news/industry" },
              { name: title, path: `/news/industry/${post.slug}` },
            ])}
          />
        </>
      )}
      <BoardDetailScreen board="news" params={params} />
    </>
  );
}
