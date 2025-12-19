// lib/contentful.js
import { createClient } from "contentful";

const client = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_DELIVERY_TOKEN,
});

// TODO: Set this to your Content Type API ID (Contentful -> Content model -> Info -> API ID)
const CONTENT_TYPE_ID = "YOUR_CONTENT_TYPE_ID_HERE";

/**
 * Normalize Variant UX into a predictable array:
 * [
 *   { key: "small", label: "Small", amount: 28, priceId: "price_..." },
 *   ...
 * ]
 *
 * Supports either:
 * - Object map: { small: {label, amount, priceId}, large: {...} }
 * - Array: [ {key,label,amount,priceId}, ... ] or [ {label,amount,priceId}, ... ]
 */
function normalizeVariants(variantUX) {
  if (!variantUX) return [];

  // If it's already an array
  if (Array.isArray(variantUX)) {
    return variantUX
      .map((v, idx) => ({
        key: v.key || v.id || v.sku || String(idx),
        label: v.label ?? `Option ${idx + 1}`,
        amount: typeof v.amount === "number" ? v.amount : Number(v.amount),
        priceId: v.priceId,
      }))
      .filter(v => v.priceId);
  }

  // If it's an object map
  if (typeof variantUX === "object") {
    return Object.entries(variantUX)
      .map(([key, v]) => ({
        key,
        label: v?.label ?? key,
        amount: typeof v?.amount === "number" ? v.amount : Number(v?.amount),
        priceId: v?.priceId,
      }))
      .filter(v => v.priceId);
  }

  return [];
}

function mapProduct(entry) {
  const f = entry.fields;

  const variants = normalizeVariants(f.variantUX);

  // Images: list field in Contentful
  const images = Array.isArray(f.productImages) ? f.productImages : [];

  // Hero image: first image if available
  const heroImage = images[0] || null;

  // Pick a display price:
  // - If variants exist, show the first variant amount
  // - Otherwise null (or you can fall back to a separate field later)
  const displayPrice =
    variants.length > 0 && typeof variants[0].amount === "number"
      ? variants[0].amount
      : null;

  return {
    id: entry.sys.id,

    // You should add a slug field in Contentful for routing:
    slug: f.slug,

    name: f.productName,
    description: f.productDescription,

    category: f.category || null,
    subcategory: f.subcategory || null,

    attributes: f.attributes || [],
    tags: f.tags || [],

    images,
    image: heroImage, // for cards

    variants,
    price: displayPrice, // for simple display (variants are the truth)
  };
}

export async function fetchAllProducts() {
  const res = await client.getEntries({
    content_type: CONTENT_TYPE_ID,
    order: ["fields.category", "fields.productName"],
  });

  return res.items.map(mapProduct);
}

export async function fetchProductBySlug(slug) {
  const res = await client.getEntries({
    content_type: CONTENT_TYPE_ID,
    limit: 1,
    "fields.slug": slug,
  });

  if (!res.items.length) return null;
  return mapProduct(res.items[0]);
}

export async function fetchAllProductSlugs() {
  const res = await client.getEntries({
    content_type: CONTENT_TYPE_ID,
    select: ["fields.slug"],
  });

  return res.items.map(i => i.fields.slug).filter(Boolean);
}

