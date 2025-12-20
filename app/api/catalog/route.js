// app/api/catalog/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * This endpoint:
 * - Fetches Contentful entries (using env vars already in Vercel)
 * - Builds an Asset map for images
 * - Builds a pricing lookup from your Contentful JSON field: variantUx
 * - Merges pricing onto products/tours/donation tiers by key (slug preferred)
 *
 * IMPORTANT:
 * - Your pricing JSON field is: variantUx
 * - That JSON should contain at least: { price: number, priceId: "price_..." }
 */

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
  // BEST: slug. If your products don't have slug yet, it will fallback to productName/tourName/tierName.
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

    // Build pricing lookup from entries that have variantUx JSON
    // variantUx should look like: { price: 25, priceId: "price_123" }
    const pricingByKey = {};

    for (const item of data.items || []) {
      const f = item.fields || {};
      const parsed = safeJson(f.variantUx);
      const key = toKey(f);

      if (key && parsed && (parsed.priceId || parsed.stripePriceId || parsed.price || parsed.amount)) {
        pricingByKey[String(key)] = parsed;
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

      const key = toKey(f);
      const pr = key ? pricingByKey[String(key)] : null;

      const mergedPrice = Number(pr?.price ?? pr?.amount ?? f.price ?? 0);
      const mergedPriceId = pr?.priceId ?? pr?.stripePriceId ?? f.stripePriceId ?? null;

      // Classify by field presence (avoids brittle contentType ID problems)
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
