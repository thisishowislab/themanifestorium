// components/ProductCard.jsx
import Link from "next/link";

/* ---------- helpers (kept inside this file) ---------- */
function normalizeUrl(u) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  return `https://${u.replace(/^\/+/, "")}`;
}

function renderInlineTags(text) {
  if (!text) return null;

  const parts = [];
  const regex = /\[(bold|cyan|purple)\]([\s\S]*?)\[\/\1\]/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const [full, tag, content] = match;
    const start = match.index;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    const className =
      tag === "bold"
        ? "font-semibold"
        : tag === "cyan"
        ? "text-cyan-300 font-semibold"
        : "text-purple-300 font-semibold";

    parts.push(
      <span key={`${start}-${tag}`} className={className}>
        {content}
      </span>
    );

    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function renderTextBlock(text) {
  if (!text) return null;

  return String(text)
    .split("\n")
    .map((line, i) => (
      <p key={i} className="leading-relaxed mb-2 last:mb-0">
        {renderInlineTags(line)}
      </p>
    ));
}

/* ---------- component ---------- */
export default function ProductCard({ product }) {
  const {
    slug,
    name,
    price,
    category,
    subcategory,
    altText,
    attributes = [],
    description,
  } = product || {};

  const rawAssets = Array.isArray(product?.images)
    ? product.images
    : product?.image
    ? [product.image]
    : [];

  const imageUrls = rawAssets
    .map((a) => a?.fields?.file?.url || a?.file?.url || a?.url)
    .map(normalizeUrl)
    .filter(Boolean);

  const heroUrl = imageUrls[0];

  return (
    <article className="border rounded-lg p-3 bg-black/40 text-white flex flex-col gap-2">
      {heroUrl && (
        <Link href={`/products/${slug}`} className="block overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroUrl}
            alt={altText || name}
            className="w-full h-48 object-cover hover:scale-105 transition-transform"
            loading="lazy"
          />
        </Link>
      )}

      <div className="flex-1 flex flex-col gap-2">
        <h2 className="font-semibold text-lg">
          <Link href={`/products/${slug}`}>{name}</Link>
        </h2>

        <div className="text-sm text-gray-300">
          {category}
          {subcategory ? ` • ${subcategory}` : ""}
        </div>

        {typeof price === "number" && (
          <div className="font-bold text-base">${price.toFixed(2)}</div>
        )}

        {description && (
          <div className="text-sm text-gray-200">
            {renderTextBlock(description)}
          </div>
        )}

        {attributes.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs text-gray-200">
            {attributes.slice(0, 3).map((attr) => (
              <span
                key={attr}
                className="px-2 py-0.5 rounded-full bg-purple-700/60 border border-purple-400/50"
              >
                {attr}
              </span>
            ))}
          </div>
        )}
      </div>

      <Link
        href={`/products/${slug}`}
        className="mt-2 inline-flex items-center justify-center rounded-md border border-purple-400/70 px-3 py-1 text-sm hover:bg-purple-500/30"
      >
        View details →
      </Link>
    </article>
  );
}
