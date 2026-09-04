import type { DiyProduct } from "@/lib/cotizaciones/types";

const DIY_ORIGIN = "https://www.electronicadiy.com";

export function buildDiySearchQuery(raw: string): string {
  const tokens = raw
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((token) => token.replace(/[*]+/g, ""))
    .filter(Boolean);

  if (!tokens.length) return "";

  return tokens
    .map((token, index) => (index === 0 ? `${token}*` : `${token}**`))
    .join(" ");
}

/** Misma URL que el buscador de la tienda: /es/search?type=article,page,product&q=Arduino*+uno** */
export function buildDiySearchPageUrl(raw: string): string {
  const q = buildDiySearchQuery(raw);
  const qParam = q
    .split(" ")
    .map((part) => encodeURIComponent(part))
    .join("+");
  return `${DIY_ORIGIN}/es/search?type=article%2Cpage%2Cproduct&q=${qParam}`;
}

export function absoluteDiyUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl.split("?")[0];
  }
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${DIY_ORIGIN}${path.split("?")[0]}`;
}

function parseMoney(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  const n = Number.parseFloat(value.replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

type SuggestProduct = {
  id?: number | string;
  title?: string;
  handle?: string;
  price?: string | number;
  price_min?: string | number;
  compare_at_price_min?: string | number;
  image?: string;
  featured_image?: { url?: string };
  available?: boolean;
  url?: string;
};

function mapSuggestProduct(product: SuggestProduct, query: string): DiyProduct {
  const handle = String(product.handle ?? "");
  const rawPath =
    typeof product.url === "string" && product.url.length > 0
      ? product.url
      : `/products/${handle}`;
  const compare = parseMoney(product.compare_at_price_min);

  return {
    id: product.id ?? handle,
    title: String(product.title ?? "Producto"),
    handle,
    price: parseMoney(product.price ?? product.price_min),
    compareAt: compare > 0 ? compare : null,
    image: product.image ?? product.featured_image?.url ?? null,
    available: Boolean(product.available),
    url: absoluteDiyUrl(rawPath),
    searchUrl: buildDiySearchPageUrl(query),
  };
}

function parseProductsFromHtml(html: string, query: string): DiyProduct[] {
  const seen = new Set<string>();
  const products: DiyProduct[] = [];
  const cardRe =
    /href="((?:\/es)?\/products\/[^"?#]+)[^"]*"[\s\S]{0,1600}?(?:Q\s*|&nbsp;Q\s*|Q<\/[^>]+>\s*)([0-9]{1,5}(?:[.,][0-9]{2})?)/gi;

  let match: RegExpExecArray | null;
  while ((match = cardRe.exec(html)) && products.length < 12) {
    const path = match[1];
    const handle = path.replace(/^\/es\/products\//, "").replace(/^\/products\//, "");
    if (seen.has(handle)) continue;
    seen.add(handle);

    const titleMatch = html
      .slice(Math.max(0, match.index - 400), match.index + 400)
      .match(/product-card__title[^>]*>([^<]+)/i);
    const title = titleMatch?.[1]?.trim() || handle.replace(/-/g, " ");

    products.push({
      id: handle,
      title,
      handle,
      price: parseMoney(match[2].replace(",", ".")),
      compareAt: null,
      image: null,
      available: true,
      url: absoluteDiyUrl(path),
      searchUrl: buildDiySearchPageUrl(query),
    });
  }

  return products;
}

export async function searchElectronicadiy(
  query: string,
  limit = 8
): Promise<{ products: DiyProduct[]; searchUrl: string }> {
  const trimmed = query.trim();
  const searchUrl = buildDiySearchPageUrl(trimmed);
  if (!trimmed) return { products: [], searchUrl };

  const suggestUrl = `${DIY_ORIGIN}/search/suggest.json?q=${encodeURIComponent(trimmed)}&resources[type]=product&resources[limit]=${limit}`;

  try {
    const res = await fetch(suggestUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "EduKids-Cotizaciones/1.0",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = (await res.json()) as {
        resources?: { results?: { products?: SuggestProduct[] }; products?: SuggestProduct[] };
      };
      const list = data.resources?.results?.products ?? data.resources?.products ?? [];
      if (Array.isArray(list) && list.length > 0) {
        return {
          products: list.slice(0, limit).map((product) => mapSuggestProduct(product, trimmed)),
          searchUrl,
        };
      }
    }
  } catch {
    // Fallback a HTML del buscador público
  }

  const htmlRes = await fetch(searchUrl, {
    headers: {
      Accept: "text/html",
      "User-Agent": "EduKids-Cotizaciones/1.0",
    },
    cache: "no-store",
  });
  const html = await htmlRes.text();
  return { products: parseProductsFromHtml(html, trimmed).slice(0, limit), searchUrl };
}

export function scoreProduct(product: DiyProduct, query: string): number {
  const q = query.toLowerCase();
  const title = product.title.toLowerCase();
  const tokens = q.split(/\s+/).filter((token) => token.length > 1);
  let score = 0;

  for (const token of tokens) {
    if (title.includes(token)) score += 3;
  }
  if (title.includes(q)) score += 5;
  if (product.available) score += 1;
  if (product.price > 0) score += 1;

  const lookingForBoard = /\b(arduino|placa|uno|nano|mega|esp32|microbit)\b/.test(q);
  const isAccessory = /\b(case|estuche|cable|shield|protector|carcasa)\b/.test(title);
  const askedAccessory = /\b(case|estuche|cable|shield|protector|carcasa)\b/.test(q);
  if (lookingForBoard && isAccessory && !askedAccessory) score -= 4;

  return score;
}

export function pickBestProduct(products: DiyProduct[], query: string): DiyProduct | null {
  if (!products.length) return null;
  return [...products].sort((a, b) => scoreProduct(b, query) - scoreProduct(a, query))[0] ?? null;
}
