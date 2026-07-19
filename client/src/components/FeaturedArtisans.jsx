import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Card from './ui/Card';

// Homepage section for admin-curated featured artisans. Renders nothing when
// there are none (or while loading / on error), so the homepage stays clean.
export default function FeaturedArtisans() {
  const { data, loading, error } = useFetch('/artisans/featured', []);
  if (loading || error || !data?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-terracotta">
          The hands behind the craft
        </div>
        <h2 className="mt-2 font-display text-4xl text-navy">Featured Artisans</h2>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((a) => {
          const photo = a.photos?.[0]?.url;
          const full = a.story || a.bio || '';
          const excerpt = full.length > 120 ? `${full.slice(0, 120)}…` : full;
          return (
            <Card key={a._id} className="overflow-hidden !p-0">
              <Link to={`/artisans/${a._id}`} className="block">
                <div className="aspect-[16/10] bg-navy/5">
                  {photo ? (
                    <img
                      src={photo}
                      alt={a.user?.name || 'Artisan'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-sm text-navy/30">
                      No photo
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl text-navy">
                    {a.user?.name || 'Artisan'}
                  </h3>
                  {(a.craft || a.region) && (
                    <div className="text-sm text-terracotta">
                      {[a.craft, a.region].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  {excerpt && <p className="mt-2 text-sm text-navy/60">{excerpt}</p>}
                  <span className="mt-3 inline-block text-sm text-terracotta">
                    Read their story →
                  </span>
                </div>
              </Link>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
