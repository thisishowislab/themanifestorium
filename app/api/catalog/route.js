// app/api/catalog/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // IMPORTANT: ensures this runs server-side (not edge)

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

export async function GET() {
  try {
    if (!SPACE_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Missing Contentful env vars (CONTENTFUL_SPACE_ID / CONTENTFUL_ACCESS_TOKEN)" },
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
        { error: `Contentful error ${response.status}`, details: text.slice(0, 500) },
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

    // ---- Collect pricing entries (your “JSON pricing file” in Contentful) ----
    // We don’t assume the content type ID (because that was the trap).
    // We detect pricing entries by the presence of a JSON-ish field.
    const pricingByKey = {}; // key: slug or productKey -> { price, priceId }

    for (const item of data.items) {
      const f = item.fields || {};

      // Guess candidate fields where your pricing JSON might live
      const jsonCandidate =
        f.pricingJson ?? f.pricing ?? f.json ?? f.priceData ?? null;

      const parsed = safeJson(jsonCandidate);

      // We also need a key to match this pricing to a product
      // Best key is slug. If you used another field, add it here.
      const key =
        f.slug ?? f.productSlug ?? f.productKey ?? f.key ?? f.productName ?? null;

      if (key && parsed && (parsed.priceId || parsed.stripePriceId || parsed.price)) {
        pricingByKey[String(key)] = parsed;
      }
    }

    // ---- Build products/tours/tiers, and MERGE pricing JSON ----
    const prods = [];
    const tours = [];
    const tiers = [];
    const port = [];

    for (const item of data.items) {
      const f = item.fields || {};

      // image from common fields
      const imgField = f.productImage || f.tourImage || f.image;
      const img = imgField?.sys?.id ? getImageUrl(assetMap[imgField.sys.id]) : null;

      // A stable key used for pricing lookup:
      const key = String(f.slug ?? f.productSlug ?? f.productKey ?? f.key ?? f.productName ?? "");

      // Pricing override from JSON “pricing file”
      const pr = key ? pricingByKey[key] : null;

      const mergedPrice = Number(
        pr?.price ?? pr?.amount ?? f.price ?? 0
      );

      const mergedPriceId =
        pr?.priceId ?? pr?.stripePriceId ?? f.stripePriceId ?? null;

      // ---- Field-based classification (avoids content type ID mismatch hell) ----
      // Product
      if (f.productName || f.productDescription) {
        prods.push({
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

      // Tour
      if (f.tourName || f.tourDescription) {
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

      // Donationերն
      if (f.tierName || f.tierDescription) {
        tiers.push({
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
        port.push({
          id: item.sys.id,
          title: f.title || f.name || "Untitled",
          desc: f.description || "",
          tech: f.technologies || f.tech || "",
          image: img,
        });
      }
    }

    return NextResponse.json({
      products: prods,
      tours,
      donationTiers: tiers,
      portfolioItems: port,
    });
  } catch (err) {
    const msg = err?.message || String(err);
    return NextResponse.json({ error: "Catalog error", details: msg }, { status: 500 });
  }
}
