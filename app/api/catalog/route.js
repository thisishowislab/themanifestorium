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

function getImageUrl(asset) {
  const url = asset?.fields?.file?.url;
  if (!url) return null;
  return url.startsWith("//") ? `https:${url}` : url;
}

/**
 * Supports:
 * - productImages (array of Assets)
 * - productImage (single Asset)
 * - image / tourImage (single Asset)
 */
function extractImages(fields, assetMap) {
  const images = [];

  const arr = fields?.productImages;
  if (Array.isArray(arr)) {
    for (const ref of arr) {
      const id = ref?.sys?.id;
      if (!id) continue;
      const url = getImageUrl(assetMap[id]);
      if (url) images.push(url);
    }
  }

  const single = fields?.productImage || fields?.image || fields?.tourImage;
  const singleId = single?.sys?.id;
  if (images.length === 0 && singleId) {
    const url = getImageUrl(assetMap[singleId]);
    if (url) images.push(url);
  }

  return images;
}

/**
 * Extract default price + stripePriceId from variantUx.
 * Supports:
 * 1) New schema: { defaultKey, variants: { k: {price, stripePriceId, label, imageIndex?} } }
 * 2) Legacy schema: { price, stripePriceId } or { amount, priceId }
 */
function extractDefaultVariant(variantUxRaw) {
  const v = safeJson(variantUxRaw);
  if (!v) return null;

  // New schema
  if (v.variants && typeof v.variants === "object") {
    const defaultKey = v.defaultKey || "default";
    const chosen =
      v.variants?.[defaultKey] || v.variants?.default || v.variants?.[Object.keys(v.variants)[0]] || null;
    if (!chosen) return null;

    const price = Number(chosen.price ?? chosen.amount ?? 0);
    const stripePriceId = chosen.stripePriceId ?? chosen.priceId ?? null;

    return { price, stripePriceId };
  }

  // Legacy schema
  const price = Number(v.price ?? v.amount ?? 0);
  const stripePriceId = v.stripePriceId ?? v.priceId ?? null;

  if (!price && !stripePriceId) return null;
  return { price, stripePriceId };
}

function normalizeCategories(fields) {
  // supports: category (string), categories (array), productCategory, productCategories
  const c1 = fields?.category;
  const c2 = fields?.categories;
  const c3 = fields?.productCategory;
  const c4 = fields?.productCategories;

  const raw = []
    .concat(Array.isArray(c2) ? c2 : [])
    .concat(Array.isArray(c4) ? c4 : [])
    .concat(typeof c1 === "string" ? [c1] : [])
    .concat(typeof c3 === "string" ? [c3] : []);

  // de-dupe + clean
  const cleaned = raw
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean);

  return Array.from(new Set(cleaned));
}

function extractCommunity(fields) {
  // supports multiple possible field names so you don't have to rename things
  const eligible =
    Boolean(fields?.communitySupported) ||
    Boolean(fields?.communityEligible) ||
    Boolean(fields?.communityOption) ||
    Boolean(fields?.acceptsTrade) ||
    false;

  const note =
    fields?.communityNote ||
    fields?.communityDetails ||
    fields?.tradeNote ||
    fields?.exchangeNote ||
    "";

  return { communityEligible: eligible, communityNote: note };
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
        { error: `Contentful error ${response.status}`, details: text.slice(0, 600) },
        { status: 500 }
      );
    }

    const data = await response.json();

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

      const images = extractImages(f, assetMap);
      const image = images[0] || null;

      const vx = extractDefaultVariant(f.variantUx);
      const mergedPrice = Number(vx?.price ?? f.price ?? 0);
      const mergedPriceId = vx?.stripePriceId ?? f.stripePriceId ?? null;

      const categories = normalizeCategories(f);
      const community = extractCommunity(f);

      const disclaimer =
        f.disclaimer ||
        f.productDisclaimer ||
        f.legalDisclaimer ||
        "";

      const careInstructions =
        f.careInstructions ||
        f.care ||
        f.productCare ||
        "";

      const isProduct = Boolean(
        f.productName ||
          f.productDescription ||
          f.productImage ||
          (Array.isArray(f.productImages) && f.productImages.length)
      );

      const isTour = Boolean(f.tourName || f.tourDescription || f.tourImage);

      const isTier = Boolean(f.tierName || f.tierDescription);

      if (isProduct) {
        products.push({
          id: item.sys.id,
          slug: f.slug || null,
          name: f.productName || "Untitled Product",
          price: mergedPrice,
          description: f.productDescription || "",
          image,
          images,
          stripePriceId: mergedPriceId,
          variantUx: safeJson(f.variantUx) || null,
          categories,
          ...community,
          disclaimer,
          careInstructions,
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
          images,
          stripePriceId: mergedPriceId,
          variantUx: safeJson(f.variantUx) || null,
          categories,
          ...community,
          disclaimer,
          careInstructions,
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
          categories,
          ...community,
          disclaimer,
          careInstructions,
        });
        continue;
      }

      if (f.title || f.name || image) {
        portfolioItems.push({
          id: item.sys.id,
          title: f.title || f.name || "Untitled",
          desc: f.description || "",
          tech: f.technologies || f.tech || "",
          image,
          images,
          categories,
        });
      }
    }

    return NextResponse.json({ products, tours, donationTiers, portfolioItems });
  } catch (err) {
    const msg = err?.message || String(err);
    return NextResponse.json({ error: "Catalog error", details: msg }, { status: 500 });
  }
}
