// pages/marketplace.js
import { useMemo, useState } from 'react';
import { fetchAllProducts } from '@/lib/contentful';
import ProductCard from '@/components/ProductCard';
import ProductFilters from '@/components/ProductFilters';

export default function MarketplacePage({ products }) {
  const [filters, setFilters] = useState({
    category: null,
    subcategory: null,
    attribute: null,
    search: '',
  });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filters.category && p.category !== filters.category) return false;
      if (filters.subcategory && p.subcategory !== filters.subcategory) return false;
      if (filters.attribute) {
        const attrs = p.attributes || [];
        if (!attrs.includes(filters.attribute)) return false;
      }
      if (filters.search) {
        const text = `${p.name} ${p.description || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
        if (!text.includes(filters.search.toLowerCase())) return false;
      }
      return true;
    });
  }, [products, filters]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black text-white px-4 py-6">
      <header className="max-w-5xl mx-auto mb-6">
        <h1 className="text-3xl font-bold mb-2">Manifestorium Marketplace</h1>
        <p className="text-sm text-gray-300">
          Adopt a misfit, relic, or artifact from the desert. Every piece is one-of-a-kind.
        </p>
      </header>

      <section className="max-w-5xl mx-auto">
        <ProductFilters products={products} filters={filters} setFilters={setFilters} />

        {filteredProducts.length === 0 ? (
          <p className="mt-4 text-gray-300 text-sm">
            No items match those filters yet. Try clearing something.
          </p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(product => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export async function getStaticProps() {
  const products = await fetchAllProducts();

  return {
    props: { products },
    revalidate: 60, // rebuild marketplace at most once a minute
  };
}
