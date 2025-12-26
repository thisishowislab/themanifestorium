// components/ProductCard.jsx
import Link from "next/link";

/** ---- helpers (kept inside this file so you don't have to create more files) ---- */
function normalizeUrl(u) {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  // handles "images.ctfassets.net/..." or "/images.ctfassets.net/..."
  return `https://${u.replace(/^\/+/, "")}`;
}

function renderInlineTags(line) {
  // Supports: [bold]...[/bold], [cyan]...[/cyan], [purple]...[/purple]
  const tagRegex = /\[(bold|cyan|purple)\]([\s\S]*?)\[\/\1\]/g;

  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(line)) !== null) {
    const [full, tag, content] = match;
    const start = match.index;

    if (start > lastIndex) parts.push(line.slice(lastIndex, start));

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

  if (lastIndex < line.length) parts.push(line.slice(lastIndex));
  return parts;
}

function renderTaggedText(text) {
  if (!text) return null;
  // Preserve line breaks from Contentful long text fields
  const lines = String(text).split("\n");
  return lines.map((line, i) => (
    <p key={i} className="leading-relaxed mb-2 last:mb-0">
      {renderInlineTags(line)}
    </p>
  ));
}

/** ---- component ---- */
export default function ProductCard({ product }) {
  const {
    slug,
    name,
    price,
    category,
    subcategory,
    altText,
    attributes = [],
    description, // if you have it
  } = product || {};

  // Accept both product.images (array) and product.image (single)
  const rawAssets = Array.isArray(product?.images)
    ? product.images
    : product?.image
      ? [product.image]
      : [];

  const imageUrls = rawAssets
    .map((a) => a?.fields?.file?.url || a?.file?.url || a?.url || null)
    .map(normalizeUrl)
    .filter(Boolean);

  const heroUrl = imageUrls[0];

  return (
    <article className="product-card border rounded-lg p-3 bg-black/40 text-white flex flex-col gap-2">
      {/* Debug (ONLY in dev) */}
      {process.env.NODE_ENV !== "production" && (
        <div className="text-[10px] opacity-70 break-all">
          img: {heroUrl || "NO IMAGE URL"}
        </div>
      )}

      {/* Images */}
      {imageUrls.length > 0 && (
        <Link href={`/products/${slug}`} className="block overflow-hidden rounded-md">
          <div className={imageUrls.length > 1 ? "grid gap-2 grid-cols-2" : ""}>
            {imageUrls.slice(0, 4).map((url, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${url}-${idx}`}
                src={url}
                alt={altText || name || "Product image"}
                className={
                  imageUrls.length > 1
                    ? "w-full aspect-square rounded-lg object-cover"
                    : "w-full h-48 object-cover transition-transform duration-200 hover:scale-105"
                }
                loading="lazy"
              />
            ))}
          </div>
        </Link>
      )}

      <div className="flex-1 flex flex-col gap-2">
        <h2 className="font-semibold text-lg leading-snug">
          <Link href={`/products/${slug}`}>{name}</Link>
        </h2>

        <div className="text-sm text-gray-300 leading-snug">
          {category && <span>{category}</span>}
          {subcategory && (
            <>
              {" "}• <span>{subcategory}</span>
            </>
          )}
        </div>

        <div className="font-bold text-base">
          {typeof price === "number" ? `$${price.toFixed(2)}` : ""}
        </div>

        {/* Optional description preview (supports line breaks + [bold]/[cyan]/[purple]) */}
        {description ? (
          <div className="text-sm text-gray-200">
            {renderTaggedText(description)}
          </div>
        ) : null}

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
        className="mt-1 inline-flex items-center justify-center rounded-md border border-purple-400/70 px-3 py-1 text-sm hover:bg-purple-500/30"
      >
        View details →
      </Link>
    </article>
  );
}
