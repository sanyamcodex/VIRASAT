import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useFetch from '../../hooks/useFetch';
import api from '../../lib/api';
import { formatINR } from '../../lib/format';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import RatingStars from '../../components/RatingStars';
import { Loader, ErrorState } from '../../components/StateViews';

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, loading, error } = useFetch(`/products/${id}`, [id]);
  const reviews = useFetch(`/products/${id}/reviews`, [id]);
  const { role } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const { register, handleSubmit, reset, formState } = useForm();
  const [submitErr, setSubmitErr] = useState('');

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;
  if (!product) return null;

  const artisan = product.artisanProfile;
  const img = product.images?.[0]?.url;

  const submitReview = async (values) => {
    setSubmitErr('');
    try {
      await api.post(`/products/${id}/reviews`, {
        rating: Number(values.rating),
        comment: values.comment,
      });
      reset();
      reviews.refetch();
    } catch (e) {
      setSubmitErr(e.response?.data?.message || 'Could not submit review');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="grid gap-10 md:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-white ring-1 ring-navy/5">
            {img ? (
              <img src={img} alt={product.title} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-navy/30">No image</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((im, i) => (
                <img
                  key={i}
                  src={im.url}
                  alt=""
                  className="h-16 w-16 rounded object-cover ring-1 ring-navy/10"
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category?.name && <Badge variant="neutral">{product.category.name}</Badge>}
          <h1 className="mt-2 font-display text-4xl text-navy">{product.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <RatingStars value={reviews.data?.average || 0} />
            <span className="text-sm text-navy/50">
              {reviews.data?.count || 0} review(s)
            </span>
          </div>
          <div className="mt-4 text-2xl font-semibold text-navy">
            {formatINR(product.price)}
          </div>
          <p className="mt-4 text-navy/70">{product.description}</p>

          <div className="mt-6 flex gap-3">
            <Button size="lg" onClick={() => addItem(product)}>
              Add to cart
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                toggle({
                  _id: product._id,
                  title: product.title,
                  price: product.price,
                  images: product.images,
                })
              }
            >
              ♡ Wishlist
            </Button>
          </div>

          {/* Artisan story snippet */}
          {artisan && (
            <div className="mt-8 rounded-xl bg-white p-5 ring-1 ring-navy/5">
              <div className="flex items-center gap-2">
                <h3 className="font-display text-xl text-navy">Meet the artisan</h3>
                {artisan.verified && <Badge variant="gi">Verified</Badge>}
              </div>
              {(artisan.craft || artisan.region) && (
                <div className="mt-1 text-sm text-terracotta">
                  {[artisan.craft, artisan.region].filter(Boolean).join(' · ')}
                </div>
              )}
              <p className="mt-2 line-clamp-3 text-sm text-navy/70">
                {artisan.story || artisan.bio || 'A master of their craft.'}
              </p>
              <Link
                to={`/artisans/${artisan._id}`}
                className="mt-2 inline-block text-sm text-terracotta hover:underline"
              >
                Read their full story →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className="font-display text-2xl text-navy">Reviews</h2>

        {role === 'user' && (
          <form
            onSubmit={handleSubmit(submitReview)}
            className="mt-4 rounded-xl bg-white p-5 ring-1 ring-navy/5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start">
              <select
                {...register('rating', { required: true })}
                defaultValue="5"
                className="rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
              <textarea
                {...register('comment')}
                placeholder="Share your experience…"
                className="min-h-[44px] flex-1 rounded-lg border border-navy/15 bg-white px-3 py-2 text-navy"
              />
              <Button type="submit" disabled={formState.isSubmitting}>
                Post
              </Button>
            </div>
            {submitErr && <p className="mt-2 text-sm text-red-500">{submitErr}</p>}
          </form>
        )}

        <div className="mt-6 space-y-4">
          {reviews.data?.reviews?.length ? (
            reviews.data.reviews.map((r) => (
              <div key={r._id} className="rounded-lg bg-white p-4 ring-1 ring-navy/5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-navy">{r.user?.name || 'Buyer'}</span>
                  <RatingStars value={r.rating} />
                </div>
                {r.comment && <p className="mt-1 text-sm text-navy/70">{r.comment}</p>}
              </div>
            ))
          ) : (
            <p className="text-navy/50">No reviews yet — be the first.</p>
          )}
        </div>
      </section>
    </div>
  );
}
