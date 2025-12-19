import ProductCard from '@/components/ProductCard';
import { fetchAllProducts } from '@/lib/contentful';

export const revalidate = 60;

export default async function MarketplacePage() {
  const products = await fetchAllProducts();
  // Basic first version: grid only (filters can be a client component later)
  return (
    <main className="min-h-screen px-4 py-6">
      <h1 className="text-3xl font-bold mb-4">Manifestorium Marketplace</h1>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => <ProductCard key={p.slug} product={p} />)}
      </div>
    </main>
  );
}
