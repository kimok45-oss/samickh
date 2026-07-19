// 시드 — 원본(samickh.co.kr) 수확 정본만 입력. 정답지: Desktop\일정\samickh-clone
// 시드 3원칙: ①최초 설치 전용(운영 가드) ②고객 데이터(Inquiry·PageView·AuditLog) 절대 불변 ③CMS(SiteContent)는 seed-if-empty
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adapter = new PrismaBetterSqlite3({ url: 'file:' + path.join(__dirname, 'dev.db') });
const prisma = new PrismaClient({ adapter });

const SEED_PATH = process.env.SEED_DATA || 'C:/Users/kimok/Desktop/일정/samickh-clone/extract/seed-data.json';

type SeedAtt = { name: string; sizeLabel: string | null; downCount: number | null };
type Seed = {
  posts: { board: string; slug: string; origNo: number; title: string; origDate: string | null; hits: number; body: string; attachments: SeedAtt[] }[];
  products: { slug: string; category: number; title: string; body: string; sortOrder: number }[];
  series: { slug: string; name: string; nameEn: string; seriesCode: string; kind: string; sortOrder: number; intro: string; features: string[]; specHtml: string; images: string[] }[];
  history: { year: number; text: string; sortOrder: number }[];
  clients: { group: string; name: string; sortOrder: number }[];
  boreRod: { code: string; bore: number; rodB: number; rodC: number; sortOrder: number }[];
  mounting: { code: string; name: string; nameEn: string; sortOrder: number }[];
  siteContent: { key: string; value: string; group: string; label: string; multiline?: boolean; sortOrder: number }[];
};

// EN 번역(translations.en.json) — 있으면 병합(재시드 안전)
function loadEn(): any {
  const p = path.join(__dirname, 'translations.en.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : {};
}

// 스펙표 HTML의 한국어 용어를 사전 치환해 EN판 생성(숫자·코드 불변). 잔존 한글은 보고.
const leftovers = new Map<string, Set<string>>();
function dictApply(html: string, dict: Record<string, string>, tag: string): string {
  if (!html) return html;
  // &nbsp;·다중 공백 정규화(EN판 전용 — 원문 body는 불변)
  let out = html.replace(/&nbsp;/gi, ' ').replace(/ {2,}/g, ' ');
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length);
  for (const k of keys) out = out.split(k).join(dict[k]);
  // 잔존 한글 fragment 수집(텍스트 노드만)
  const rest = out.replace(/<[^>]+>/g, '\n');
  for (const line of rest.split('\n')) {
    const t = line.replace(/&nbsp;/g, ' ').trim();
    if (/[가-힣]/.test(t)) {
      if (!leftovers.has(tag)) leftovers.set(tag, new Set());
      leftovers.get(tag)!.add(t.slice(0, 60));
    }
  }
  return out;
}

// 첨부 실파일 매핑: 회수된 원본 → /uploads/attach/<board>/<no>/<파일명> (게시판 공개자료라 public 허용)
const RECOVERED: Record<string, string> = {
  'tech-4:표준보급형유압실린더.pdf': '/uploads/attach/board1/4/표준보급형유압실린더.pdf',
  'tech-5:공압_실린더_카달로그.pdf': '/uploads/attach/board1/5/공압_실린더_카달로그.pdf',
  'tech-6:유압_공기압_도면기호(한국산업규격).pdf': '/uploads/attach/board1/6/유압_공기압_도면기호(한국산업규격).pdf',
  'tech-8:SM140H-SERIES.pdf': '/uploads/attach/board1/8/SM140H-SERIES.pdf',
  'tech-11:카달로그.pdf': '/uploads/attach/board1/11/카달로그.pdf',
  'pinfo-3:SA401276.jpg': '/uploads/attach/board3/3/SA401276.jpg',
  'pinfo-3:SA401278.jpg': '/uploads/attach/board3/3/SA401278.jpg',
  'pinfo-4:사진.jpg': '/uploads/attach/board3/4/사진.jpg',
  'pinfo-4:공급사양품카다로그(CO).pdf': '/uploads/attach/board3/4/공급사양품카다로그(CO).pdf',
  'news-4:1204637667.jpg': '/uploads/attach/news/4/1204637667.jpg',
  'news-5:posco.jpg': '/uploads/attach/news/5/posco.jpg',
  'news-7:08-03-25_1_hot_coil_line_2.jpg': '/uploads/attach/news/7/08-03-25_1_hot_coil_line_2.jpg',
  'news-8:posco_1.jpg': '/uploads/attach/news/8/posco_1.jpg',
  'news-9:posm.jpg': '/uploads/attach/news/9/posm.jpg',
};

async function main() {
  // ── 운영 가드: 운영 콘텐츠 테이블에 행이 있으면 중단(SEED_FORCE=1로만 통과) ──
  const productCount = await prisma.product.count().catch(() => 0);
  if (productCount > 0 && process.env.SEED_FORCE !== '1') {
    console.error('운영 데이터가 이미 있습니다. 재시드는 SEED_FORCE=1 로만 가능합니다.');
    process.exit(1);
  }

  const seed: Seed = JSON.parse(readFileSync(SEED_PATH, 'utf8'));
  const en = loadEn();

  // 원본 정답지 데이터는 재시드 — 고객 데이터(Inquiry·PageView·AuditLog)는 절대 deleteMany 하지 않음
  await prisma.attachment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.seriesImage.deleteMany();
  await prisma.series.deleteMany();
  await prisma.history.deleteMany();
  await prisma.client.deleteMany();
  await prisma.boreRod.deleteMany();
  await prisma.mounting.deleteMany();

  // 게시글 21건 (원문 총계: notice3·news6·tech7·cad3·pinfo2)
  for (const p of seed.posts) {
    const t = en.posts?.[p.slug];
    const post = await prisma.post.create({
      data: {
        board: p.board, slug: p.slug, origNo: p.origNo,
        title: p.title, titleEn: t?.title ?? null,
        body: p.body,
        bodyEn: t?.body ?? (en.specDict ? dictApply(p.body, en.specDict, `post:${p.slug}`) : null),
        origDate: p.origDate ? new Date(p.origDate + 'T09:00:00+09:00') : null,
        hits: p.hits,
      },
    });
    for (const a of p.attachments) {
      const store = RECOVERED[`${p.slug}:${a.name}`];
      await prisma.attachment.create({
        data: {
          postId: post.id, fileName: a.name,
          storeName: store ?? '',
          mime: a.name.endsWith('.pdf') ? 'application/pdf' : a.name.endsWith('.zip') ? 'application/zip' : 'image/jpeg',
          size: 0,
          missing: !store, // CAD zip 5건 = 원본 서버 소실
        },
      });
    }
  }

  // 제품 13건
  for (const pr of seed.products) {
    const t = en.products?.[pr.slug];
    await prisma.product.create({
      data: { slug: pr.slug, category: pr.category, title: pr.title, titleEn: t?.title ?? null, body: pr.body, bodyEn: t?.body ?? (en.specDict ? dictApply(pr.body, en.specDict, `product:${pr.slug}`) : null), sortOrder: pr.sortOrder },
    });
  }

  // 사업분야 10계열
  for (const s of seed.series) {
    const t = en.series?.[s.slug];
    const row = await prisma.series.create({
      data: {
        slug: s.slug, name: s.name, nameEn: s.nameEn, seriesCode: s.seriesCode, kind: s.kind,
        intro: s.intro, introEn: t?.intro ?? null,
        specHtml: s.specHtml,
        specHtmlEn: t?.specHtml ?? (en.specDict ? dictApply(s.specHtml, en.specDict, `series:${s.slug}`) : null),
        features: JSON.stringify(s.features), featuresEn: t?.features ? JSON.stringify(t.features) : null,
        sortOrder: s.sortOrder,
      },
    });
    let i = 0;
    for (const img of s.images) {
      await prisma.seriesImage.create({ data: { seriesId: row.id, path: img, alt: s.name, sortOrder: i++ } });
    }
  }

  // 연혁 14건 / 거래업체 20 / 보어 13 / 장착 10
  for (const h of seed.history) await prisma.history.create({ data: { ...h, textEn: en.history?.[`${h.year}-${h.sortOrder}`] ?? null } });
  for (const c of seed.clients) await prisma.client.create({ data: { ...c, nameEn: en.clients?.[c.name] ?? null } });
  for (const b of seed.boreRod) await prisma.boreRod.create({ data: b });
  for (const m of seed.mounting) await prisma.mounting.create({ data: m });

  // SiteContent — seed-if-empty (운영 편집값 보존). 단 valueEn이 비어있고 번역이 생기면 EN만 보충.
  for (const sc of seed.siteContent) {
    const exists = await prisma.siteContent.findUnique({ where: { key: sc.key } });
    if (!exists) {
      await prisma.siteContent.create({
        data: { key: sc.key, value: sc.value, valueEn: en.siteContent?.[sc.key] ?? null, group: sc.group, label: sc.label, multiline: !!sc.multiline, sortOrder: sc.sortOrder },
      });
    } else if (!exists.valueEn && en.siteContent?.[sc.key]) {
      await prisma.siteContent.update({ where: { key: sc.key }, data: { valueEn: en.siteContent[sc.key] } });
    }
  }

  const counts = {
    post: await prisma.post.count(), attachment: await prisma.attachment.count(),
    product: await prisma.product.count(), series: await prisma.series.count(),
    history: await prisma.history.count(), client: await prisma.client.count(),
    boreRod: await prisma.boreRod.count(), mounting: await prisma.mounting.count(),
    siteContent: await prisma.siteContent.count(),
  };
  console.log('SEED DONE', JSON.stringify(counts));
  if (leftovers.size) {
    console.log('⚠ EN 사전 치환 후 잔존 한글:');
    for (const [tag, set] of leftovers) console.log(' ', tag, '→', [...set].join(' | ').slice(0, 300));
  } else {
    console.log('EN 사전 치환: 잔존 한글 0');
  }
}

main().finally(() => prisma.$disconnect());
