import ProductCard from "@/components/ProductCard";
import VariantBuyBox from "@/components/VariantBuyBox";
import { fetchAllProducts, fetchProductBySlug, fetchAllProductSlugs } from "@/lib/contentful";

export const revalidate = 60;

function getRelated(all, current) {
  const sameCat = all.filter(
    p => p.slug !== current.slug && p.category && p.category === current.category
  );

  const sameSub = current.subcategory
    ? sameCat.filter(p => p.subcategory === current.subcategory)
    : [];

  const pool = sameSub.length >= 3 ? sameSub : sameCat;
  return pool.sort(() => Math.random() - 0.5).slice(0, 6);
}

export async function generateStaticParams() {
  const slugs = await fetchAllProductSlugs();
  return slugs.map(slug => ({ slug }));
}

export default async function ProductPage({ params }) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) return <main className="p-6 text-white">Not found.</main>;

  const all = await fetchAllProducts();
  const related = getRelated(all, product);

  const imageUrls = (product.images || [])
    .map(a => a?.fields?.file?.url)
    .filter(Boolean)
    .map(u => `https:${u}`);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 py-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold">{product.name}</h1>

        <div className="text-sm text-gray-300 mt-1">
          {product.category}
          {product.subcategory ? ` • ${product.subcategory}` : ""}
        </div>

        {/* Image gallery */}
        {imageUrls.length > 0 && (
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3 mt-4">
            {imageUrls.map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={url}
                src={url}
                alt={product.name}
                className="w-full h-44 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="mt-4 text-gray-100 whitespace-pre-wrap">
            {product.description}
          </p>
        )}

        {/* Attributes */}
        {product.attributes?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 text-xs">
            {product.attributes.map(a => (
              <span key={a} className="px-2 py-1 rounded-full bg-purple-700/50 border border-purple-400/40">
                {a}
              </span>
            ))}
          </div>
        )}

        {/* Buy box (variants + stripe) */}
        <VariantBuyBox variants={product.variants} productName={product.name} />

        {/* Related items */}
        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-3">Related misfits</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(p => <ProductCard key={p.slug} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
