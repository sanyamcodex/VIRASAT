import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ProductCard';
import CategoryCard from '../../components/CategoryCard';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

export default function Home() {
  const categories = useFetch('/categories', []);
  const featured = useFetch('/products?featured=true&limit=8', []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-navy text-cream">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold">
              India&apos;s Artisan Marketplace
            </div>
            <h1 className="mt-4 font-display text-5xl leading-tight md:text-6xl">
              Where heritage craft meets{' '}
              <span className="text-terracotta">fair trade</span>.
            </h1>
            <p className="mt-5 max-w-md text-cream/70">
              Buy directly from India&apos;s master artisans — verified makers,
              authentic handmade goods, and the stories woven into every piece.
            </p>
            <div className="mt-8 flex gap-3">
              <Button as={Link} to="/shop" size="lg">
                Shop the collection
              </Button>
              <Button as={Link} to="/art-forms" size="lg" variant="outline" className="border-cream/30 text-cream hover:bg-cream/10">
                Explore art forms
              </Button>
            </div>
          </div>
          <div className="hidden justify-end md:flex">
            <div className="rotate-3 rounded-md bg-cream p-3 pb-6 shadow-2xl">
              <div className="grid h-72 w-56 place-items-center rounded-sm bg-terracotta/20 font-display text-2xl text-navy">
                हस्तकला
              </div>
              <div className="mt-3 font-display text-lg text-navy">Handmade · Heritage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category browse */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-terracotta">
            Browse by category
          </div>
          <h2 className="mt-2 font-display text-4xl text-navy">Explore Indian crafts</h2>
        </div>
        {categories.loading ? (
          <Loader />
        ) : categories.error ? (
          <ErrorState message={categories.error} />
        ) : categories.data?.length ? (
          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4 lg:grid-cols-5">
            {categories.data.slice(0, 10).map((c) => (
              <CategoryCard key={c._id} category={c} />
            ))}
          </div>
        ) : (
          <Empty message="Categories coming soon." />
        )}
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl text-navy">Featured pieces</h2>
          <Link to="/shop" className="text-sm text-terracotta hover:underline">
            View all →
          </Link>
        </div>
        {featured.loading ? (
          <Loader />
        ) : featured.error ? (
          <ErrorState message={featured.error} />
        ) : featured.data?.items?.length ? (
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {featured.data.items.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        ) : (
          <Empty message="No featured products yet." />
        )}
      </section>
    </div>
  );
}
