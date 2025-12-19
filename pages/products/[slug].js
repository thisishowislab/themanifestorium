// pages/products/[slug].js
import { fetchAllProductSlugs, fetchProductBySlug } from '@/lib/contentful';
import Link from 'next/link';

export default function ProductPage({ product }) {
  if (!product) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Product not found.</p>
      </main>
    );
  }

  const imageUrl = product.image?.fields?.file?.url
    ? `https:${product.image.fields.file.url}`
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/marketplace" className="text-sm text-purple-300 hover:underline">
          ← Back to marketplace
        </Link>

        <section className="mt-4 grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={product.altText || product.name}
                className="w-full rounded-lg object-cover shadow-lg"
              />
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="text-sm text-gray-300">
              {product.category && <span>{product.category}</span>}
              {product.subcategory && (
                <>
                  {' '}• <span>{product.subcategory}</span>
                </>
              )}
            </div>

            <div className="text-2xl font-semibold">
              {typeof product.price === 'number' ? `$${product.price.toFixed(2)}` : ''}
            </div>

            <p className="text-sm text-gray-200">
              {product.description}
            </p>

            {product.materials && (
              <p className="text-xs text-gray-300">
                <span className="font-semibold">Materials:</span> {product.materials}
              </p>
            )}

            {product.dimensions && (
              <p className="text-xs text-gray-300">
                <span className="font-semibold">Dimensions:</span> {product.dimensions}
              </p>
            )}

            {product.attributes?.length > 0 && (
              <div className="flex flex-wrap gap-1 text-xs text-gray-200">
                {product.attributes.map(attr => (
                  <span
                    key={attr}
                    className="px-2 py-0.5 rounded-full bg-purple-700/60 border border-purple-400/50"
                  >
                    {attr}
                  </span>
                ))}
              </div>
            )}

            {/* Placeholder for Stripe checkout button */}
            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold hover:bg-purple-500"
              onClick={() => {
                // TODO: wire to your existing Stripe checkout flow
                alert('Wire this button to Stripe checkout using stripePriceId.');
              }}
            >
              Adopt this misfit
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export async function getStaticPaths() {
  const slugs = await fetchAllProductSlugs();

  return {
    paths: slugs.map(slug => ({ params: { slug } })),
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  const product = await fetchProductBySlug(params.slug);

  if (!product) {
    return { notFound: true };
  }

  return {
    props: { product },
    revalidate: 60,
  };
}
