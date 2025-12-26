// lib/shopHelpers.js

export function normalizeUrl(u) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  return `https://${u.replace(/^\/+/, "")}`;
}

export function contentfulAssetToUrl(asset) {
  const u =
    asset?.fields?.file?.url ||
    asset?.file?.url ||
    asset?.url ||
    null;

  return normalizeUrl(u);
}

export function productToImageUrls(product) {
  const assets = Array.isArray(product?.images)
    ? product.images
    : product?.image
      ? [product.image]
      : [];

  return assets.map(contentfulAssetToUrl).filter(Boolean);
}

// If you store variants like { defaultKey, variants: { key: { price } } }
export function getDisplayPrice(product) {
  if (typeof product?.price === "number") return product.price;

  const v = product?.variants;
  const key = v?.defaultKey;
  const chosen = key ? v?.variants?.[key] : null;

  if (chosen && typeof chosen.price === "number") return chosen.price;

  const prices = v?.variants
    ? Object.values(v.variants).map(x => x?.price).filter(p => typeof p === "number")
    : [];

  return prices.length ? Math.min(...prices) : undefined;
}
