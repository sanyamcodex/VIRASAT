import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import Button from '../../components/ui/Button';
import ProductCard from '../../components/ProductCard';
import CategoryCard from '../../components/CategoryCard';
import FeaturedArtisans from '../../components/FeaturedArtisans';
import Reveal from '../../components/Reveal';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

export default function Home() {
  const categories = useFetch('/categories', []);
  const featured = useFetch('/products?featured=true&limit=8', []);

  return (
    <div>
      {/* Hero — cinematic full-bleed with layered warmth */}
      <section className="relative overflow-hidden bg-navy text-cream">
        {/* Ambient depth: radial terracotta glow + soft gold wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 85% 15%, rgba(201,98,43,0.28) 0%, transparent 55%), radial-gradient(90% 80% at 0% 100%, rgba(201,162,75,0.16) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-26 md:grid-cols-2 md:items-center md:gap-8">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold">
              India&apos;s Artisan Marketplace
            </div>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] text-cream md:text-7xl">
              Where heritage craft meets{' '}
              <span className="text-terracotta">fair trade</span>.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-cream/70">
              Buy directly from India&apos;s master artisans — verified makers,
              authentic handmade goods, and the stories woven into every piece.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button as={Link} to="/shop" size="lg" className="shadow-md">
                Shop the collection
              </Button>
              <Button as={Link} to="/art-forms" size="lg" variant="outline" className="!text-cream !border-cream/40 hover:bg-cream/10">
                Explore Art Forms
              </Button>
            </div>
          </div>
          <div className="hidden justify-end md:flex">
            <div className="rotate-3 rounded-card bg-cream p-3 pb-6 shadow-polaroid transition duration-500 ease-out hover:rotate-0">
              {/* Looping craft footage — artisan shaping clay on the wheel. */}
              <video
                className="h-72 w-56 rounded-sm bg-terracotta/20 object-cover"
                src="https://assets.mixkit.co/videos/32103/32103-720.mp4"
                poster="https://assets.mixkit.co/videos/32103/32103-thumb-360-0.jpg"
                autoPlay
                muted
                loop
                playsInline
              />
              <div className="mt-3 font-display text-lg text-navy">Handmade · Heritage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured artisans (hidden when none) */}
      <FeaturedArtisans />

      {/* Category browse */}
      <Reveal as="section" className="mx-auto max-w-7xl px-6 py-22">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-terracotta">
            Browse by category
          </div>
          <h2 className="mt-3 font-display text-4xl text-navy md:text-5xl">
            Explore Indian crafts
          </h2>
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
      </Reveal>

      {/* Featured products */}
      <Reveal as="section" className="mx-auto max-w-7xl px-6 pb-26">
        <div className="flex items-end justify-between border-b border-navy/10 pb-5">
          <h2 className="font-display text-3xl text-navy md:text-4xl">Featured pieces</h2>
          <Link
            to="/shop"
            className="text-sm font-medium text-terracotta hover:underline"
          >
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
      </Reveal>
    </div>
  );
}
