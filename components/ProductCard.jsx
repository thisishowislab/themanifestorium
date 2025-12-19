// components/ProductCard.jsx
import Link from 'next/link';

export default function ProductCard({ product }) {
  const {
    slug,
    name,
    price,
    category,
    subcategory,
    image,
    altText,
    attributes = [],
  } = product;

  const imageUrl = image?.fields?.file?.url
    ? `https:${image.fields.file.url}`
    : null;

  return (
    <article className="product-card border rounded-lg p-3 bg-black/40 text-white flex flex-col gap-2">
      {imageUrl && (
        <Link href={`/products/${slug}`} className="block overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={altText || name}
            className="w-full h-48 object-cover transition-transform duration-200 hover:scale-105"
          />
        </Link>
      )}

      <div className="flex-1 flex flex-col gap-1">
        <h2 className="font-semibold text-lg">
          <Link href={`/products/${slug}`}>{name}</Link>
        </h2>

        <div className="text-sm text-gray-300">
          {category && <span>{category}</span>}
          {subcategory && (
            <>
              {' '}• <span>{subcategory}</span>
            </>
          )}
        </div>

        <div className="font-bold text-base mt-1">
          {typeof price === 'number' ? `$${price.toFixed(2)}` : ''}
        </div>

        {attributes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 text-xs text-gray-200">
            {attributes.slice(0, 3).map(attr => (
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
