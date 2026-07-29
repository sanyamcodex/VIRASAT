import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

// Small collapsible wrapper for a filter group. Purely presentational — the
// open/closed state lives locally and never touches filtering.
function FilterSection({ title, open, onToggle, children }) {
  return (
    <div className="border-b border-navy/10 py-4 first:pt-0 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-navy">
          {title}
        </span>
        <span
          className={`text-stone transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ⌄
        </span>
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const categories = useFetch('/categories', []);

  // Local form state seeded from the URL.
  const [q, setQ] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');

  // Presentational-only: which sidebar groups are expanded.
  const [openSections, setOpenSections] = useState({
    search: true,
    category: true,
    price: true,
  });
  const toggleSection = (key) =>
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  useEffect(() => {
    setCategory(params.get('category') || '');
    setQ(params.get('q') || '');
  }, [params]);

  const page = Number(params.get('page') || 1);
  const query = params.toString();
  const { data, loading, error } = useFetch(`/products?${query}`, [query]);

  const applyFilters = (e) => {
    e?.preventDefault();
    const next = {};
    if (q) next.q = q;
    if (category) next.category = category;
    if (minPrice) next.minPrice = minPrice;
    if (maxPrice) next.maxPrice = maxPrice;
    setParams(next);
  };

  const goPage = (p) => {
    const next = Object.fromEntries(params);
    next.page = p;
    setParams(next);
  };

  // Active-state styling helper for the category list.
  const catBtn = (active) =>
    `w-full rounded-lg px-3 py-2 text-left text-sm transition ${
      active
        ? 'bg-navy text-cream font-medium'
        : 'text-charcoal hover:bg-navy/5'
    }`;

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="border-b border-navy/10 pb-6">
        <div className="text-xs uppercase tracking-[0.3em] text-terracotta">
          The collection
        </div>
        <h1 className="mt-2 font-display text-4xl text-navy md:text-5xl">Shop</h1>
      </div>

      <div className="mt-8 grid gap-10 md:grid-cols-[260px_1fr]">
        {/* Filter sidebar */}
        <aside>
          <form
            onSubmit={applyFilters}
            className="rounded-card bg-white p-5 shadow-sm ring-1 ring-navy/5 md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto"
          >
            <FilterSection
              title="Search"
              open={openSections.search}
              onToggle={() => toggleSection('search')}
            >
              <Input
                placeholder="Search products…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </FilterSection>

            <FilterSection
              title="Category"
              open={openSections.category}
              onToggle={() => toggleSection('category')}
            >
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setCategory('')}
                  className={catBtn(!category)}
                >
                  All categories
                </button>
                {categories.data?.map((c) => (
                  <button
                    key={c._id}
                    type="button"
                    onClick={() => setCategory(c._id)}
                    className={catBtn(category === c._id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="Price"
              open={openSections.price}
              onToggle={() => toggleSection('price')}
            >
              <div className="flex flex-col gap-3">
                <Input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full"
                />
              </div>
            </FilterSection>

            <Button type="submit" className="mt-5 w-full">
              Apply filters
            </Button>
          </form>
        </aside>

        {/* Results */}
        <div>
          {loading ? (
            <Loader />
          ) : error ? (
            <ErrorState message={error} />
          ) : data?.items?.length ? (
            <>
              <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
                {data.items.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              {data.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => goPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-stone">
                    Page {data.page} of {data.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= data.pages}
                    onClick={() => goPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Empty message="No products match your filters." />
          )}
        </div>
      </div>
    </div>
  );
}
