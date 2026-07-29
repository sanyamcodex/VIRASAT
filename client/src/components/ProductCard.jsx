import { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import Badge from './ui/Badge';
import RatingStars from './RatingStars';
import { formatINR } from '../lib/format';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';

// Polaroid-style product card (WeaveHand-inspired layout, VIRASAT branding).
export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.items.some((i) => i._id === product._id));
  const [broken, setBroken] = useState(false);
  const img = product.images?.[0]?.url;

  const artisan = product.artisanProfile;
  const artisanName = artisan?.user?.name;
  // Editorial caption: "By {name} · {region}" from whichever parts exist.
  const caption = [artisanName && `By ${artisanName}`, artisan?.region]
    .filter(Boolean)
    .join(' · ');
  // Rating is not present on listing payloads today — render only if it appears.
  const rating = product.rating ?? product.averageRating;

  return (
    <Card polaroid className="group flex flex-col">
      <Link to={`/product/${product._id}`}>
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-navy/5 ring-1 ring-navy/5">
          {img && !broken ? (
            <img
              src={img}
              alt={product.title}
              className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-stone">
              No image
            </div>
          )}
          {/* Handmade trust badge */}
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-pill bg-cream/95 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-navy shadow-sm backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
            Handmade
          </span>
          {/* GI Tag-style verified badge — verified artisans only */}
          {artisan?.verified && (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-pill bg-gold px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-navy shadow-sm">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M10 1.5l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-.9 2.6.9 2.6-2.2 1.6-.9 2.6-2.7-.2L10 18.5l-2.2-1.6-2.7.2-.9-2.6L2 12.9l.9-2.6L2 7.7l2.2-1.6.9-2.6 2.7.2L10 1.5zm3.03 6.3a.75.75 0 00-1.06-1.06L9 9.72 8.03 8.75a.75.75 0 10-1.06 1.06l1.5 1.5a.75.75 0 001.06 0l3.5-3.5z"
                  clipRule="evenodd"
                />
              </svg>
              GI Verified
            </span>
          )}
          {/* Wishlist heart — floating, polished */}
          <button
            type="button"
            aria-label="Toggle wishlist"
            aria-pressed={inWishlist}
            onClick={(e) => {
              e.preventDefault();
              toggle({
                _id: product._id,
                title: product.title,
                price: product.price,
                images: product.images,
              });
            }}
            className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-cream/95 text-lg shadow-sm backdrop-blur transition hover:scale-110 hover:bg-cream"
          >
            <span className={inWishlist ? 'text-terracotta' : 'text-navy/40'}>
              {inWishlist ? '♥' : '♡'}
            </span>
          </button>
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        {product.featured && (
          <Badge variant="gi" className="mb-1.5 self-start">
            Featured
          </Badge>
        )}
        <Link
          to={`/product/${product._id}`}
          className="block font-display text-lg leading-snug text-navy transition-colors hover:text-terracotta"
        >
          {product.title}
        </Link>
        {caption && (
          <div className="mt-0.5 font-body text-xs italic tracking-wide text-stone">
            {caption}
          </div>
        )}
        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <RatingStars value={rating} className="text-sm" />
            <span className="text-xs text-stone">{Number(rating).toFixed(1)}</span>
          </div>
        )}
        <div className="mt-auto pt-2 font-display text-xl font-semibold text-navy">
          {formatINR(product.price)}
        </div>
      </div>

      <Button size="sm" className="mt-3 w-full" onClick={() => addItem(product)}>
        Add to cart
      </Button>
    </Card>
  );
}
