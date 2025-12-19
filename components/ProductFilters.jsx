// components/ProductFilters.jsx
import { useMemo } from 'react';

export default function ProductFilters({ products, filters, setFilters }) {
  const categories = useMemo(
    () => Array.from(new Set(products.map(p => p.category).filter(Boolean))),
    [products]
  );

  const subcategories = useMemo(() => {
    if (!filters.category) return [];
    return Array.from(
      new Set(
        products
          .filter(p => p.category === filters.category)
          .map(p => p.subcategory)
          .filter(Boolean)
      )
    );
  }, [products, filters.category]);

  const attributes = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .flatMap(p => p.attributes || [])
            .filter(Boolean)
        )
      ),
    [products]
  );

  return (
    <section className="filters flex flex-wrap gap-3 mb-4 text-sm text-white">
      <div className="flex flex-col">
        <label className="mb-1">Category</label>
        <select
          className="bg-black/60 border border-gray-600 rounded px-2 py-1"
          value={filters.category || ''}
          onChange={e =>
            setFilters(prev => ({
              ...prev,
              category: e.target.value || null,
              subcategory: null,
            }))
          }
        >
          <option value="">All</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1">Subcategory</label>
        <select
          className="bg-black/60 border border-gray-600 rounded px-2 py-1"
          value={filters.subcategory || ''}
          onChange={e =>
            setFilters(prev => ({ ...prev, subcategory: e.target.value || null }))
          }
          disabled={!filters.category}
        >
          <option value="">All</option>
          {subcategories.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="mb-1">Attribute</label>
        <select
          className="bg-black/60 border border-gray-600 rounded px-2 py-1"
          value={filters.attribute || ''}
          onChange={e =>
            setFilters(prev => ({ ...prev, attribute: e.target.value || null }))
          }
        >
          <option value="">Any</option>
          {attributes.map(attr => (
            <option key={attr} value={attr}>{attr}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col flex-1 min-w-[160px]">
        <label className="mb-1">Search</label>
        <input
          className="bg-black/60 border border-gray-600 rounded px-2 py-1"
          type="text"
          placeholder="Search name or tags..."
          value={filters.search || ''}
          onChange={e =>
            setFilters(prev => ({ ...prev, search: e.target.value || '' }))
          }
        />
      </div>
    </section>
  );
}
