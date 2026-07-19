import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import ProductCard from '../../components/ProductCard';
import Badge from '../../components/ui/Badge';
import { Loader, ErrorState, Empty } from '../../components/StateViews';

export default function ArtisanStory() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/artisans/${id}`, [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { profile, products } = data;

  return (
    <div>
      {/* Hero band */}
      <section className="bg-navy text-cream">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-4xl">{profile.user?.name || 'Artisan'}</h1>
            {profile.verified && <Badge variant="gi">Verified</Badge>}
          </div>
          {(profile.craft || profile.region) && (
            <div className="mt-2 text-terracotta">
              {[profile.craft, profile.region].filter(Boolean).join(' · ')}
            </div>
          )}
          {profile.bio && <p className="mt-4 max-w-2xl text-cream/80">{profile.bio}</p>}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {profile.story && (
          <section className="prose max-w-none">
            <h2 className="font-display text-2xl text-navy">Their story</h2>
            <p className="mt-3 whitespace-pre-line text-navy/70">{profile.story}</p>
          </section>
        )}

        {profile.photos?.length > 0 && (
          <section className="mt-10">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {profile.photos.map((ph, i) => (
                <img
                  key={i}
                  src={ph.url}
                  alt=""
                  className="aspect-square w-full rounded-lg object-cover ring-1 ring-navy/10"
                />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
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
        </section>
      </div>
    </div>
  );
}
