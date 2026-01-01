// app/api/catalog/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

function safeJson(v) {
  if (!v) return null;
  if (typeof v === "object") return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v);
    } catch {
      return null;
    }
  }
  return null;
}

function withImgParams(url, params) {
  if (!url) return null;
  const u = new URL(url.startsWith("//") ? `https:${url}` : url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  return u.toString();
}

function getAssetUrl(asset) {
  const url = asset?.fields?.file?.url;
  if (!url) return null;
  return url.startsWith("//") ? `https:${url}` : url;
}

/**
 * Returns an object:
 * {
 *   original: string,
 *   grid: string,
 *   main: string,
 *   thumb: string
 * }
 */
function makeImageSet(originalUrl) {
  if (!originalUrl) return null;

  return {
    original: originalUrl,
    grid: withImgParams(originalUrl, { w: 640, fm: "webp", q: 60 }),
    main: withImgParams(originalUrl, { w: 900, fm: "webp", q: 65 }),
    thumb: withImgParams(originalUrl, { w: 160, fm: "webp", q: 50 }),
  };
}

/**
 * Supports:
 * - productImages (array of Assets)
 * - productImage (single Asset)
 * - image (single Asset)
 * - tourImage (single Asset)
 */
function extractImages(fields, assetMap) {
  const images = [];

  const arr = fields?.productImages;
  if (Array.isArray(arr)) {
    for (const ref of arr) {
      const id = ref?.sys?.id;
      if (!id) continue;
      const original = getAssetUrl(assetMap[id]);
      if (!original) continue;
      images.push(makeImageSet(original));
    }
  }

  const single = fields?.productImage || fields?.image || fields?.tourImage;
  const singleId = single?.sys?.id;
  if (images.length === 0 && singleId) {
    const original = getAssetUrl(assetMap[singleId]);
    if (original) images.push(makeImageSet(original));
  }

  return images; // array of imageSets
}

/**
 * Extract default price + stripePriceId from variantUx.
 * Supports:
 * 1) New schema: { defaultKey, variants: { k: {price, stripePriceId, imageIndex?} } }
 * 2) Legacy schema: { price, stripePriceId } or { amount, priceId }
 */
function extractDefaultVariant(variantUxRaw) {
  const v = safeJson(variantUxRaw);
  if (!v) return null;

  if (v.variants && typeof v.variants === "object") {
    const defaultKey = v.defaultKey || "default";
    const chosen = v.variants[defaultKey] || v.variants.default || null;
    if (!chosen) return null;

    const price = Number(chosen.price ?? chosen.amount ?? 0);
    const stripePriceId = chosen.stripePriceId ?? chosen.priceId ?? null;
    return { price, stripePriceId };
  }

  const price = Number(v.price ?? v.amount ?? 0);
  const stripePriceId = v.stripePriceId ?? v.priceId ?? null;

  if (!price && !stripePriceId) return null;
  return { price, stripePriceId };
}

/**
 * Helpers for flexible Contentful fields
 */
function pickFirstString(fields, keys) {
  for (const k of keys) {
    const v = fields?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function pickFirstStringArray(fields, keys) {
  for (const k of keys) {
    const v = fields?.[k];
    if (Array.isArray(v)) {
      const out = v
        .map(x => (typeof x === "string" ? x.trim() : ""))
        .filter(Boolean);
      if (out.length) return out;
    }
  }
  return [];
}

export async function GET() {
  try {
    if (!SPACE_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Missing Contentful env vars: CONTENTFUL_SPACE_ID / CONTENTFUL_ACCESS_TOKEN" },
        { status: 500 }
      );
    }

    const url =
      `https://cdn.contentful.com/spaces/${SPACE_ID}/environments/master/entries` +
      `?access_token=${ACCESS_TOKEN}&include=10`;

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Contentful error ${response.status}`, details: text.slice(0, 900) },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Build asset map
    const assetMap = {};
    if (data.includes?.Asset) {
      for (const asset of data.includes.Asset) {
        assetMap[asset.sys.id] = asset;
      }
    }

    const products = [];
    const tours = [];
    const donationTiers = [];
    const portfolioItems = [];

    for (const item of data.items || []) {
      const f = item.fields || {};

      const imageSets = extractImages(f, assetMap);
      const primary = imageSets[0] || null;

      // For backwards compatibility with your existing grid:
      const image = primary?.grid || primary?.main || primary?.original || null;

      const vx = extractDefaultVariant(f.variantUx);
      const mergedPrice = Number(vx?.price ?? f.price ?? 0);
      const mergedPriceId = vx?.stripePriceId ?? f.stripePriceId ?? null;

      // classify by field presence
      const isProduct = Boolean(
        f.productName ||
          f.productDescription ||
          f.productImage ||
          (Array.isArray(f.productImages) && f.productImages.length)
      );
      const isTour = Boolean(f.tourName || f.tourDescription || f.tourImage);
      const isTier = Boolean(f.tierName || f.tierDescription);

      if (isProduct) {
        // These key lists let you rename Contentful fields without breaking the site.
        const category = pickFirstString(f, [
          "category",
          "productCategory",
          "productType",
          "collection",
          "group",
        ]);

        const subcategory = pickFirstString(f, [
          "subcategory",
          "subCategory",
          "productSubcategory",
          "series",
          "line",
        ]);

        const tags = pickFirstStringArray(f, [
          "tags",
          "keywords",
          "productTags",
        ]);

        products.push({
          id: item.sys.id,
          slug: f.slug || null,
          name: f.productName || "Untitled Product",
          price: mergedPrice,
          description: f.productDescription || "",

          // NEW: category fields for Shop filters
          category,
          subcategory,
          tags,

          // New image structure
          image,             // optimized for grid
          images: imageSets, // array of {original, grid, main, thumb}

          stripePriceId: mergedPriceId,
          variantUx: safeJson(f.variantUx) || null,

          // New Contentful fields (optional):
          disclaimer: f.disclaimer || "",
          careInstructions: f.careInstructions || "",
          isShippable: f.isShippable ?? true, // optional boolean in Contentful; defaults true
        });
        continue;
      }

      if (isTour) {
        tours.push({
          id: item.sys.id,
          slug: f.slug || null,
          name: f.tourName || f.name || "Untitled Tour",
          price: mergedPrice || 25,
          description: f.tourDescription || f.description || "",
          image,
          images: imageSets,
          stripePriceId: mergedPriceId,
          variantUx: safeJson(f.variantUx) || null,
        });
        continue;
      }

      if (isTier) {
        donationTiers.push({
          id: item.sys.id,
          name: f.tierName || f.name || "Support",
          price: mergedPrice || 10,
          description: f.tierDescription || f.description || "",
          stripePriceId: mergedPriceId,
          variantUx: safeJson(f.variantUx) || null,
        });
        continue;
      }

      // Portfolio fallback
      if (f.title || f.name || image) {
        portfolioItems.push({
          id: item.sys.id,
          title: f.title || f.name || "Untitled",
          desc: f.description || "",
          tech: f.technologies || f.tech || "",
          image,
          images: imageSets,
        });
      }
    }

    return NextResponse.json({ products, tours, donationTiers, portfolioItems });
  } catch (err) {
    const msg = err?.message || String(err);
    return NextResponse.json({ error: "Catalog error", details: msg }, { status: 500 });
  }
}
