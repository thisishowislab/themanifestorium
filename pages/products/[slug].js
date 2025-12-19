// pages/products/[slug].js
import { fetchAllProductSlugs, fetchProductBySlug, fetchAllProducts } from '@/lib/contentful';

function getRelated(all, current) {
  const sameCat = all.filter(p => p.slug !== current.slug && p.category === current.category);
  const sameSub = current.subcategory
    ? sameCat.filter(p => p.subcategory === current.subcategory)
    : [];

  const pool = (sameSub.length >= 3) ? sameSub : sameCat;
  // simple shuffle
  return pool.sort(() => Math.random() - 0.5).slice(0, 6);
}

export default function ProductPage({ product, related }) {
  // ...existing UI...
  return (
    <main>
      {/* existing product UI */}

      {related?.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Related misfits</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ marginTop: 12 }}>
            {related.map(p => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export async function getStaticProps({ params }) {
  const product = await fetchProductBySlug(params.slug);
  if (!product) return { notFound: true };

  const all = await fetchAllProducts();
  const related = getRelated(all, product);

  return { props: { product, related }, revalidate: 60 };
}
