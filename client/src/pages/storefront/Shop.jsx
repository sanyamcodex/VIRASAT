import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const categories = useFetch('/categories', []);

  // Local form state seeded from the URL.
  const [q, setQ] = useState(params.get('q') || '');
  const [category, setCategory] = useState(params.get('category') || '');
  const [minPrice, setMinPrice] = useState(params.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') || '');

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

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <h1 className="font-display text-4xl text-navy">Shop</h1>

      <form onSubmit={applyFilters} className="mt-6 grid gap-3 md:grid-cols-5">
        <Input
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="md:col-span-2"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
        >
          <option value="">All categories</option>
          {categories.data?.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <Input
          type="number"
          placeholder="Min ₹"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Max ₹"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <Button type="submit" className="md:col-span-5 md:w-40">
          Apply filters
        </Button>
      </form>

      {loading ? (
        <Loader />
      ) : error ? (
        <ErrorState message={error} />
      ) : data?.items?.length ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
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
              <span className="text-sm text-navy/60">
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
  );
}
