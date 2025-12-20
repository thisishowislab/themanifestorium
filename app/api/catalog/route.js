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

function toKey(fields) {
  // BEST: slug. If your products don't have slug yet, fallback to name fields.
  return (
    fields?.slug ||
    fields?.productSlug ||
    fields?.productKey ||
    fields?.key ||
    fields?.productName ||
    fields?.tourName ||
    fields?.tierName ||
    fields?.name ||
    null
  );
}

/**
 * Extracts a "default" price + stripePriceId from variantUx.
 * Supports BOTH:
 * 1) New schema: { defaultKey, variants: { k: {price, stripePriceId} } }
 * 2) Legacy schema (for transition): { price, stripePriceId } or { amount, priceId }
 */
function extractDefaultVariant(variantUxRaw) {
  const v = safeJson(variantUxRaw);
  if (!v) return null;

  // New schema
  if (v.variants && typeof v.variants === "object") {
    const defaultKey = v.defaultKey || "default";
    const chosen = v.variants[defaultKey] || v.variants.default || null;
    if (!chosen) return null;

    const price = Number(chosen.price ?? chosen.amount ?? 0);
    const stripePriceId = chosen.stripePriceId ?? chosen.priceId ?? null;

    return { price, stripePriceId };
  }

  // Legacy single-variant schema
  const price = Number(v.price ?? v.amount ?? 0);
  const stripePriceId = v.stripePriceId ?? v.priceId ?? null;

  if (!price && !stripePriceId) return null;
  return { price, stripePriceId };
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

      // image from common fields
      const imgField = f.productImage || f.tourImage || f.image;
      const img = imgField?.sys?.id ? getImageUrl(assetMap[imgField.sys.id]) : null;

      // Pull default pricing directly from THIS product/tour/tier entry’s variantUx
      const vx = extractDefaultVariant(f.variantUx);
      const mergedPrice = Number(vx?.price ?? f.price ?? 0);
      const mergedPriceId = vx?.stripePriceId ?? f.stripePriceId ?? null;

      // Classify by field presence (keeps your system stable without relying on Content Type IDs)
      const isProduct = Boolean(f.productName || f.productDescription || f.productImage);
      const isTour = Boolean(f.tourName || f.tourDescription || f.tourImage);
      const isTier = Boolean(f.tierName || f.tierDescription);

      if (isProduct) {
        products.push({
          id: item.sys.id,
          slug: f.slug || null,
          name: f.productName || "Untitled Product",
          price: mergedPrice,
          description: f.productDescription || "",
          image: img,
          stripePriceId: mergedPriceId,
          // optional: expose full variants later without changing the API again
          variantUx: safeJson(f.variantUx) || null,
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
          image: img,
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
      if (f.title || f.name || img) {
        portfolioItems.push({
          id: item.sys.id,
          title: f.title || f.name || "Untitled",
          desc: f.description || "",
          tech: f.technologies || f.tech || "",
          image: img,
        });
      }
    }

    return NextResponse.json({
      products,
      tours,
      donationTiers,
      portfolioItems,
    });
  } catch (err) {
    const msg = err?.message || String(err);
    return NextResponse.json({ error: "Catalog error", details: msg }, { status: 500 });
  }
}
