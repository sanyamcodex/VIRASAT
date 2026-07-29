import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import ProductCard from '../../components/ProductCard';
import Badge from '../../components/ui/Badge';
import Reveal from '../../components/Reveal';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

export default function ArtisanStory() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/artisans/${id}`, [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { profile, products } = data;
  const portrait = profile.photos?.[0]?.url;
  const galleryPhotos = profile.photos?.slice(1) || [];

  return (
    <div>
      {/* Hero band — editorial, heritage framing */}
      <section className="relative overflow-hidden bg-navy text-cream">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(110% 90% at 90% 10%, rgba(201,98,43,0.25) 0%, transparent 55%), radial-gradient(90% 80% at 0% 100%, rgba(201,162,75,0.14) 0%, transparent 50%)',
          }}
        />
        <div className="relative mx-auto grid max-w-5xl gap-10 px-6 py-20 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold">
              The hands behind the craft
            </div>
            <div className="mt-4 flex items-center gap-3">
              <h1 className="font-display text-4xl text-cream md:text-5xl">
                {profile.user?.name || 'Artisan'}
              </h1>
              {profile.verified && <Badge variant="gi">Verified</Badge>}
            </div>
            {(profile.craft || profile.region) && (
              <div className="mt-3 font-display text-lg text-terracotta">
                {[profile.craft, profile.region].filter(Boolean).join(' · ')}
              </div>
            )}
            {profile.bio && (
              <p className="mt-5 max-w-2xl leading-relaxed text-cream/80">{profile.bio}</p>
            )}
          </div>

          {/* Framed portrait — polaroid heritage motif */}
          {portrait && (
            <div className="hidden justify-end md:flex">
              <div className="-rotate-2 rounded-card bg-cream p-3 pb-6 shadow-polaroid">
                <img
                  src={portrait}
                  alt={profile.user?.name || 'Artisan'}
                  className="h-64 w-56 rounded-sm object-cover"
                />
                <div className="mt-3 text-center font-display text-sm text-navy">
                  Master Artisan
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-16">
        {profile.story && (
          <Reveal as="section" className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-terracotta">
              Their story
            </div>
            {/* Pull-quote framing for warmth */}
            <blockquote className="mt-4 border-l-2 border-terracotta/40 pl-6">
              <p className="whitespace-pre-line font-display text-xl leading-relaxed text-navy/80">
                {profile.story}
              </p>
            </blockquote>
          </Reveal>
        )}

        {galleryPhotos.length > 0 && (
          <Reveal as="section" className="mt-14">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {galleryPhotos.map((ph, i) => (
                <img
                  key={i}
                  src={ph.url}
                  alt=""
                  className="aspect-square w-full rounded-card object-cover shadow-sm ring-1 ring-navy/10"
                />
              ))}
            </div>
          </Reveal>
        )}

        <Reveal as="section" className="mt-12">
          <h2 className="font-display text-2xl text-navy">Their creations</h2>
          {products?.length ? (
            <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <Empty message="No products listed yet." />
          )}
        </Reveal>
      </div>
    </div>
  );
}
